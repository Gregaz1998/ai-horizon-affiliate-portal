
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { 
  Loader2, Copy, BarChart3, Home, Users, FileText, 
  Settings, ExternalLink, Smartphone, Monitor
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  AffiliateService, AffiliateLink, AffiliateStats, 
  ClickEvent, ConversionEvent 
} from "@/services/AffiliateService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/context/ThemeContext";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from "recharts";
import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import CommissionInfo from "@/components/CommissionInfo";
import { useMobile } from "@/hooks/useMobile";
import { TrackingService } from "@/services/TrackingService";

const Dashboard = () => {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();
  const isMobile = useMobile();
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [affiliateLink, setAffiliateLink] = useState<string | null>(null);
  const [clickHistory, setClickHistory] = useState<ClickEvent[]>([]);
  const [conversionHistory, setConversionHistory] = useState<ConversionEvent[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [performanceData, setPerformanceData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [linkData, setLinkData] = useState<AffiliateLink | null>(null);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

  const fetchAffiliateData = useCallback(async () => {
    if (user) {
      try {
        setLoadingStats(true);
        setLoadingHistory(true);
        
        // Vérifier d'abord si nous avons un lien dans le localStorage
        const regData = AffiliateService.loadRegistrationData();
        let supabaseLink = null;
        
        // Essayer de charger le lien d'affiliation depuis Supabase
        const { data: linkData, error } = await AffiliateService.getAffiliateLink(user.id);
        
        if (linkData) {
          // Si nous avons trouvé un lien dans Supabase, utilisons-le
          supabaseLink = linkData;
          setLinkData(linkData);
          // Mettre à jour la variable affiliateLink avec le code du lien
          setAffiliateLink(linkData.code);
        } else if (!error) {
          // Si pas de lien dans Supabase, créons-en un
          // Générer un lien personnalisé avec les données de l'utilisateur
          const generatedLink = AffiliateService.generateAffiliateLink(user.id, regData);
          
          // Créer le lien dans Supabase
          const { data: newLink } = await AffiliateService.createAffiliateLink(user.id, generatedLink);
          
          if (newLink) {
            setLinkData(newLink);
          }
          
          // Mettre à jour la variable affiliateLink
          setAffiliateLink(generatedLink);
          
          // Mettre à jour les données d'inscription si nécessaire
          if (regData) {
            AffiliateService.saveRegistrationData({
              ...regData,
              affiliateLink: generatedLink
            });
          }
        }
        
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
        
        // Charger l'historique des clics
        const { data: clickData } = await AffiliateService.getClickHistory(user.id);
        if (clickData) {
          setClickHistory(clickData);
        }
        
        // Charger l'historique des conversions
        const { data: conversionData } = await AffiliateService.getConversionHistory(user.id);
        if (conversionData) {
          setConversionHistory(conversionData);
        }
        
        // Si nous avons un lien d'affiliation, charger les statistiques détaillées
        if (linkData) {
          // Charger les données de performance pour le graphique
          const { data: realTimeStats } = await TrackingService.getRealTimeStats(linkData.id, 30);
          if (realTimeStats) {
            setPerformanceData(realTimeStats.dailyStats || []);
            setDeviceData(realTimeStats.deviceStats || []);
          }
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
        setLoadingHistory(false);
      }
    }
  }, [user, toast]);

  useEffect(() => {
    if (!user && !isLoading) {
      navigate("/");
    }

    fetchAffiliateData();
    
    // Mettre en place la mise à jour en temps réel
    let unsubscribe: (() => void) | null = null;
    
    if (user) {
      TrackingService.subscribeToRealTimeUpdates(user.id, (update) => {
        console.log('Real-time update received:', update);
        // Rafraîchir les données
        fetchAffiliateData();
      }).then(unsub => {
        unsubscribe = unsub;
      });
    }
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
    
  }, [user, isLoading, navigate, fetchAffiliateData]);

  const copyLinkToClipboard = () => {
    if (affiliateLink) {
      navigator.clipboard.writeText(affiliateLink);
      toast({
        description: "Lien d'affiliation copié dans le presse-papiers !",
      });
    }
  };

  // Pour tester le suivi des clics
  const testClick = async () => {
    if (affiliateLink) {
      const result = await TrackingService.trackClick(affiliateLink);
      if (result.success) {
        toast({
          description: "Test de clic effectué avec succès !",
        });
        fetchAffiliateData();
      }
    }
  };

  // Pour tester les conversions
  const testConversion = async () => {
    if (affiliateLink) {
      const success = await TrackingService.createSampleConversion(affiliateLink);
      if (success) {
        toast({
          description: "Test de conversion effectué avec succès !",
        });
        fetchAffiliateData();
      }
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

  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistance(date, new Date(), { 
      addSuffix: true,
      locale: fr
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-xl font-bold mb-2 sm:mb-0">AI Horizon Affilié</h1>
          <div className="flex items-center space-x-4">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Solde actuel:</span>
              <span className="ml-2 font-semibold">{stats?.revenue ? `${stats.revenue}€` : "0€"}</span>
            </div>
            <Button 
              variant="outline" 
              onClick={() => signOut()}
              size="sm"
            >
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Votre lien d'affiliation */}
          <Card>
            <CardHeader>
              <CardTitle>Votre lien d'affiliation personnalisé</CardTitle>
              <CardDescription>
                Partagez ce lien avec vos prospects pour qu'ils puissent prendre rendez-vous via Calendly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {affiliateLink ? (
                <div className="space-y-4">
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-x-auto">
                    <p className="text-sm font-medium break-all">{affiliateLink}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="default" 
                      onClick={copyLinkToClipboard}
                      className="flex items-center"
                      size={isMobile ? "sm" : "default"}
                    >
                      <Copy className="h-4 w-4 mr-2" /> Copier le lien
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => window.open(affiliateLink, '_blank')}
                      className="flex items-center"
                      size={isMobile ? "sm" : "default"}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" /> Ouvrir
                    </Button>
                    <Button
                      variant="outline"
                      onClick={testClick}
                      className="flex items-center"
                      size={isMobile ? "sm" : "default"}
                    >
                      Test Clic
                    </Button>
                    <Button
                      variant="outline"
                      onClick={testConversion}
                      className="flex items-center"
                      size={isMobile ? "sm" : "default"}
                    >
                      Test Conversion
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Aucun lien d'affiliation disponible. Veuillez réessayer.</p>
              )}
            </CardContent>
          </Card>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Clics sur votre lien</CardTitle>
                <CardDescription>Nombre total de visites</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats?.clicks || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Rendez-vous confirmés</CardTitle>
                <CardDescription>Via votre lien Calendly</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats?.conversions || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Taux de conversion</CardTitle>
                <CardDescription>Efficacité de votre affiliation</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {stats && stats.clicks > 0 
                    ? `${((stats.conversions / stats.clicks) * 100).toFixed(1)}%` 
                    : "0%"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques de performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graphique d'évolution */}
            <Card>
              <CardHeader>
                <CardTitle>Performance des 30 derniers jours</CardTitle>
                <CardDescription>Évolution de vos clics et rendez-vous confirmés</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="clicks" stroke="#8884d8" fill="#8884d8" name="Clics" />
                      <Area type="monotone" dataKey="conversions" stroke="#82ca9d" fill="#82ca9d" name="Rendez-vous" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Graphique par appareil */}
            <Card>
              <CardHeader>
                <CardTitle>Répartition par appareil</CardTitle>
                <CardDescription>Performance selon le type d'appareil</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {isMobile ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={deviceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="clicks"
                          nameKey="name"
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {deviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={deviceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="clicks" name="Clics" fill="#8884d8" />
                        <Bar dataKey="conversions" name="Conversions" fill="#82ca9d" />
                        <Bar dataKey="revenue" name="Revenus (€)" fill="#ffc658" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Commission Information Section */}
          {user && <CommissionInfo userId={user.id} />}

          {/* Historique d'activité */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Derniers clics sur votre lien</CardTitle>
                <CardDescription>Historique en temps réel</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : clickHistory.length > 0 ? (
                  <div className="space-y-3">
                    {clickHistory.map((click) => (
                      <div key={click.id} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium">
                            {click.referrer ? `De: ${click.referrer}` : "Clic direct"}
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(click.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-gray-500">Aucun clic enregistré pour le moment.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Derniers rendez-vous confirmés</CardTitle>
                <CardDescription>Historique en temps réel</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : conversionHistory.length > 0 ? (
                  <div className="space-y-3">
                    {conversionHistory.map((conversion) => (
                      <div key={conversion.id} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <div className="flex justify-between">
                          <div>
                            <p className="text-sm font-medium">{conversion.product}</p>
                            <p className="text-xs text-gray-500">Statut: {conversion.status}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{conversion.amount}€</p>
                            <p className="text-xs text-gray-500">{formatDate(conversion.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-gray-500">Aucun rendez-vous confirmé pour le moment.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="sticky bottom-0 bg-white dark:bg-gray-900 shadow-lg p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-xl mx-auto">
          <div className="flex justify-around">
            <RouterLink to="/" className="flex flex-col items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Accueil</span>
            </RouterLink>
            <RouterLink to="/dashboard" className="flex flex-col items-center text-brand-blue dark:text-brand-blue transition-colors">
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs mt-1">Tableau de bord</span>
            </RouterLink>
            <RouterLink to="/leaderboard" className="flex flex-col items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
              <Users className="h-5 w-5" />
              <span className="text-xs mt-1">Classement</span>
            </RouterLink>
            <RouterLink to="/resources" className="flex flex-col items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
              <FileText className="h-5 w-5" />
              <span className="text-xs mt-1">Ressources</span>
            </RouterLink>
            <RouterLink to="/settings" className="flex flex-col items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
              <Settings className="h-5 w-5" />
              <span className="text-xs mt-1">Paramètres</span>
            </RouterLink>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
