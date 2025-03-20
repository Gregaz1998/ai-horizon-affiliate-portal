
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import RegistrationSteps from "@/components/RegistrationSteps";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { AffiliateService } from "@/services/AffiliateService";

const Register = () => {
  const { user, checkEmailVerification } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isVerified, setIsVerified] = useState(false);
  
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

  // Si user est déjà connecté et qu'il n'est pas en train de terminer son inscription
  if (user && isVerified && !searchParams.get("step")) {
    return <Navigate to="/dashboard" replace />;
  }

  // Get the current step from URL params or default to step 1
  const currentStep = searchParams.get("step") ? parseInt(searchParams.get("step") || "1") : 1;

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
