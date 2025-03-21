
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

const STORAGE_KEY = "aihorizon_registration_data";

export const AffiliateService = {
  // Save registration data to local storage
  saveRegistrationData: (data: RegistrationData): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving registration data:", error);
    }
  },

  // Load registration data from local storage
  loadRegistrationData: (): RegistrationData | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error loading registration data:", error);
      return null;
    }
  },

  // Clear registration data from local storage
  clearRegistrationData: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing registration data:", error);
    }
  },

  // Create an affiliate link in Supabase database
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
  
  // Get all affiliate links for a user
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

  // Get a specific affiliate link for a user (the first one if they have multiple)
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

  // Generate a unique affiliate code for the user
  generateAffiliateLink: (userId: string, userData?: RegistrationData) => {
    // Get registration data if not provided
    if (!userData) {
      userData = AffiliateService.loadRegistrationData() || {};
    }
    
    // Use user data for a personalized link
    const baseUrl = "https://calendly.com/aihorizon98/30min";
    
    // Build query parameters with user information
    const params = new URLSearchParams();
    
    // Add ref parameter for tracking
    const userRef = userId.slice(0, 8);
    params.append("ref", userRef);
    
    // Add name if available
    if (userData.firstName || userData.lastName) {
      const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
      if (fullName) {
        params.append("name", fullName);
      }
    }
    
    // Add email if available
    if (userData.email) {
      params.append("email", userData.email);
    }
    
    // Add UTM parameters for performance tracking
    params.append("utm_source", "affiliate");
    params.append("utm_medium", "referral");
    params.append("utm_campaign", "aihorizon");
    params.append("utm_id", userId);
    params.append("utm_content", userRef);
    
    // Build the complete URL
    return `${baseUrl}?${params.toString()}`;
  },

  // Get affiliate statistics for a user
  getAffiliateStats: async (userId: string) => {
    // Initialize basic statistics
    const stats: AffiliateStats = {
      clicks: 0,
      conversions: 0,
      revenue: 0
    };

    try {
      // Get user's affiliate links
      const { data: links } = await AffiliateService.getUserAffiliateLinks(userId);
      
      if (links && links.length > 0) {
        // Get affiliate link IDs
        const linkIds = links.map(link => link.id);
        
        // Count clicks for these links
        const { count: clickCount, error: clickError } = await supabase
          .from("clicks")
          .select("*", { count: "exact", head: true })
          .in("affiliate_link_id", linkIds);
        
        if (clickCount !== null && !clickError) {
          stats.clicks = clickCount;
        }

        // Count conversions and calculate revenue
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

  // Get click history for a user's links
  getClickHistory: async (userId: string, limit = 10) => {
    try {
      // Get user's affiliate links
      const { data: links } = await AffiliateService.getUserAffiliateLinks(userId);
      
      if (!links || links.length === 0) {
        return { data: [], error: null };
      }
      
      // Get affiliate link IDs
      const linkIds = links.map(link => link.id);
      
      // Get clicks for these links
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

  // Get conversion history for a user's links
  getConversionHistory: async (userId: string, limit = 10) => {
    try {
      // Get user's affiliate links
      const { data: links } = await AffiliateService.getUserAffiliateLinks(userId);
      
      if (!links || links.length === 0) {
        return { data: [], error: null };
      }
      
      // Get affiliate link IDs
      const linkIds = links.map(link => link.id);
      
      // Get conversions for these links
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
  
  // Get performance data for chart
  getPerformanceData: async (userId: string, days = 30) => {
    try {
      // Get user's affiliate links
      const { data: links } = await AffiliateService.getUserAffiliateLinks(userId);
      
      if (!links || links.length === 0) {
        return { data: [], error: null };
      }
      
      // Get affiliate link IDs
      const linkIds = links.map(link => link.id);
      
      // Prepare dates for analysis period
      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() - days);
      
      // Get all clicks for the period
      const { data: clicksData, error: clicksError } = await supabase
        .from("clicks")
        .select("created_at")
        .in("affiliate_link_id", linkIds)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", today.toISOString());
        
      // Get all conversions for the period
      const { data: convsData, error: convsError } = await supabase
        .from("conversions")
        .select("created_at")
        .in("affiliate_link_id", linkIds)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", today.toISOString());
        
      if (clicksError || convsError) {
        return { data: [], error: clicksError || convsError };
      }
      
      // Create array for each day in period
      const performanceData = [];
      
      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (days - 1 - i));
        
        // Format date as YYYY-MM-DD for comparison
        const dateStr = date.toISOString().split('T')[0];
        
        // Count clicks for this day
        const clicksForDay = clicksData ? clicksData.filter(click => 
          click.created_at.startsWith(dateStr)
        ).length : 0;
        
        // Count conversions for this day
        const convsForDay = convsData ? convsData.filter(conv => 
          conv.created_at.startsWith(dateStr)
        ).length : 0;
        
        // Add to results array
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
  }
};
