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

export interface ClickEvent {
  id: string;
  created_at: string;
  referrer: string | null;
}

export interface ConversionEvent {
  id: string;
  created_at: string;
  product: string;
  amount: number;
  status: string | null;
}

export interface CommissionTier {
  id: number;
  name: string;
  min_revenue: number;
  max_revenue: number | null;
  commission_rate: number;
  color: string;
  created_at: string;
}

export interface UserProgression {
  id: string;
  user_id: string;
  current_tier_id: number;
  total_revenue: number;
  total_commission: number;
  manual_override: boolean;
  created_at: string;
  updated_at: string;
  tier?: CommissionTier;
}

export interface CommissionExample {
  description: string;
  value: number;
  commission: number;
}

const STORAGE_KEY = "aihorizon_registration_data";

export const AffiliateService = {
  saveRegistrationData: (data: RegistrationData): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving registration data:", error);
    }
  },

  loadRegistrationData: (): RegistrationData | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error loading registration data:", error);
      return null;
    }
  },

  clearRegistrationData: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing registration data:", error);
    }
  },

  createAffiliateLink: async (userId: string, code: string) => {
    try {
      console.log("Creating affiliate link for user:", userId, "with code:", code);
      const { data, error } = await supabase
        .from("affiliate_links")
        .insert([
          { user_id: userId, code }
        ])
        .select()
        .single();
      
      if (error) {
        console.error("Error creating affiliate link:", error);
      } else {
        console.log("Affiliate link created successfully:", data);
      }
      
      return { data, error };
    } catch (error) {
      console.error("Error in createAffiliateLink:", error);
      return { data: null, error };
    }
  },

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

  getAffiliateLink: async (userId: string) => {
    try {
      console.log("Getting affiliate link for user:", userId);
      const { data, error } = await supabase
        .from("affiliate_links")
        .select("*")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();
      
      console.log("Affiliate link result:", data, error);
      return { data, error };
    } catch (error) {
      console.error("Error in getAffiliateLink:", error);
      return { data: null, error };
    }
  },

  generateAffiliateLink: (userId: string, userData?: RegistrationData) => {
    if (!userData) {
      userData = AffiliateService.loadRegistrationData() || {};
    }
    
    const baseUrl = "https://calendly.com/aihorizon98/30min";
    
    const params = new URLSearchParams();
    
    const userRef = userId.slice(0, 8);
    params.append("ref", userRef);
    
    if (userData.firstName || userData.lastName) {
      const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
      if (fullName) {
        params.append("name", fullName);
      }
    }
    
    if (userData.email) {
      params.append("email", userData.email);
    }
    
    params.append("utm_source", "affiliate");
    params.append("utm_medium", "referral");
    params.append("utm_campaign", "aihorizon");
    params.append("utm_id", userId);
    params.append("utm_content", userRef);
    
    return `${baseUrl}?${params.toString()}`;
  },

  getAffiliateStats: async (userId: string) => {
    const stats: AffiliateStats = {
      clicks: 0,
      conversions: 0,
      revenue: 0
    };

    try {
      const { data: links } = await AffiliateService.getUserAffiliateLinks(userId);
      
      if (links && links.length > 0) {
        const linkIds = links.map(link => link.id);
        
        const { count: clickCount, error: clickError } = await supabase
          .from("clicks")
          .select("*", { count: "exact", head: true })
          .in("affiliate_link_id", linkIds);
        
        if (clickCount !== null && !clickError) {
          stats.clicks = clickCount;
        }

        const { data: conversions, error: convError } = await supabase
          .from("conversions")
          .select("*")
          .in("affiliate_link_id", linkIds);
        
        if (conversions && !convError) {
          stats.conversions = conversions.length;
          stats.revenue = conversions.reduce((sum, conv) => sum + (conv.amount as number), 0);
        }
      }
      
      return { data: stats, error: null };
    } catch (error) {
      console.error("Error in getAffiliateStats:", error);
      return { data: stats, error };
    }
  },

  getClickHistory: async (userId: string, limit = 10) => {
    try {
      const { data: links } = await AffiliateService.getUserAffiliateLinks(userId);
      
      if (!links || links.length === 0) {
        return { data: [], error: null };
      }
      
      const linkIds = links.map(link => link.id);
      
      const { data, error } = await supabase
        .from("clicks")
        .select("id, created_at, referrer")
        .in("affiliate_link_id", linkIds)
        .order("created_at", { ascending: false })
        .limit(limit);
      
      return { data, error };
    } catch (error) {
      console.error("Error in getClickHistory:", error);
      return { data: [], error };
    }
  },

  getConversionHistory: async (userId: string, limit = 10) => {
    try {
      const { data: links } = await AffiliateService.getUserAffiliateLinks(userId);
      
      if (!links || links.length === 0) {
        return { data: [], error: null };
      }
      
      const linkIds = links.map(link => link.id);
      
      const { data, error } = await supabase
        .from("conversions")
        .select("id, created_at, product, amount, status")
        .in("affiliate_link_id", linkIds)
        .order("created_at", { ascending: false })
        .limit(limit);
      
      return { data, error };
    } catch (error) {
      console.error("Error in getConversionHistory:", error);
      return { data: [], error };
    }
  },
  
  getPerformanceData: async (userId: string, days = 30) => {
    try {
      const { data: links } = await AffiliateService.getUserAffiliateLinks(userId);
      
      if (!links || links.length === 0) {
        return { data: [], error: null };
      }
      
      const linkIds = links.map(link => link.id);
      
      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() - days);
      
      const { data: clicksData, error: clicksError } = await supabase
        .from("clicks")
        .select("created_at")
        .in("affiliate_link_id", linkIds)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", today.toISOString());
        
      const { data: convsData, error: convsError } = await supabase
        .from("conversions")
        .select("created_at")
        .in("affiliate_link_id", linkIds)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", today.toISOString());
        
      if (clicksError || convsError) {
        return { data: [], error: clicksError || convsError };
      }
      
      const performanceData = [];
      
      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (days - 1 - i));
        
        const dateStr = date.toISOString().split('T')[0];
        
        const clicksForDay = clicksData ? clicksData.filter(click => 
          click.created_at.startsWith(dateStr)
        ).length : 0;
        
        const convsForDay = convsData ? convsData.filter(conv => 
          conv.created_at.startsWith(dateStr)
        ).length : 0;
        
        performanceData.push({
          name: `${date.getDate()}/${date.getMonth() + 1}`,
          clicks: clicksForDay,
          conversions: convsForDay
        });
      }
      
      return { data: performanceData, error: null };
    } catch (error) {
      console.error("Error in getPerformanceData:", error);
      return { data: [], error };
    }
  },

  getCommissionTiers: async () => {
    try {
      const { data, error } = await supabase
        .from("commission_tiers")
        .select("*")
        .order("min_revenue", { ascending: true });
      
      return { data, error };
    } catch (error) {
      console.error("Error in getCommissionTiers:", error);
      return { data: null, error };
    }
  },

  getUserProgression: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_progression")
        .select(`
          *,
          tier:current_tier_id(*)
        `)
        .eq("user_id", userId)
        .single();
      
      if (!data && !error) {
        const { data: lowestTier } = await supabase
          .from("commission_tiers")
          .select("*")
          .order("min_revenue", { ascending: true })
          .limit(1)
          .single();
        
        if (lowestTier) {
          const { data: newProgression, error: insertError } = await supabase
            .from("user_progression")
            .insert({
              user_id: userId,
              current_tier_id: lowestTier.id,
              total_revenue: 0,
              total_commission: 0
            })
            .select(`
              *,
              tier:current_tier_id(*)
            `)
            .single();
          
          return { data: newProgression, error: insertError };
        }
      }
      
      return { data, error };
    } catch (error) {
      console.error("Error in getUserProgression:", error);
      return { data: null, error };
    }
  },

  getCommissionExamples: (tiers: CommissionTier[]): { tier: CommissionTier, examples: CommissionExample[] }[] => {
    if (!tiers || tiers.length === 0) return [];
    
    return tiers.map(tier => {
      let examples: CommissionExample[] = [];
      
      switch(tier.name) {
        case 'Bronze':
          examples = [{
            description: '1 logo à 200€',
            value: 200,
            commission: 200 * (tier.commission_rate / 100)
          }];
          break;
        case 'Argent':
          examples = [{
            description: '5 logos (1000€)',
            value: 1000,
            commission: 1000 * (tier.commission_rate / 100)
          }];
          break;
        case 'Or':
          examples = [{
            description: 'Site à 3000€',
            value: 3000,
            commission: 3000 * (tier.commission_rate / 100)
          }];
          break;
        case 'Platine':
          examples = [{
            description: 'Presta à 8000€',
            value: 8000,
            commission: 8000 * (tier.commission_rate / 100)
          }];
          break;
        case 'Diamant':
          examples = [{
            description: 'Presta à 10 000€',
            value: 10000,
            commission: 10000 * (tier.commission_rate / 100)
          }];
          break;
        case 'Légende':
          examples = [{
            description: 'Ventes cumulées à 25 000€',
            value: 25000,
            commission: 25000 * (tier.commission_rate / 100)
          }];
          break;
        default:
          break;
      }
      
      return {
        tier,
        examples
      };
    });
  }
};
