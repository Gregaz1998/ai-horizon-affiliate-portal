
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  Loader2, Copy, ExternalLink, LayoutDashboard, Link, DollarSign, 
  Trophy, MessageSquare, Settings, Sun, Moon, Bell, User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AffiliateService, AffiliateLink, AffiliateStats } from "@/services/AffiliateService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { useTheme } from "@/context/ThemeContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";

const Dashboard = () => {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [affiliateLink, setAffiliateLink] = useState<AffiliateLink | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [activePage, setActivePage] = useState("dashboard");

  // Sample performance data for the chart
  const performanceData = [
    { name: "1 Avr", clicks: 5, conversions: 0 },
    { name: "5 Avr", clicks: 12, conversions: 1 },
    { name: "10 Avr", clicks: 15, conversions: 2 },
    { name: "15 Avr", clicks: 22, conversions: 3 },
    { name: "20 Avr", clicks: 28, conversions: 4 },
    { name: "25 Avr", clicks: 35, conversions: 5 },
    { name: "30 Avr", clicks: 42, conversions: 6 },
  ];

  // Leaderboard data
  const leaderboardData = [
    { rank: 1, name: "Paul D.", conversions: 12, prize: "iPhone 16" },
    { rank: 2, name: "Sophie M.", conversions: 9, prize: "iPad" },
    { rank: 3, name: "Antoine L.", conversions: 7, prize: "500€" },
    { rank: 4, name: "Marie T.", conversions: 5, prize: "-" },
    { rank: 5, name: "Lucas R.", conversions: 3, prize: "-" },
  ];

  useEffect(() => {
    if (!user && !isLoading) {
      navigate("/");
    }

    const fetchAffiliateData = async () => {
      if (user) {
        try {
          setLoadingStats(true);
          
          // Vérifier d'abord si nous avons un lien dans le localStorage
          const regData = AffiliateService.loadRegistrationData();
          let link = null;
          
          // Essayer de charger le lien d'affiliation depuis Supabase
          const { data: linkData, error } = await AffiliateService.getAffiliateLink(user.id);
          
          if (linkData) {
            // Si nous avons trouvé un lien dans Supabase, utilisons-le
            link = linkData;
          } else if (regData?.affiliateLink && !error) {
            // Si pas de lien dans Supabase mais un lien dans le localStorage, 
            // créons-le dans Supabase et utilisons-le
            const { data: newLinkData } = await AffiliateService.createAffiliateLink(
              user.id, 
              regData.affiliateLink
            );
            
            if (newLinkData) {
              // Récupérer le lien nouvellement créé
              const { data: freshLink } = await AffiliateService.getAffiliateLink(user.id);
              link = freshLink;
            }
          } else {
            // Si aucun lien n'existe, en créer un nouveau
            const generatedLink = AffiliateService.generateAffiliateLink(user.id, regData?.service || "calendly");
            await AffiliateService.createAffiliateLink(user.id, generatedLink);
            
            // Récupérer le lien nouvellement créé
            const { data: newLink } = await AffiliateService.getAffiliateLink(user.id);
            link = newLink;
            
            // Mettre à jour les données d'inscription
            if (regData) {
              AffiliateService.saveRegistrationData({
                ...regData,
                affiliateLink: generatedLink
              });
            }
          }
          
          setAffiliateLink(link);
          
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

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
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
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-center">AI Horizon Affilié</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-2">
            <button 
              className={`flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${activePage === "dashboard" ? "bg-gray-100 dark:bg-gray-800" : ""}`}
              onClick={() => setActivePage("dashboard")}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Tableau de bord</span>
            </button>
            <button 
              className={`flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${activePage === "links" ? "bg-gray-100 dark:bg-gray-800" : ""}`}
              onClick={() => setActivePage("links")}
            >
              <Link className="h-5 w-5" />
              <span>Mes liens d'affiliation</span>
            </button>
            <button 
              className={`flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${activePage === "earnings" ? "bg-gray-100 dark:bg-gray-800" : ""}`}
              onClick={() => setActivePage("earnings")}
            >
              <DollarSign className="h-5 w-5" />
              <span>Mes gains</span>
            </button>
            <button 
              className={`flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${activePage === "ranking" ? "bg-gray-100 dark:bg-gray-800" : ""}`}
              onClick={() => setActivePage("ranking")}
            >
              <Trophy className="h-5 w-5" />
              <span>Classement des affiliés</span>
            </button>
            <button 
              className={`flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${activePage === "messaging" ? "bg-gray-100 dark:bg-gray-800" : ""}`}
              onClick={() => setActivePage("messaging")}
            >
              <MessageSquare className="h-5 w-5" />
              <span>Messagerie</span>
            </button>
            <button 
              className={`flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${activePage === "settings" ? "bg-gray-100 dark:bg-gray-800" : ""}`}
              onClick={() => setActivePage("settings")}
            >
              <Settings className="h-5 w-5" />
              <span>Paramètres</span>
            </button>
          </nav>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button 
              onClick={() => signOut()}
              className="text-red-500 hover:text-red-700"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
          <div className="flex justify-between items-center">
            <div className="md:hidden">
              <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden md:block">
                <span className="font-semibold">Solde actuel:</span> {stats?.revenue ? `${stats.revenue}€` : "0€"}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center"
                onClick={copyLinkToClipboard}
              >
                <Link className="h-4 w-4 mr-2" /> Générer un lien
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 cursor-pointer" />
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {user.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{user.email}</p>
                  <p className="text-xs text-gray-500">Affilié</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main dashboard content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>
            
            {/* Affiliate link card */}
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
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg break-all">
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
            
            {/* Performance stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Clics</CardTitle>
                  <CardDescription>Nombre total de clics sur vos liens</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats?.clicks || 0}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Conversions</CardTitle>
                  <CardDescription>Réservations confirmées</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats?.conversions || 0}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Revenus</CardTitle>
                  <CardDescription>Commissions générées</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats?.revenue ? `${stats.revenue}€` : "0€"}</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Performance chart */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Performance du mois</CardTitle>
                <CardDescription>Suivi de vos performances sur les 30 derniers jours</CardDescription>
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
                      <Area type="monotone" dataKey="conversions" stroke="#82ca9d" fill="#82ca9d" name="Conversions" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle>Classement des Affiliés - Avril 2025</CardTitle>
                <CardDescription>Gagnez des récompenses en devenant l'un des meilleurs affiliés du mois</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="px-4 py-2 text-left">Rang</th>
                        <th className="px-4 py-2 text-left">Affilié</th>
                        <th className="px-4 py-2 text-left">Conversions</th>
                        <th className="px-4 py-2 text-left">Récompense</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboardData.map((item) => (
                        <tr key={item.rank} className="border-b dark:border-gray-700">
                          <td className="px-4 py-3">
                            {item.rank === 1 ? "🥇" : item.rank === 2 ? "🥈" : item.rank === 3 ? "🥉" : item.rank}
                          </td>
                          <td className="px-4 py-3">{item.name}</td>
                          <td className="px-4 py-3">{item.conversions}</td>
                          <td className="px-4 py-3">{item.prize}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
