
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import RegistrationSteps from "@/components/RegistrationSteps";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { AffiliateService } from "@/services/AffiliateService";

const Register = () => {
  const { user, checkEmailVerification } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();
  
  // Get current step from URL params or default to 1
  const step = searchParams.get("step") ? parseInt(searchParams.get("step") || "1") : 1;
  
  // Effect to check if the user just confirmed their email
  useEffect(() => {
    const checkAndUpdateVerification = async () => {
      if (user) {
        const isEmailVerified = await checkEmailVerification();
        if (isEmailVerified) {
          setIsVerified(true);
          
          // If the user confirmed their email, move to step 6
          setSearchParams({ step: "6" });
          
          // Update stored data to reflect verification
          const savedData = AffiliateService.loadRegistrationData();
          if (savedData) {
            AffiliateService.saveRegistrationData({
              ...savedData,
              emailConfirmationSent: true,
              isEmailVerified: true
            });
          }
        }
      }
    };
    
    checkAndUpdateVerification();
  }, [user, checkEmailVerification, setSearchParams]);

  // If user is connected and has completed registration (step > 6 or no step specified)
  // then redirect to dashboard
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      if (user) {
        const currentStep = searchParams.get("step") ? parseInt(searchParams.get("step") || "1") : 1;
        const savedData = AffiliateService.loadRegistrationData();
        
        // Check if user already has an affiliate link
        const { data: linkData } = await AffiliateService.getAffiliateLink(user.id);
        
        // If user is at final step or beyond, or if no step specified
        // and has completed registration (has an affiliate link)
        if ((currentStep > 6 || !searchParams.get("step"))) {
          if (linkData || savedData?.affiliateLink) {
            navigate("/dashboard");
          }
        } else if (currentStep === 6) {
          // Automatic redirect to dashboard after last step
          // Create link if user doesn't have one yet
          if (!linkData) {
            const generatedLink = AffiliateService.generateAffiliateLink(user.id, savedData);
            await AffiliateService.createAffiliateLink(user.id, generatedLink);
          }
          navigate("/dashboard");
        }
      }
    };
    
    checkRegistrationStatus();
  }, [user, searchParams, navigate]);

  return (
    <Layout>
      <section className="pt-32 pb-20">
        <div className="responsive-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center mb-12"
          >
            <span className="inline-block px-3 py-1 bg-purple-100 text-brand-purple rounded-full text-sm font-medium mb-4">
              Programme d'affiliation
            </span>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Rejoignez notre réseau d'affiliés
            </h1>
            <p className="text-lg text-gray-600">
              Créez votre compte en quelques étapes simples et commencez à générer des revenus dès aujourd'hui.
            </p>
          </motion.div>

          <RegistrationSteps initialStep={step} />
        </div>
      </section>
    </Layout>
  );
};

export default Register;
