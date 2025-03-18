
import { supabase } from "@/integrations/supabase/client";

export const AffiliateService = {
  async createAffiliateLink(userId: string, customCode?: string): Promise<string | null> {
    try {
      const code = customCode || this.generateAffiliateCode();
      
      const { data, error } = await supabase
        .from('affiliate_links')
        .insert([
          { user_id: userId, code: code }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      return data.code;
    } catch (error) {
      console.error('Error creating affiliate link:', error);
      return null;
    }
  },

  async getAffiliateLink(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('affiliate_links')
        .select('code')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        // If no link exists, create one
        if (error.code === 'PGRST116') {
          return this.createAffiliateLink(userId);
        }
        throw error;
      }
      
      return data.code;
    } catch (error) {
      console.error('Error getting affiliate link:', error);
      return null;
    }
  },

  async trackClick(code: string): Promise<boolean> {
    try {
      // First get the affiliate link id
      const { data: linkData, error: linkError } = await supabase
        .from('affiliate_links')
        .select('id')
        .eq('code', code)
        .single();
      
      if (linkError) throw linkError;
      
      // Then track the click
      const { error } = await supabase
        .from('clicks')
        .insert([
          { 
            affiliate_link_id: linkData.id,
            referrer: document.referrer,
            user_agent: navigator.userAgent
          }
        ]);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error tracking click:', error);
      return false;
    }
  },

  async getStats(userId: string) {
    try {
      // Get all affiliate links for this user
      const { data: linksData, error: linksError } = await supabase
        .from('affiliate_links')
        .select('id')
        .eq('user_id', userId);
      
      if (linksError) throw linksError;
      
      if (!linksData || linksData.length === 0) {
        return {
          clicks: 0,
          conversions: 0,
          conversionRate: 0,
          revenue: 0
        };
      }
      
      const linkIds = linksData.map(link => link.id);
      
      // Get clicks count
      const { count: clicksCount, error: clicksError } = await supabase
        .from('clicks')
        .select('*', { count: 'exact', head: true })
        .in('affiliate_link_id', linkIds);
      
      if (clicksError) throw clicksError;
      
      // Get conversions
      const { data: conversionsData, error: conversionsError } = await supabase
        .from('conversions')
        .select('*')
        .in('affiliate_link_id', linkIds);
      
      if (conversionsError) throw conversionsError;
      
      const conversionsCount = conversionsData?.length || 0;
      
      // Calculate total revenue
      const revenue = conversionsData?.reduce((sum, conversion) => sum + parseFloat(conversion.amount), 0) || 0;
      
      // Calculate conversion rate
      const conversionRate = clicksCount ? (conversionsCount / clicksCount) * 100 : 0;
      
      return {
        clicks: clicksCount || 0,
        conversions: conversionsCount,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        revenue: parseFloat(revenue.toFixed(2))
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        clicks: 0,
        conversions: 0,
        conversionRate: 0,
        revenue: 0
      };
    }
  },

  generateAffiliateCode(): string {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const length = 8;
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
  },

  setupRealtimeListeners(userId: string, onUpdate: () => void) {
    return supabase
      .channel('affiliate-activity')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'clicks',
          filter: `affiliate_link_id=in.(select id from affiliate_links where user_id=eq.${userId})`
        },
        () => onUpdate()
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversions',
          filter: `affiliate_link_id=in.(select id from affiliate_links where user_id=eq.${userId})`
        },
        () => onUpdate()
      )
      .subscribe();
  }
};
