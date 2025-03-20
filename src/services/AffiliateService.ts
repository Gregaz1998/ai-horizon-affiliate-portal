// Si le fichier est déjà défini, nous ne modifions que les fonctions suivantes
import { supabase } from "@/integrations/supabase/client";

interface RegistrationData {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  paymentMethod?: string;
  paypalEmail?: string;
  bankName?: string;
  accountNumber?: string;
  businessNumber?: string;
  acceptTerms?: boolean;
  acceptPrivacy?: boolean;
  hasBusinessNumber?: boolean;
  affiliateLink?: string;
  service?: string;
  country?: string;
  region?: string;
  emailConfirmationSent?: boolean;
  isEmailVerified?: boolean;
}

const STORAGE_KEY = "aihorizon_registration_data";

export const AffiliateService = {
  // Sauvegarde les données d'inscription dans le stockage local
  saveRegistrationData: (data: RegistrationData): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving registration data:", error);
    }
  },

  // Charge les données d'inscription depuis le stockage local
  loadRegistrationData: (): RegistrationData | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error loading registration data:", error);
      return null;
    }
  },

  // Efface les données d'inscription du stockage local
  clearRegistrationData: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing registration data:", error);
    }
  },

  // Crée un lien d'affiliation dans la base de données Supabase
  createAffiliateLink: async (userId: string, code: string) => {
    try {
      const { data, error } = await supabase
        .from("affiliate_links")
        .insert([
          { user_id: userId, code }
        ]);
      
      return { data, error };
    } catch (error) {
      console.error("Error in createAffiliateLink:", error);
      return { data: null, error };
    }
  },
  
  // Récupère les liens d'affiliation d'un utilisateur
  getUserAffiliateLinks: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("affiliate_links")
        .select("*")
        .eq("user_id", userId);
      
      return { data, error };
    } catch (error) {
      console.error("Error in getUserAffiliateLinks:", error);
      return { data: null, error };
    }
  }
};
