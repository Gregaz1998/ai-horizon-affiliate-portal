
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://lxowyxacbmmbuymqikqx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4b3d5eGFjYm1tYnV5bXFpa3F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyODMwMDgsImV4cCI6MjA1Nzg1OTAwOH0.lc2hrjAzohgg5bZ5KiBXE3xVS-KExs4tk_DL3iFBpn8";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: localStorage,
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// Enable realtime subscription for affiliate_links, clicks, and conversions tables
const enableRealtimeForTables = async () => {
  await supabase.channel('schema-db-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'affiliate_links',
    }, (payload) => console.log('Change received for affiliate_links!', payload))
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'clicks',
    }, (payload) => console.log('Change received for clicks!', payload))
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'conversions',
    }, (payload) => console.log('Change received for conversions!', payload))
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'profiles',
    }, (payload) => console.log('Change received for profiles!', payload))
    .subscribe();
};

// Initialize realtime subscriptions
enableRealtimeForTables().catch(err => 
  console.error("Failed to enable realtime subscriptions:", err)
);
