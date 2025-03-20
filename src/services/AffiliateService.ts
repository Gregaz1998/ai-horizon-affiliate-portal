
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

export interface AffiliateLink {
  id: string;
  user_id: string;
  code: string;
  created_at: string;
}

export interface AffiliateStats {
  clicks: number;
  conversions: number;
  revenue: number;
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
  },

  // Récupère un lien d'affiliation spécifique pour un utilisateur (le premier s'il en a plusieurs)
  getAffiliateLink: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("affiliate_links")
        .select("*")
        .eq("user_id", userId)
        .limit(1)
        .single();
      
      return { data, error };
    } catch (error) {
      console.error("Error in getAffiliateLink:", error);
      return { data: null, error };
    }
  },

  // Récupère les statistiques d'affiliation d'un utilisateur
  getAffiliateStats: async (userId: string) => {
    // Simule des statistiques de base pour le moment
    // À terme, cela pourrait être implémenté avec de vraies requêtes Supabase
    const stats: AffiliateStats = {
      clicks: 0,
      conversions: 0,
      revenue: 0
    };

    try {
      // Compte le nombre de clics pour les liens d'affiliation de l'utilisateur
      const { data: links } = await AffiliateService.getUserAffiliateLinks(userId);
      
      if (links && links.length > 0) {
        // Obtient les IDs des liens d'affiliation
        const linkIds = links.map(link => link.id);
        
        // Compte les clics pour ces liens
        const { count: clickCount, error: clickError } = await supabase
          .from("clicks")
          .select("*", { count: "exact", head: true })
          .in("affiliate_link_id", linkIds);
        
        if (clickCount !== null && !clickError) {
          stats.clicks = clickCount;
        }

        // Compte les conversions et calcule le revenu
        const { data: conversions, error: convError } = await supabase
          .from("conversions")
          .select("*")
          .in("affiliate_link_id", linkIds);
        
        if (conversions && !convError) {
          stats.conversions = conversions.length;
          stats.revenue = conversions.reduce((sum, conv) => sum + parseFloat(conv.amount), 0);
        }
      }
      
      return { data: stats, error: null };
    } catch (error) {
      console.error("Error in getAffiliateStats:", error);
      return { data: stats, error };
    }
  }
};
