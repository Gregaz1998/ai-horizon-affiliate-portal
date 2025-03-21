
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
  });

  useEffect(() => {
    if (user) {
      // Load user data from Supabase
      const fetchUserData = async () => {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (error) {
            console.error("Error fetching profile:", error);
            return;
          }

          if (data) {
            setFormData({
              username: user.email?.split('@')[0] || "",
              firstName: data.first_name || "",
              lastName: data.last_name || "",
              email: user.email || "",
            });
          }
        } catch (error) {
          console.error("Error in fetchUserData:", error);
        }
      };

      fetchUserData();
    }
  }, [user]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setProfileImage(e.target.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour mettre à jour votre profil",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Update profile in Supabase
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
        })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      toast({
        description: "Profil mis à jour avec succès",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du profil",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="responsive-container py-32">
        <Card className="w-full max-w-md mx-auto bg-card shadow-lg rounded-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Mon Profil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-6">
              <label className="relative cursor-pointer">
                <input type="file" className="hidden" onChange={handleFileChange} />
                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-brand-purple">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UploadCloud size={40} className="text-gray-400" />
                  )}
                </div>
              </label>
              <p className="text-sm text-muted-foreground mt-2">Changer ma photo</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <Input 
                  id="username"
                  name="username" 
                  value={formData.username} 
                  onChange={handleChange} 
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="firstName">Prénom</Label>
                <Input 
                  id="firstName"
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleChange} 
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nom</Label>
                <Input 
                  id="lastName"
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleChange} 
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  disabled
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
