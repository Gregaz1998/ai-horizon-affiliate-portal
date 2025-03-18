
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { AffiliateService } from "@/services/AffiliateService";

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
    name: "Finalisation",
    description: "Accès au dashboard",
    icon: LayoutDashboard
  },
];

const RegistrationSteps = () => {
  const [currentStep, setCurrentStep] = useState(1);
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
    acceptTerms: false,
    acceptPrivacy: false,
    affiliateLink: "",
    niche: "technology",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    
    // Clear error when field is edited
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
      if (!formData.acceptTerms) {
        newErrors.acceptTerms = "Vous devez accepter les conditions générales";
      }
      if (!formData.acceptPrivacy) {
        newErrors.acceptPrivacy = "Vous devez accepter la politique de confidentialité";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    try {
      const { error } = await signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        paymentMethod: formData.paymentMethod,
        paymentDetails: formData.paymentMethod === "paypal" 
          ? { paypalEmail: formData.paypalEmail }
          : { bankName: formData.bankName, accountNumber: formData.accountNumber },
        niche: formData.niche
      });
      
      if (error) {
        toast({
          title: "Erreur d'inscription",
          description: error.message,
          variant: "destructive",
        });
        setCurrentStep(1); // Return to first step
        return false;
      }
      
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
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      } else {
        // Final step - redirect to dashboard
        toast({
          title: "Inscription réussie !",
          description: "Vous allez être redirigé vers votre tableau de bord.",
        });
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateAffiliateLink = () => {
    const username = `${formData.firstName.toLowerCase()}${formData.lastName.toLowerCase()}`;
    const randomString = Math.random().toString(36).substring(2, 8);
    return `${username}-${randomString}`;
  };

  // Update affiliate link when step 4 is reached
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
                3. <strong>Commissions</strong> : Vous recevrez une commission sur chaque achat effectué par un utilisateur qui a utilisé votre lien d'affiliation. Le taux de commission est indiqué dans votre tableau de bord et peut être modifié à tout moment.
              </p>
              <p className="mb-4">
                4. <strong>Paiements</strong> : Les paiements sont effectués selon la méthode choisie une fois que le seuil minimum est atteint. Le seuil minimum et la fréquence des paiements sont indiqués dans votre tableau de bord.
              </p>
              <p className="mb-4">
                5. <strong>Respect des lois</strong> : Vous vous engagez à respecter toutes les lois et réglementations applicables, y compris celles relatives à la publicité, à la protection des données et au marketing.
              </p>
              <p className="mb-4">
                6. <strong>Interdictions</strong> : Il est interdit d'utiliser des techniques de spam, de fraude ou toute autre méthode déloyale pour promouvoir votre lien d'affiliation. AI Horizon se réserve le droit de suspendre ou de résilier votre compte en cas de violation.
              </p>
              <p className="mb-4">
                7. <strong>Modification des conditions</strong> : AI Horizon se réserve le droit de modifier les présentes conditions à tout moment. Les modifications prennent effet dès leur publication.
              </p>
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
                  Votre lien d'affiliation unique a été généré !
                </p>
                <div className="text-brand-purple font-semibold text-lg">
                  aihorizon.com/ref/{formData.affiliateLink}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="text-gray-800 font-medium truncate">
                  aihorizon.com/ref/{formData.affiliateLink}
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(`aihorizon.com/ref/${formData.affiliateLink}`);
                    toast({
                      description: "Lien copié dans le presse-papiers !",
                    });
                  }}
                >
                  Copier
                </Button>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="font-medium text-gray-800 mb-2">Spécifiez votre niche principale :</h3>
                <select
                  name="niche"
                  value={formData.niche}
                  onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="technology">Technologie & IA</option>
                  <option value="business">Business & Entrepreneuriat</option>
                  <option value="education">Éducation & Formation</option>
                  <option value="marketing">Marketing & Vente</option>
                  <option value="lifestyle">Lifestyle & Développement personnel</option>
                </select>
              </div>
              
              <div className="text-sm text-gray-600 p-4 bg-blue-50 rounded-lg">
                <p>
                  <strong>Conseil :</strong> Partagez votre lien sur vos réseaux sociaux, votre blog, ou votre site web pour commencer à générer des revenus. Vous pouvez suivre vos performances dans votre tableau de bord.
                </p>
              </div>
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
            className="space-y-6 text-center"
          >
            <div className="py-8">
              <div className="mx-auto bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold mb-4">Félicitations !</h2>
              
              <p className="text-gray-600 mb-8">
                Votre compte d'affilié a été créé avec succès. Vous allez maintenant être redirigé vers votre tableau de bord où vous pourrez commencer à suivre vos performances.
              </p>
              
              <Button 
                className="bg-brand-purple hover:bg-purple-700 text-white btn-hover-effect"
                size="lg"
                onClick={nextStep}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    Accéder au tableau de bord
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="hidden sm:block">
          <nav aria-label="Progress">
            <ol className="flex items-center">
              {steps.map((step, index) => (
                <li key={step.id} className={`relative ${index === steps.length - 1 ? "flex-1" : "flex-1"}`}>
                  <div className="group flex items-center">
                    <span className="flex items-center justify-center">
                      <span
                        className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full ${
                          step.id < currentStep
                            ? "bg-brand-purple"
                            : step.id === currentStep
                            ? "bg-purple-100 border-2 border-brand-purple"
                            : "bg-gray-100"
                        }`}
                      >
                        {step.id < currentStep ? (
                          <CheckCircle2 className="h-6 w-6 text-white" />
                        ) : (
                          <span
                            className={`text-sm font-medium ${
                              step.id === currentStep ? "text-brand-purple" : "text-gray-500"
                            }`}
                          >
                            <step.icon className="h-6 w-6" />
                          </span>
                        )}
                      </span>
                    </span>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 ${
                          step.id < currentStep ? "bg-brand-purple" : "bg-gray-200"
                        }`}
                      ></div>
                    )}
                  </div>
                  <div className="mt-2 flex justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {step.name}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>
        
        <div className="sm:hidden">
          <p className="text-sm font-medium mb-1">
            Étape {currentStep} sur {steps.length}
          </p>
          <div className="flex items-center space-x-2">
            <div className="bg-gray-200 h-2 flex-1 rounded-full overflow-hidden">
              <div
                className="bg-brand-purple h-full rounded-full"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium">{Math.round((currentStep / steps.length) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white shadow-sm rounded-2xl p-6 md:p-8 mb-8">
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1 || isLoading}
          className={currentStep === 1 ? "opacity-0" : ""}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Précédent
        </Button>
        
        <Button 
          onClick={currentStep === 5 ? handleSignUp : nextStep}
          className="bg-brand-purple hover:bg-purple-700 text-white btn-hover-effect"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Traitement...
            </>
          ) : (
            <>
              {currentStep === steps.length ? "Terminer" : "Suivant"}
              {currentStep !== steps.length && <ChevronRight className="ml-2 h-4 w-4" />}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default RegistrationSteps;
