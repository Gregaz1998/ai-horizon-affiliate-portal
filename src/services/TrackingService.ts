import { supabase } from "@/integrations/supabase/client";

export const TrackingService = {
  async trackClick(code: string): Promise<{success: boolean, stats?: any}> {
    try {
      console.log("Tracking click for code:", code);
      // Try to use the Edge function first
      const response = await fetch(`${window.location.origin}/functions/v1/track-click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          code,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          path: window.location.pathname
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to track click');
      }

      const result = await response.json();
      console.log("Click tracked successfully via edge function", result);
      return { 
        success: true,
        stats: result.stats 
      };
    } catch (error) {
      console.error('Error tracking click via edge function:', error);
      
      // Fallback: client-side tracking
      try {
        // Get the affiliate link ID
        const { data: linkData, error: linkError } = await supabase
          .from('affiliate_links')
          .select('id, user_id')
          .eq('code', code)
          .single();
        
        if (linkError) throw linkError;
        
        // Record the click
        const { error } = await supabase
          .from('clicks')
          .insert([
            {
              affiliate_link_id: linkData.id,
              referrer: document.referrer,
              user_agent: navigator.userAgent,
              path: window.location.pathname,
              device_type: navigator.userAgent.toLowerCase().includes('mobile') ? 'mobile' : 'desktop'
            }
          ]);
        
        if (error) throw error;
        
        console.log("Click tracked successfully via client fallback");
        
        // Get updated stats
        const { data: stats, error: statsError } = await supabase.rpc(
          'get_affiliate_stats',
          { affiliate_user_id: linkData.user_id }
        );
        
        return { 
          success: true,
          stats: statsError ? null : stats
        };
      } catch (fallbackError) {
        console.error('Error in fallback tracking:', fallbackError);
        return { success: false };
      }
    }
  },

  // For testing - create a sample conversion (normally done server-side)
  async createSampleConversion(code: string, product?: string, amount?: number): Promise<boolean> {
    try {
      // Get the affiliate link ID
      const { data: linkData, error: linkError } = await supabase
        .from('affiliate_links')
        .select('id, user_id')
        .eq('code', code)
        .single();
      
      if (linkError) throw linkError;
      
      // Generate a random product if none provided
      const products = [
        { name: "AI Horizon Basic", amount: 49 },
        { name: "AI Horizon Pro", amount: 99 },
        { name: "AI Horizon Enterprise", amount: 299 }
      ];
      
      let productInfo;
      if (product && amount) {
        productInfo = { name: product, amount: amount };
      } else {
        productInfo = products[Math.floor(Math.random() * products.length)];
      }
      
      // Create the conversion
      const { error } = await supabase
        .from('conversions')
        .insert([
          {
            affiliate_link_id: linkData.id,
            product: productInfo.name,
            amount: productInfo.amount,
            status: Math.random() > 0.3 ? "completed" : "pending"
          }
        ]);
      
      if (error) throw error;
      
      console.log("Sample conversion created successfully");
      return true;
    } catch (error) {
      console.error('Error creating sample conversion:', error);
      return false;
    }
  },
  
  // Get real-time click and conversion data for the past X days for a specific affiliate link
  async getRealTimeStats(affiliateLinkId: string, days: number = 30): Promise<any> {
    try {
      // Calculate the date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      // Format dates for Supabase query
      const startDateStr = startDate.toISOString();
      const endDateStr = endDate.toISOString();
      
      // Get clicks within the date range
      const { data: clicksData, error: clicksError } = await supabase
        .from('clicks')
        .select('created_at, device_type')
        .eq('affiliate_link_id', affiliateLinkId)
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr)
        .order('created_at', { ascending: true });
      
      if (clicksError) throw clicksError;
      
      // Get conversions within the date range
      const { data: conversionsData, error: conversionsError } = await supabase
        .from('conversions')
        .select('created_at, amount, status')
        .eq('affiliate_link_id', affiliateLinkId)
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr)
        .order('created_at', { ascending: true });
      
      if (conversionsError) throw conversionsError;
      
      // Process the data into daily stats
      const dailyStats = this.processDailyStats(clicksData, conversionsData, startDate, days);
      
      // Get device stats from clicks data only since device_type isn't available in conversions
      const deviceStats = this.processDeviceStats(clicksData, conversionsData);
      
      return {
        dailyStats,
        deviceStats,
        totalClicks: clicksData.length,
        totalConversions: conversionsData.length,
        conversionRate: clicksData.length > 0 ? (conversionsData.length / clicksData.length) * 100 : 0,
        totalRevenue: conversionsData.reduce((sum, item) => {
          // Only count completed conversions
          if (item && typeof item === 'object' && 'status' in item && item.status === 'completed') {
            return sum + (typeof item.amount === 'number' ? item.amount : 0);
          }
          return sum;
        }, 0)
      };
    } catch (error) {
      console.error('Error getting real-time stats:', error);
      throw error;
    }
  },
  
  // Process device stats from clicks data only
  processDeviceStats(clicksData: any[], conversionsData: any[]) {
    const devices = {
      mobile: { clicks: 0, conversions: 0, revenue: 0 },
      desktop: { clicks: 0, conversions: 0, revenue: 0 },
      unknown: { clicks: 0, conversions: 0, revenue: 0 }
    };
    
    // Count clicks by device
    if (clicksData && Array.isArray(clicksData)) {
      clicksData.forEach(click => {
        if (click && typeof click === 'object' && 'device_type' in click) {
          const device = click.device_type || 'unknown';
          if (devices[device]) {
            devices[device].clicks += 1;
          } else {
            devices.unknown.clicks += 1;
          }
        } else {
          devices.unknown.clicks += 1;
        }
      });
    }
    
    // We can't group conversions by device_type since it doesn't exist in conversions table
    // So we just count total conversions and revenue
    if (conversionsData && Array.isArray(conversionsData)) {
      const totalConversions = conversionsData.length;
      const totalRevenue = conversionsData.reduce((sum, item) => {
        if (item && typeof item === 'object' && 'status' in item && item.status === 'completed') {
          return sum + (typeof item.amount === 'number' ? item.amount : 0);
        }
        return sum;
      }, 0);
      
      // Distribute conversions proportionally based on click ratios
      const totalClicks = Object.values(devices).reduce((sum, device) => sum + device.clicks, 0);
      if (totalClicks > 0) {
        Object.keys(devices).forEach(deviceType => {
          const ratio = devices[deviceType].clicks / totalClicks;
          devices[deviceType].conversions = Math.round(totalConversions * ratio);
          devices[deviceType].revenue = Math.round(totalRevenue * ratio);
        });
      }
    }
    
    return Object.entries(devices).map(([name, stats]) => ({
      name,
      ...stats
    }));
  },
  
  // Process daily stats for charting
  processDailyStats(clicksData: any[], conversionsData: any[], startDate: Date, days: number) {
    const dailyStats = [];
    const dailyMap = new Map();
    
    // Initialize daily map with zeros for each day
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dailyMap.set(dateStr, {
        name: dateStr,
        clicks: 0,
        conversions: 0,
        revenue: 0
      });
    }
    
    // Aggregate clicks by day
    if (clicksData) {
      clicksData.forEach(click => {
        const dateStr = new Date(click.created_at).toISOString().split('T')[0];
        if (dailyMap.has(dateStr)) {
          const day = dailyMap.get(dateStr);
          day.clicks += 1;
          dailyMap.set(dateStr, day);
        }
      });
    }
    
    // Aggregate conversions by day
    if (conversionsData) {
      conversionsData.forEach(conversion => {
        const dateStr = new Date(conversion.created_at).toISOString().split('T')[0];
        if (dailyMap.has(dateStr)) {
          const day = dailyMap.get(dateStr);
          day.conversions += 1;
          if (conversion.status === 'completed') {
            day.revenue += conversion.amount;
          }
          dailyMap.set(dateStr, day);
        }
      });
    }
    
    // Convert map to array for charting
    dailyMap.forEach(value => {
      dailyStats.push(value);
    });
    
    return dailyStats.sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
  },
  
  // Subscribe to real-time updates for a user's affiliate data
  subscribeToRealTimeUpdates(userId: string, callback: (data: any) => void) {
    // Get the user's affiliate link ID first
    const getUserAffiliateLink = async () => {
      const { data: linkData } = await supabase
        .from('affiliate_links')
        .select('id')
        .eq('user_id', userId)
        .limit(1)
        .single();
      
      return linkData?.id;
    };
    
    // Set up subscription
    return getUserAffiliateLink().then(linkId => {
      if (!linkId) return null;
      
      // Create a channel for real-time updates
      const channel = supabase.channel('db-changes')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'clicks',
          filter: `affiliate_link_id=eq.${linkId}`
        }, (payload) => {
          console.log('New click detected:', payload);
          callback({
            type: 'click',
            data: payload.new
          });
        })
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'conversions',
          filter: `affiliate_link_id=eq.${linkId}`
        }, (payload) => {
          console.log('New conversion detected:', payload);
          callback({
            type: 'conversion',
            data: payload.new
          });
        })
        .subscribe();
      
      // Return unsubscribe function
      return () => {
        supabase.removeChannel(channel);
      };
    });
  }
};
