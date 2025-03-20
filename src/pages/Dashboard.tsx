
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader2, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AffiliateService, AffiliateLink, AffiliateStats } from "@/services/AffiliateService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [affiliateLink, setAffiliateLink] = useState<AffiliateLink | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!user && !isLoading) {
      navigate("/");
    }

    const fetchAffiliateData = async () => {
      if (user) {
        try {
          setLoadingStats(true);
          
          // Charger le lien d'affiliation
          const { data: linkData } = await AffiliateService.getAffiliateLink(user.id);
          setAffiliateLink(linkData);
          
          // Charger les statistiques
          const { data: statsData } = await AffiliateService.getAffiliateStats(user.id);
          if (statsData) {
            setStats(statsData);
          } else {
            setStats({
              clicks: 0,
              conversions: 0,
              revenue: 0
            });
          }
        } catch (error) {
          console.error("Error fetching affiliate data:", error);
          toast({
            title: "Erreur",
            description: "Impossible de charger vos données d'affiliation. Veuillez réessayer.",
            variant: "destructive",
          });
        } finally {
          setLoadingStats(false);
        }
      }
    };

    fetchAffiliateData();
  }, [user, isLoading, navigate, toast]);

  const copyLinkToClipboard = () => {
    if (affiliateLink?.code) {
      navigator.clipboard.writeText(affiliateLink.code);
      toast({
        description: "Lien d'affiliation copié dans le presse-papiers !",
      });
    }
  };

  if (isLoading || loadingStats) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" /> Chargement...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tableau de bord</h1>
      <p className="mb-6">Bienvenue, {user.email} !</p>

      {/* Lien d'affiliation */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Votre lien d'affiliation Calendly</CardTitle>
          <CardDescription>
            Partagez ce lien pour que vos prospects puissent prendre rendez-vous et vous soyez crédité.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {affiliateLink ? (
            <div className="space-y-4">
              <div className="p-3 bg-gray-100 rounded-lg break-all">
                <p className="text-sm font-medium">{affiliateLink.code}</p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center" 
                  onClick={copyLinkToClipboard}
                >
                  <Copy className="h-4 w-4 mr-2" /> Copier
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center"
                  onClick={() => window.open(affiliateLink.code, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" /> Visiter
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Aucun lien d'affiliation trouvé. Veuillez contacter le support.</p>
          )}
        </CardContent>
      </Card>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Clics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.clicks}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.conversions}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Revenu Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${stats.revenue}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
