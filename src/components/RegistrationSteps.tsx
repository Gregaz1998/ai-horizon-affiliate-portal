
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  User, 
  CreditCard, 
  FileText, 
  Link, 
  LayoutDashboard,
  Loader2,
  Building2,
  MapPin,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { AffiliateService } from "@/services/AffiliateService";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

const steps = [
  {
    id: 1,
    name: "Informations personnelles",
    description: "Vos coordonnées de base",
    icon: User
  },
  {
    id: 2,
    name: "Mode de paiement",
    description: "Comment recevoir vos gains",
    icon: CreditCard
  },
  {
    id: 3,
    name: "Conditions",
    description: "Termes et réglementation",
    icon: FileText
  },
  {
    id: 4,
    name: "Lien affilié",
    description: "Création de votre lien",
    icon: Link
  },
  {
    id: 5,
    name: "Vérification",
    description: "Vérification de l'e-mail",
    icon: CheckCircle2
  },
  {
    id: 6,
    name: "Finalisation",
    description: "Accès au dashboard",
    icon: LayoutDashboard
  },
];

const serviceOptions = [
  { value: "branding", label: "Branding et image de marque" },
  { value: "ai", label: "AUTOMATISATION IA" },
  { value: "video", label: "Tournage et Montage vidéos" },
  { value: "photo", label: "Séance photo professionnelle" },
  { value: "seo", label: "SEO/SEA (Référencement)" },
  { value: "web", label: "Création de Sites Web" },
  { value: "content", label: "Création de Contenu Digital" }
];

const countries = {
  "belgique": {
    label: "Belgique",
    regions: [
      "Bruxelles",
      "Anvers",
      "Liège",
      "Gand",
      "Charleroi",
      "Bruges",
      "Namur",
      "Louvain",
      "Mons",
      "Wavre"
    ]
  },
  "france": {
    label: "France",
    regions: [
      "Paris",
      "Marseille",
      "Lyon",
      "Toulouse",
      "Nice",
      "Nantes",
      "Strasbourg",
      "Montpellier",
      "Bordeaux",
      "Lille"
    ]
  },
  "luxembourg": {
    label: "Luxembourg",
    regions: [
      "Luxembourg-Ville",
      "Esch-sur-Alzette",
      "Differdange",
      "Dudelange",
      "Ettelbruck",
      "Diekirch",
      "Wiltz",
      "Echternach",
      "Rumelange",
      "Vianden"
    ]
  }
};

interface RegistrationStepsProps {
  initialStep?: number;
}

const RegistrationSteps = ({ initialStep = 1 }: RegistrationStepsProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    paymentMethod: "paypal",
    paypalEmail: "",
    bankName: "",
    accountNumber: "",
    businessNumber: "",
    acceptTerms: false,
    acceptPrivacy: false,
    hasBusinessNumber: true,
    affiliateLink: "",
    service: "branding",
    country: "belgique",
    region: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [emailConfirmationSent, setEmailConfirmationSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationCheckInterval, setVerificationCheckInterval] = useState<number | null>(null);
  const [manualVerifyDialogOpen, setManualVerifyDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUp, checkEmailVerification, user } = useAuth();

  useEffect(() => {
    setSearchParams({ step: currentStep.toString() });
  }, [currentStep, setSearchParams]);

  useEffect(() => {
    if (user && currentStep === 5) {
      checkVerificationStatus();
    }
  }, [user, currentStep]);

  useEffect(() => {
    const savedData = AffiliateService.loadRegistrationData();
    if (savedData) {
      setFormData(prev => ({
        ...prev,
        ...savedData
      }));
      
      toast({
        description: "Vos données ont été restaurées automatiquement.",
      });
    }

    if (currentStep === 5 && savedData) {
      if (savedData.emailConfirmationSent) {
        setEmailConfirmationSent(true);
      }
      if (savedData.isEmailVerified) {
        setIsEmailVerified(true);
      }
    }
  }, [toast, currentStep]);

  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      AffiliateService.saveRegistrationData({
        ...formData,
        emailConfirmationSent,
        isEmailVerified
      });
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [formData, emailConfirmationSent, isEmailVerified]);

  useEffect(() => {
    if (currentStep === 5 && emailConfirmationSent && !isEmailVerified) {
      checkVerificationStatus();
      
      const intervalId = window.setInterval(checkVerificationStatus, 10000);
      setVerificationCheckInterval(intervalId);
      
      return () => {
        if (intervalId) {
          clearInterval(intervalId);
          setVerificationCheckInterval(null);
        }
      };
    } else if (verificationCheckInterval) {
      clearInterval(verificationCheckInterval);
      setVerificationCheckInterval(null);
    }
  }, [currentStep, emailConfirmationSent, isEmailVerified]);

  const checkVerificationStatus = async () => {
    try {
      const verified = await checkEmailVerification();
      console.log("Email verification status:", verified);
      
      if (verified) {
        setIsEmailVerified(true);
        if (verificationCheckInterval) {
          clearInterval(verificationCheckInterval);
          setVerificationCheckInterval(null);
        }
        toast({
          title: "Email vérifié",
          description: "Votre adresse email a été vérifiée avec succès.",
        });
        setCurrentStep(6);
      }
    } catch (error) {
      console.error("Error in checkVerificationStatus:", error);
    }
  };

  const manuallyVerifyAndContinue = async () => {
    setIsLoading(true);
    try {
      setIsEmailVerified(true);
      setManualVerifyDialogOpen(false);
      
      // Save the current registration state
      AffiliateService.saveRegistrationData({
        ...formData,
        emailConfirmationSent: true,
        isEmailVerified: true
      });
      
      // Create affiliate link in database if user is logged in
      if (user) {
        await AffiliateService.createAffiliateLink(user.id, formData.affiliateLink);
      }
      
      // Advance to the final step and then redirect to dashboard
      setCurrentStep(6);
      
      toast({
        title: "Redirection...",
        description: "Vous êtes redirigé vers votre tableau de bord.",
      });
      
      // Short timeout to show the success message before navigating
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Error in manuallyVerifyAndContinue:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
    
    if (name === "country") {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        region: ""
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleRadioChange = (value: string) => {
    setFormData({
      ...formData,
      paymentMethod: value,
    });
  };

  const handleBusinessNumberChange = (value: string) => {
    setFormData({
      ...formData,
      hasBusinessNumber: value === "yes",
    });
    
    if (value === "no") {
      setShowContactDialog(true);
    }
    
    if (value === "no" && errors.businessNumber) {
      setErrors({
        ...errors,
        businessNumber: "",
      });
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (!formData.firstName) newErrors.firstName = "Le prénom est requis";
      if (!formData.lastName) newErrors.lastName = "Le nom est requis";
      if (!formData.email) {
        newErrors.email = "L'email est requis";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Format d'email invalide";
      }
      if (!formData.password) {
        newErrors.password = "Le mot de passe est requis";
      } else if (formData.password.length < 8) {
        newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
      }
    } else if (currentStep === 2) {
      if (formData.paymentMethod === "paypal" && !formData.paypalEmail) {
        newErrors.paypalEmail = "L'email PayPal est requis";
      } else if (formData.paymentMethod === "bank") {
        if (!formData.bankName) newErrors.bankName = "Le nom de la banque est requis";
        if (!formData.accountNumber) newErrors.accountNumber = "Le numéro de compte est requis";
      }
    } else if (currentStep === 3) {
      if (!formData.hasBusinessNumber) {
        setShowContactDialog(true);
        return false;
      }
      
      if (formData.hasBusinessNumber && !formData.businessNumber) {
        newErrors.businessNumber = "Le numéro d'entreprise est requis";
      }
      if (!formData.acceptTerms) {
        newErrors.acceptTerms = "Vous devez accepter les conditions générales";
      }
      if (!formData.acceptPrivacy) {
        newErrors.acceptPrivacy = "Vous devez accepter la politique de confidentialité";
      }
    } else if (currentStep === 4) {
      if (!formData.country) {
        newErrors.country = "Veuillez sélectionner un pays";
      }
      if (!formData.region) {
        newErrors.region = "Veuillez sélectionner une région";
      }
      if (!formData.service) {
        newErrors.service = "Veuillez sélectionner un service";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    try {
      const { error, user, emailConfirmationSent: confirmationRequired } = await signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        paymentMethod: formData.paymentMethod,
        paymentDetails: formData.paymentMethod === "paypal" 
          ? { paypalEmail: formData.paypalEmail }
          : { bankName: formData.bankName, accountNumber: formData.accountNumber },
        businessNumber: formData.businessNumber,
        service: formData.service,
        country: formData.country,
        region: formData.region
      });
      
      if (error) {
        toast({
          title: "Erreur d'inscription",
          description: error.message,
          variant: "destructive",
        });
        setCurrentStep(1);
        return false;
      }
      
      // Generate trackable affiliate link with UTM parameters
      const userId = user?.id || 'unknown';
      const baseUrl = "https://calendly.com/aihorizon98/30min";
      const utmParams = new URLSearchParams({
        utm_source: "affiliate",
        utm_medium: "calendly",
        utm_campaign: `${formData.service || 'default'}-${formData.country || 'all'}`,
        utm_id: userId,
        utm_content: formData.email.split('@')[0],
        ref: userId.substring(0, 8),
        name: `${formData.firstName.toUpperCase()} ${formData.lastName}`,
        email: formData.email
      });
      
      const calendlyAffiliateLink = `${baseUrl}?${utmParams.toString()}`;
      
      // Update form data with the generated link
      setFormData(prev => ({
        ...prev,
        affiliateLink: calendlyAffiliateLink
      }));
      
      if (confirmationRequired) {
        setEmailConfirmationSent(true);
        setCurrentStep(5);
        
        // Save data with updated affiliate link
        AffiliateService.saveRegistrationData({
          ...formData,
          affiliateLink: calendlyAffiliateLink,
          emailConfirmationSent: true,
          isEmailVerified: false
        });
        
        return true;
      }
      
      if (user && user.id) {
        // Save the affiliate link to the database
        const { error: linkError } = await AffiliateService.createAffiliateLink(
          user.id, 
          calendlyAffiliateLink
        );
        
        if (linkError) {
          console.error("Error creating affiliate link:", linkError);
          toast({
            title: "Erreur",
            description: "Votre compte a été créé mais nous n'avons pas pu générer votre lien d'affiliation. Veuillez contacter le support.",
            variant: "destructive",
          });
        }
      }
      
      // Clear registration data and redirect to dashboard
      AffiliateService.clearRegistrationData();
      
      toast({
        title: "Inscription réussie !",
        description: "Vous êtes redirigé vers votre tableau de bord.",
      });
      
      // Redirect to dashboard
      navigate("/dashboard");
      
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'inscription",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = async () => {
    if (validateStep()) {
      if (currentStep < steps.length - 1) {
        if (currentStep === 4) {
          const signupSuccess = await handleSignUp();
          if (!signupSuccess) return;
        } else {
          setCurrentStep(currentStep + 1);
        }
      } else if (currentStep === steps.length - 1) {
        if (isEmailVerified) {
          navigate("/dashboard");
        }
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1 && currentStep !== 5) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateAffiliateLink = () => {
    const baseUrl = "https://calendly.com/aihorizon98/30min";
    const params = new URLSearchParams({
      affiliate_email: encodeURIComponent(formData.email),
      utm_source: "affiliate",
      utm_medium: "calendly",
      utm_campaign: formData.service || "default"
    });
    return `${baseUrl}?${params.toString()}`;
  };

  if (currentStep === 4 && !formData.affiliateLink) {
    const generatedLink = generateAffiliateLink();
    setFormData({
      ...formData,
      affiliateLink: generatedLink,
    });
  }

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
  };

  const handleCloseContactDialog = () => {
    setShowContactDialog(false);
    navigate('/');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={stepVariants}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold mb-6">Informations personnelles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm">{errors.firstName}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
              )}
            </div>
          </motion.div>
        );
      
      case 2:
        return (
          <motion.div
            key="step2"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={stepVariants}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold mb-6">Mode de paiement</h2>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Choisissez comment vous souhaitez recevoir vos gains d'affiliation :
              </p>
              
              <RadioGroup 
                value={formData.paymentMethod} 
                onValueChange={handleRadioChange}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal" className="flex-grow cursor-pointer">
                    <div className="font-medium">PayPal</div>
                    <div className="text-sm text-gray-500">Recevez vos paiements directement sur votre compte PayPal.</div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <RadioGroupItem value="bank" id="bank" />
                  <Label htmlFor="bank" className="flex-grow cursor-pointer">
                    <div className="font-medium">Virement bancaire</div>
                    <div className="text-sm text-gray-500">Recevez vos paiements par virement bancaire.</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {formData.paymentMethod === "paypal" && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="paypalEmail">Email PayPal</Label>
                <Input
                  id="paypalEmail"
                  name="paypalEmail"
                  type="email"
                  value={formData.paypalEmail}
                  onChange={handleInputChange}
                  className={errors.paypalEmail ? "border-red-500" : ""}
                />
                {errors.paypalEmail && (
                  <p className="text-red-500 text-sm">{errors.paypalEmail}</p>
                )}
              </div>
            )}

            {formData.paymentMethod === "bank" && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Nom de la banque</Label>
                  <Input
                    id="bankName"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    className={errors.bankName ? "border-red-500" : ""}
                  />
                  {errors.bankName && (
                    <p className="text-red-500 text-sm">{errors.bankName}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Numéro de compte</Label>
                  <Input
                    id="accountNumber"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    className={errors.accountNumber ? "border-red-500" : ""}
                  />
                  {errors.accountNumber && (
                    <p className="text-red-500 text-sm">{errors.accountNumber}</p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        );
      
      case 3:
        return (
          <motion.div
            key="step3"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={stepVariants}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold mb-6">Conditions d'utilisation</h2>
            
            <div className="h-64 overflow-y-auto p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700 mb-4">
              <h3 className="font-bold text-base mb-2">Termes et conditions du programme d'affiliation</h3>
              <p className="mb-4">
                1. <strong>Acceptation des conditions</strong> : En vous inscrivant au programme d'affiliation d'AI Horizon, vous acceptez d'être lié par les présentes conditions générales.
              </p>
              <p className="mb-4">
                2. <strong>Admissibilité</strong> : Pour participer au programme d'affiliation, vous devez avoir au moins 18 ans et détenir un compte utilisateur valide.
              </p>
              <p className="mb-4">
                3. <strong>Numéro d'entreprise obligatoire</strong> : Vous devez disposer d'un numéro d'entreprise valide pour participer au programme d'affiliation et recevoir des commissions.
              </p>
              <p className="mb-4">
                4. <strong>Commissions</strong> : Vous recevrez une commission sur chaque achat effectué par un utilisateur qui a utilisé votre lien d'affiliation. Le taux de commission est indiqué dans votre tableau de bord et peut être modifié à tout moment.
              </p>
              <p className="mb-4">
                5. <strong>Paiements</strong> : Les paiements sont effectués selon la méthode choisie une fois que le seuil minimum est atteint. Le seuil minimum et la fréquence des paiements sont indiqués dans votre tableau de bord.
              </p>
              <p className="mb-4">
                6. <strong>Respect des lois</strong> : Vous vous engagez à respecter toutes les lois et réglementations applicables, y compris celles relatives à la publicité, à la protection des données et au marketing.
              </p>
              <p className="mb-4">
                7. <strong>Interdictions</strong> : Il est interdit d'utiliser des techniques de spam, de fraude ou toute autre méthode déloyale pour promouvoir votre lien d'affiliation. AI Horizon se réserve le droit de suspendre ou de résilier votre compte en cas de violation.
              </p>
              <p className="mb-4">
                8. <strong>Modification des conditions</strong> : AI Horizon se réserve le droit de modifier les présentes conditions à tout moment. Les modifications prennent effet dès leur publication.
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-6">
              <div className="flex items-start">
                <Building2 className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-800">Numéro d'entreprise requis</h3>
                  <p className="text-sm text-blue-700 mb-2">
                    Pour participer au programme d'affiliation, vous devez disposer d'un numéro d'entreprise valide.
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <RadioGroup 
                  value={formData.hasBusinessNumber ? "yes" : "no"} 
                  onValueChange={handleBusinessNumberChange}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="has-business-number" />
                    <Label htmlFor="has-business-number" className="cursor-pointer">
                      J'ai un numéro d'entreprise
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no-business-number" />
                    <Label htmlFor="no-business-number" className="cursor-pointer">
                      Je n'ai pas encore de numéro d'entreprise
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              {formData.hasBusinessNumber ? (
                <div className="mt-4 space-y-2">
                  <Label htmlFor="businessNumber">Votre numéro d'entreprise</Label>
                  <Input
                    id="businessNumber"
                    name="businessNumber"
                    value={formData.businessNumber}
                    onChange={handleInputChange}
                    placeholder="ex: BE0123.456.789"
                    className={errors.businessNumber ? "border-red-500" : ""}
                  />
                  {errors.businessNumber && (
                    <p className="text-red-500 text-sm">{errors.businessNumber}</p>
                  )}
                </div>
              ) : (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 mb-2 flex items-start">
                    <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Un numéro d'entreprise est obligatoire pour continuer. Veuillez nous contacter pour obtenir de l'aide.</span>
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acceptTerms"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => 
                    setFormData({
                      ...formData,
                      acceptTerms: checked === true,
                    })
                  }
                />
                <Label htmlFor="acceptTerms" className="text-sm font-normal">
                  J'accepte les termes et conditions du programme d'affiliation
                </Label>
              </div>
              {errors.acceptTerms && (
                <p className="text-red-500 text-sm">{errors.acceptTerms}</p>
              )}
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acceptPrivacy"
                  name="acceptPrivacy"
                  checked={formData.acceptPrivacy}
                  onCheckedChange={(checked) => 
                    setFormData({
                      ...formData,
                      acceptPrivacy: checked === true,
                    })
                  }
                />
                <Label htmlFor="acceptPrivacy" className="text-sm font-normal">
                  J'accepte la politique de confidentialité et le traitement de mes données
                </Label>
              </div>
              {errors.acceptPrivacy && (
                <p className="text-red-500 text-sm">{errors.acceptPrivacy}</p>
              )}
            </div>
          </motion.div>
        );
      
      case 4:
        return (
          <motion.div
            key="step4"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={stepVariants}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold mb-6">Votre lien d'affiliation</h2>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
              <div className="text-center space-y-2">
                <p className="text-gray-600">
                  Votre lien d'affiliation Calendly unique a été généré !
                </p>
                <div className="text-brand-purple font-semibold text-lg break-all">
                  {formData.affiliateLink}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="text-gray-800 font-medium truncate max-w-[70%]">
                  {formData.affiliateLink}
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(formData.affiliateLink);
                    toast({
                      description: "Lien copié dans le presse-papiers !",
                    });
                  }}
                >
                  Copier
                </Button>
              </div>
              
              <div className="pt-4 border-t space-y-6">
                <div>
                  <h3 className="font-medium text-gray-800 mb-3">Niche dans laquelle vous souhaitez prospecter :</h3>
                  <Select 
                    value={formData.service} 
                    onValueChange={(value) => handleSelectChange("service", value)}
                  >
                    <SelectTrigger className={errors.service ? "border-red-500" : ""}>
                      <SelectValue placeholder="Sélectionnez un service" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.service && (
                    <p className="text-red-500 text-sm mt-1">{errors.service}</p>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-800 mb-3">Pays ciblé :</h3>
                    <Select 
                      value={formData.country} 
                      onValueChange={(value) => handleSelectChange("country", value)}
                    >
                      <SelectTrigger className={errors.country ? "border-red-500" : ""}>
                        <SelectValue placeholder="Sélectionnez un pays" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(countries).map(([key, { label }]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.country && (
                      <p className="text-red-500 text-sm mt-1">{errors.country}</p>
                    )}
                  </div>
                  
                  {formData.country && (
                    <div>
                      <h3 className="font-medium text-gray-800 mb-3">Région ciblée :</h3>
                      <Select 
                        value={formData.region} 
                        onValueChange={(value) => handleSelectChange("region", value)}
                      >
                        <SelectTrigger className={errors.region ? "border-red-500" : ""}>
                          <SelectValue placeholder="Sélectionnez une région" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries[formData.country as keyof typeof countries]?.regions.map((region) => (
                            <SelectItem key={region} value={region}>
                              {region}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.region && (
                        <p className="text-red-500 text-sm mt-1">{errors.region}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-medium text-amber-800 mb-2">Comment ça marche :</h3>
              <ul className="text-sm text-amber-700 space-y-2">
                <li className="flex items-start">
                  <span className="font-bold mr-2">1.</span>
                  <span>Partagez votre lien d'affiliation avec vos prospects.</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">2.</span>
                  <span>Lorsqu'ils réservent un rendez-vous via Calendly, vous recevrez une commission.</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">3.</span>
                  <span>Suivez vos statistiques et vos gains en temps réel sur votre tableau de bord.</span>
                </li>
              </ul>
            </div>
          </motion.div>
        );
      
      case 5:
        return (
          <motion.div
            key="step5"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={stepVariants}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold mb-6">Vérification de votre email</h2>
            
            {!emailConfirmationSent ? (
              <div className="text-center py-8">
                <div className="flex justify-center mb-6">
                  <Loader2 className="h-12 w-12 animate-spin text-brand-purple" />
                </div>
                <p className="text-gray-600 mb-4">
                  Envoi de l'email de confirmation en cours...
                </p>
              </div>
            ) : isEmailVerified ? (
              <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  Email vérifié avec succès !
                </h3>
                <p className="text-green-700 mb-6">
                  Votre adresse email a été confirmée. Vous pouvez maintenant accéder à votre tableau de bord.
                </p>
                <Button onClick={() => navigate('/dashboard')}>
                  Accéder à mon tableau de bord
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                      <CheckCircle2 className="h-12 w-12 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-blue-800 mb-2">
                      Email de confirmation envoyé !
                    </h3>
                    <p className="text-blue-700">
                      Un email de confirmation a été envoyé à <span className="font-semibold">{formData.email}</span>.
                      Veuillez vérifier votre boîte de réception et cliquer sur le lien pour confirmer votre adresse email.
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2 mb-6">
                    <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse delay-150"></div>
                    <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse delay-300"></div>
                  </div>
                  
                  <div className="text-center text-sm text-blue-700">
                    En attente de confirmation...
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-800 mb-3">Conseils :</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>Vérifiez votre dossier spam si vous ne trouvez pas l'email.</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>L'email peut prendre quelques minutes pour arriver.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setManualVerifyDialogOpen(true)}
                  >
                    Continuer sans vérification
                  </Button>
                </div>
              </div>
            )}
            
            <Dialog open={manualVerifyDialogOpen} onOpenChange={setManualVerifyDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Continuer sans vérification d'email</DialogTitle>
                  <DialogDescription>
                    Vous pouvez continuer sans vérifier votre email, mais certaines fonctionnalités pourraient être limitées.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-amber-600 flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      Nous vous recommandons de vérifier votre email dès que possible pour profiter de toutes les fonctionnalités du programme d'affiliation.
                    </span>
                  </p>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setManualVerifyDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button 
                    onClick={manuallyVerifyAndContinue}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Chargement...
                      </>
                    ) : (
                      "Continuer vers le tableau de bord"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Numéro d'entreprise requis</DialogTitle>
                  <DialogDescription>
                    Pour participer au programme d'affiliation, vous devez disposer d'un numéro d'entreprise valide.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p>
                    Veuillez nous contacter si vous avez besoin d'aide pour obtenir un numéro d'entreprise ou si vous avez des questions concernant cette exigence.
                  </p>
                </div>
                <DialogFooter>
                  <Button onClick={handleCloseContactDialog}>
                    Compris
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>
        );
        
      case 6:
        return (
          <motion.div
            key="step6"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={stepVariants}
            className="space-y-6 text-center"
          >
            <div className="py-8">
              <div className="flex justify-center mb-6">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Félicitations !</h2>
              <p className="text-gray-600 mb-8">
                Votre inscription est complète. Vous êtes maintenant membre du programme d'affiliation AI Horizon.
              </p>
              
              <Button 
                size="lg" 
                onClick={() => navigate('/dashboard')}
                className="px-8"
              >
                Accéder à mon tableau de bord
              </Button>
            </div>
          </motion.div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Steps indicator */}
      <div className="hidden md:block mb-12">
        <nav aria-label="Progress">
          <ol className="flex justify-between">
            {steps.map((step) => (
              <li key={step.id} className={`relative ${
                step.id === currentStep
                  ? "text-brand-purple font-semibold"
                  : step.id < currentStep
                  ? "text-brand-purple"
                  : "text-gray-400"
              }`}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                    step.id === currentStep
                      ? "bg-brand-purple text-white"
                      : step.id < currentStep
                      ? "bg-brand-purple text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}>
                    {step.id < currentStep ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="mt-2 text-xs text-center hidden sm:block">
                    <div>{step.name}</div>
                    <div className={step.id === currentStep ? "text-gray-500" : "hidden"}>
                      {step.description}
                    </div>
                  </div>
                </div>
                
                {step.id !== steps.length && (
                  <div className="hidden md:block absolute top-4 left-0 right-0 h-0.5 -translate-y-1/2">
                    <div className="h-0.5 w-full bg-gray-200">
                      <div
                        className="h-0.5 bg-brand-purple transition-all"
                        style={{
                          width: step.id < currentStep ? "100%" : "0%",
                        }}
                      />
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Mobile steps indicator */}
      <div className="block md:hidden mb-8">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">
            Étape {currentStep} sur {steps.length}
          </div>
          <div className="text-xs text-gray-500">
            {steps[currentStep - 1].name}
          </div>
        </div>
        <div className="mt-2 h-2 w-full bg-gray-200 rounded-full">
          <div
            className="h-2 bg-brand-purple rounded-full transition-all"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Form content */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 mb-8">
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      {currentStep !== 5 && currentStep !== 6 && (
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center"
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Précédent
          </Button>
          <Button
            onClick={nextStep}
            disabled={isLoading}
            className="flex items-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Chargement...
              </>
            ) : (
              <>
                Suivant <ChevronRight className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default RegistrationSteps;
