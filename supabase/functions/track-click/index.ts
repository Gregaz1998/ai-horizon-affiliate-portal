
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse the request body
    const { code, referrer, userAgent, path } = await req.json();

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Affiliate code is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Tracking click for code: ${code} from ${referrer || 'direct visit'} on path: ${path || 'unknown'}`);

    // Get the affiliate link id
    const { data: linkData, error: linkError } = await supabaseClient
      .from('affiliate_links')
      .select('id, user_id')
      .eq('code', code)
      .single();

    if (linkError) {
      console.error('Error getting affiliate link:', linkError);
      return new Response(
        JSON.stringify({ error: 'Invalid affiliate code' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Found affiliate link with ID: ${linkData.id} for user: ${linkData.user_id}`);

    // Determine device type from user agent
    const deviceType = userAgent?.toLowerCase().includes('mobile') ? 'mobile' : 'desktop';

    // Record the click with additional information
    const { data, error } = await supabaseClient
      .from('clicks')
      .insert([
        {
          affiliate_link_id: linkData.id,
          referrer,
          user_agent: userAgent,
          ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip'),
          path: path || '/',
          device_type: deviceType
        }
      ])
      .select();

    if (error) {
      console.error('Error recording click:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to record click' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Successfully recorded click with ID: ${data[0].id}`);

    // Get updated stats to return
    const { data: stats, error: statsError } = await supabaseClient.rpc(
      'get_affiliate_stats',
      { affiliate_user_id: linkData.user_id }
    );

    return new Response(
      JSON.stringify({ 
        success: true, 
        data,
        stats: statsError ? null : stats,
        message: 'Click successfully tracked' 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
