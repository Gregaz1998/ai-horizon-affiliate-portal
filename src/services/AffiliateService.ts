
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

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

export interface ConversionData {
  id: string;
  affiliate_link_id: string;
  product: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface ClickData {
  id: string;
  affiliate_link_id: string;
  created_at: string;
}

export class AffiliateService {
  static realtimeChannel: RealtimeChannel | null = null;

  static async createAffiliateLink(userId: string, code: string): Promise<{ data: AffiliateLink | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('affiliate_links')
        .insert([
          { user_id: userId, code }
        ])
        .select()
        .single();

      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error("Error creating affiliate link:", error);
      return { data: null, error: error as Error };
    }
  }

  static async getAffiliateLink(userId: string): Promise<{ data: AffiliateLink | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('affiliate_links')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error("Error getting affiliate link:", error);
      return { data: null, error: error as Error };
    }
  }

  static async getAffiliateStats(userId: string): Promise<{ data: AffiliateStats | null; error: Error | null }> {
    try {
      // Get the affiliate link for this user
      const { data: affiliateLink, error: linkError } = await this.getAffiliateLink(userId);
      
      if (linkError) throw linkError;
      if (!affiliateLink) return { data: { clicks: 0, conversions: 0, revenue: 0 }, error: null };

      // Get clicks count
      const { count: clicks, error: clicksError } = await supabase
        .from('clicks')
        .select('*', { count: 'exact', head: true })
        .eq('affiliate_link_id', affiliateLink.id);

      if (clicksError) throw clicksError;

      // Get conversions and revenue
      const { data: conversions, error: conversionsError } = await supabase
        .from('conversions')
        .select('*')
        .eq('affiliate_link_id', affiliateLink.id);

      if (conversionsError) throw conversionsError;

      const revenue = conversions.reduce((sum, conversion) => sum + conversion.amount, 0);

      return { 
        data: { 
          clicks: clicks || 0, 
          conversions: conversions.length, 
          revenue 
        }, 
        error: null 
      };
    } catch (error) {
      console.error("Error getting affiliate stats:", error);
      return { data: null, error: error as Error };
    }
  }

  static async getConversions(userId: string): Promise<{ data: ConversionData[] | null; error: Error | null }> {
    try {
      const { data: affiliateLink, error: linkError } = await this.getAffiliateLink(userId);
      
      if (linkError) throw linkError;
      if (!affiliateLink) return { data: [], error: null };

      const { data, error } = await supabase
        .from('conversions')
        .select('*')
        .eq('affiliate_link_id', affiliateLink.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error("Error getting conversions:", error);
      return { data: null, error: error as Error };
    }
  }

  static async getClicks(userId: string): Promise<{ data: ClickData[] | null; error: Error | null }> {
    try {
      const { data: affiliateLink, error: linkError } = await this.getAffiliateLink(userId);
      
      if (linkError) throw linkError;
      if (!affiliateLink) return { data: [], error: null };

      const { data, error } = await supabase
        .from('clicks')
        .select('*')
        .eq('affiliate_link_id', affiliateLink.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error("Error getting clicks:", error);
      return { data: null, error: error as Error };
    }
  }

  // For testing only: Simulate a click on an affiliate link
  static async simulateClick(affiliateLinkId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase
        .from('clicks')
        .insert([
          { 
            affiliate_link_id: affiliateLinkId, 
            ip_address: '127.0.0.1', 
            user_agent: 'test-agent', 
            referrer: 'test-referrer' 
          }
        ]);

      if (error) throw error;
      
      return { success: true, error: null };
    } catch (error) {
      console.error("Error simulating click:", error);
      return { success: false, error: error as Error };
    }
  }

  // For testing only: Simulate a conversion
  static async simulateConversion(affiliateLinkId: string, amount: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase
        .from('conversions')
        .insert([
          { 
            affiliate_link_id: affiliateLinkId, 
            product: 'Test Product', 
            amount: parseFloat(amount),
            status: 'completed'
          }
        ]);

      if (error) throw error;
      
      return { success: true, error: null };
    } catch (error) {
      console.error("Error simulating conversion:", error);
      return { success: false, error: error as Error };
    }
  }

  // Set up realtime listeners for clicks and conversions
  static setupRealtimeListeners(affiliateLinkId: string, onUpdate: () => void): void {
    // Clean up any existing channel
    if (this.realtimeChannel) {
      this.realtimeChannel.unsubscribe();
    }

    this.realtimeChannel = supabase
      .channel('affiliate-updates')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'clicks',
        filter: `affiliate_link_id=eq.${affiliateLinkId}`
      }, () => {
        console.log('New click detected');
        onUpdate();
      })
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'conversions',
        filter: `affiliate_link_id=eq.${affiliateLinkId}`
      }, () => {
        console.log('New conversion detected');
        onUpdate();
      })
      .subscribe();
  }

  // Save registration form data to local storage
  static saveRegistrationData(formData: any): void {
    localStorage.setItem('registrationData', JSON.stringify(formData));
  }

  // Load registration form data from local storage
  static loadRegistrationData(): any {
    const savedData = localStorage.getItem('registrationData');
    return savedData ? JSON.parse(savedData) : null;
  }

  // Clear registration data from local storage
  static clearRegistrationData(): void {
    localStorage.removeItem('registrationData');
  }
}
