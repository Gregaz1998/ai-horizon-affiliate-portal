
import { supabase } from "@/integrations/supabase/client";

export const TrackingService = {
  async trackClick(code: string): Promise<boolean> {
    try {
      // Essayer d'abord d'utiliser la fonction Edge
      const response = await fetch(`${window.location.origin}/functions/v1/track-click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          code,
          referrer: document.referrer,
          userAgent: navigator.userAgent
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to track click');
      }

      return true;
    } catch (error) {
      console.error('Error tracking click:', error);
      
      // Plan B : suivi côté client
      try {
        // Récupérer l'ID du lien d'affiliation
        const { data: linkData, error: linkError } = await supabase
          .from('affiliate_links')
          .select('id')
          .eq('code', code)
          .single();
        
        if (linkError) throw linkError;
        
        // Enregistrer le clic
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
      } catch (fallbackError) {
        console.error('Error in fallback tracking:', fallbackError);
        return false;
      }
    }
  },

  // Pour tester - créer une conversion exemple (normalement côté serveur)
  async createSampleConversion(code: string): Promise<boolean> {
    try {
      // Récupérer l'ID du lien d'affiliation
      const { data: linkData, error: linkError } = await supabase
        .from('affiliate_links')
        .select('id')
        .eq('code', code)
        .single();
      
      if (linkError) throw linkError;
      
      // Générer un produit aléatoire
      const products = [
        { name: "AI Horizon Basic", amount: 49 },
        { name: "AI Horizon Pro", amount: 99 },
        { name: "AI Horizon Enterprise", amount: 299 }
      ];
      
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      
      // Créer la conversion
      const { error } = await supabase
        .from('conversions')
        .insert([
          {
            affiliate_link_id: linkData.id,
            product: randomProduct.name,
            amount: randomProduct.amount,
            status: Math.random() > 0.3 ? "completed" : "pending"
          }
        ]);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error creating sample conversion:', error);
      return false;
    }
  }
};
