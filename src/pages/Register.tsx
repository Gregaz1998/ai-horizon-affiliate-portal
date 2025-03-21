
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
  
  // Effet pour vérifier si l'utilisateur vient de confirmer son email
  useEffect(() => {
    const checkAndUpdateVerification = async () => {
      if (user) {
        const isEmailVerified = await checkEmailVerification();
        if (isEmailVerified) {
          setIsVerified(true);
          
          // Si l'utilisateur a confirmé son email, passer à l'étape 6
          setSearchParams({ step: "6" });
          
          // Mettre à jour les données stockées pour refléter la vérification
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

  // Si user est connecté et a terminé l'inscription (étape > 6 ou aucune étape spécifiée)
  // alors rediriger vers le dashboard
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      if (user) {
        const currentStep = searchParams.get("step") ? parseInt(searchParams.get("step") || "1") : 1;
        const savedData = AffiliateService.loadRegistrationData();
        
        // Vérifier si l'utilisateur a déjà un lien d'affiliation
        const { data: linkData } = await AffiliateService.getAffiliateLink(user.id);
        
        // Si l'utilisateur est à l'étape finale ou au-delà, ou s'il n'y a pas d'étape spécifiée
        // et qu'il a terminé l'inscription (a un lien d'affiliation)
        if ((currentStep > 6 || !searchParams.get("step"))) {
          if (linkData || savedData?.affiliateLink) {
            navigate("/dashboard");
          }
        } else if (currentStep === 6) {
          // Redirection automatique vers le tableau de bord après la dernière étape
          // Créer un lien si l'utilisateur n'en a pas encore
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

          <RegistrationSteps initialStep={currentStep} />
        </div>
      </section>
    </Layout>
  );
};

export default Register;
