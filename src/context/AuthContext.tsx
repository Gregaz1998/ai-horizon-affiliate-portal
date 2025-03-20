
import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
  }>;
  signUp: (email: string, password: string, userData: any) => Promise<{
    error: Error | null;
    user?: User | null;
    emailConfirmationSent?: boolean;
  }>;
  signOut: () => Promise<void>;
  checkEmailVerification: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Erreur de connexion",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        description: "Connexion réussie !",
      });
      navigate("/dashboard");
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            payment_method: userData.paymentMethod,
            payment_details: userData.paymentMethod === "paypal" 
              ? { paypalEmail: userData.paypalEmail }
              : { bankName: userData.bankName, accountNumber: userData.accountNumber },
            business_number: userData.businessNumber,
            service: userData.service,
            country: userData.country,
            region: userData.region
          },
          emailRedirectTo: `${window.location.origin}/register?step=6`,
        },
      });

      if (error) {
        toast({
          title: "Erreur d'inscription",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // Check if email confirmation is required
      const emailConfirmationSent = !data?.session;

      if (emailConfirmationSent) {
        toast({
          description: "Un e-mail de confirmation a été envoyé. Veuillez vérifier votre boîte de réception.",
        });
      } else {
        toast({
          description: "Inscription réussie ! Vous êtes maintenant connecté.",
        });
      }
      
      return { error: null, user: data.user, emailConfirmationSent };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const checkEmailVerification = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error("Error checking email verification:", error);
        return false;
      }
      
      // If we have a user and their email is confirmed, they're verified
      return !!(data.user && data.user.email_confirmed_at);
    } catch (error) {
      console.error("Error in checkEmailVerification:", error);
      return false;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast({
      description: "Vous avez été déconnecté.",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
        checkEmailVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
