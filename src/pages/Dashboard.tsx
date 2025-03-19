
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, BarChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Copy, Download, TrendingUp, Clock, Link as LinkIcon, Users, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import AffiliateStats from "@/components/AffiliateStats";
import { useAuth } from "@/context/AuthContext";
import { AffiliateService, AffiliateLink, AffiliateStats as AffiliateStatsType } from "@/services/AffiliateService";
import { supabase } from "@/integrations/supabase/client";

// Sample data for when we don't have real data yet
const samplePerformanceData = [
  { name: "Jan", clicks: 0, conversions: 0, revenue: 0 },
  { name: "Fév", clicks: 0, conversions: 0, revenue: 0 },
  { name: "Mar", clicks: 0, conversions: 0, revenue: 0 },
  { name: "Avr", clicks: 0, conversions: 0, revenue: 0 },
  { name: "Mai", clicks: 0, conversions: 0, revenue: 0 },
  { name: "Juin", clicks: 0, conversions: 0, revenue: 0 },
  { name: "Juil", clicks: 0, conversions: 0, revenue: 0 },
  { name: "Août", clicks: 0, conversions: 0, revenue: 0 },
  { name: "Sep", clicks: 0, conversions: 0, revenue: 0 },
  { name: "Oct", clicks: 0, conversions: 0, revenue: 0 },
  { name: "Nov", clicks: 0, conversions: 0, revenue: 0 },
  { name: "Déc", clicks: 0, conversions: 0, revenue: 0 },
];

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState("yearly");
  const [affiliateLink, setAffiliateLink] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AffiliateStatsType>({ clicks: 0, conversions: 0, revenue: 0 });
  const [conversions, setConversions] = useState([]);
  const [performanceData, setPerformanceData] = useState(samplePerformanceData);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const fullAffiliateLink = affiliateLink ? `aihorizon.com/ref/${affiliateLink}` : "";

  // Load affiliate link and stats when component mounts
  useEffect(() => {
    if (!user) return;
    
    async function loadData() {
      setIsLoading(true);
      try {
        // Get affiliate link
        const { data: linkData, error: linkError } = await AffiliateService.getAffiliateLink(user.id);
        if (linkError) throw linkError;
        
        if (linkData) {
          setAffiliateLink(linkData.code);
        }
        
        // Get stats
        const { data: statsData, error: statsError } = await AffiliateService.getAffiliateStats(user.id);
        if (statsError) throw statsError;
        
        if (statsData) {
          setStats(statsData);
        }
        
        // Get conversions
        const { data: conversionsData, error: conversionsError } = await AffiliateService.getConversions(user.id);
        if (conversionsError) throw conversionsError;
        
        if (conversionsData) {
          setConversions(conversionsData);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos données. Veuillez réessayer.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
    
    // Set up realtime listeners for stats updates
    let channel;
    
    async function setupRealtimeListener() {
      const { data: linkData } = await AffiliateService.getAffiliateLink(user.id);
      if (linkData) {
        channel = AffiliateService.setupRealtimeListeners(linkData.id, async () => {
          // Refresh stats when new activity occurs
          const { data: newStats } = await AffiliateService.getAffiliateStats(user.id);
          if (newStats) {
            setStats(newStats);
          }
        });
      }
    }
    
    setupRealtimeListener();
    
    return () => {
      // Clean up listener
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, toast]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullAffiliateLink);
    toast({
      description: "Lien d'affiliation copié !",
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <section className="pt-28 pb-16 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-purple mx-auto mb-4" />
            <p>Chargement de votre tableau de bord...</p>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="pt-28 pb-16">
        <div className="responsive-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">Tableau de Bord</h1>
            <p className="text-gray-600">Bienvenue sur votre portail d'affiliation AI Horizon</p>
          </motion.div>

          <div className="mb-8">
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-brand-purple to-purple-600 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Votre lien d'affiliation</CardTitle>
                    <CardDescription className="text-purple-100">
                      Partagez ce lien pour gagner des commissions
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    className="bg-white/20 text-white border-white/20 hover:bg-white/30"
                    onClick={handleCopyLink}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copier
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center">
                    <LinkIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-800 font-medium">{fullAffiliateLink}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-8">
            <AffiliateStats stats={stats} />
          </div>

          <Tabs defaultValue="performance" className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="conversions">Conversions</TabsTrigger>
                <TabsTrigger value="payouts">Paiements</TabsTrigger>
              </TabsList>
              
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-white border border-gray-200 rounded-md px-3 py-1.5 text-sm"
              >
                <option value="weekly">Cette semaine</option>
                <option value="monthly">Ce mois</option>
                <option value="quarterly">Ce trimestre</option>
                <option value="yearly">Cette année</option>
              </select>
            </div>

            <TabsContent value="performance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-brand-purple" />
                    Performance
                  </CardTitle>
                  <CardDescription>
                    Vue d'ensemble de vos statistiques d'affiliation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.clicks === 0 && stats.conversions === 0 ? (
                    <div className="h-80 flex flex-col items-center justify-center text-center p-8">
                      <div className="p-4 rounded-full bg-purple-50 mb-4">
                        <TrendingUp className="h-8 w-8 text-brand-purple" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Pas encore de données à afficher</h3>
                      <p className="text-gray-500 max-w-md mb-4">
                        Partagez votre lien d'affiliation pour commencer à collecter des statistiques. 
                        Revenez ici pour suivre votre performance en temps réel.
                      </p>
                      <Button 
                        onClick={handleCopyLink} 
                        className="bg-brand-purple hover:bg-purple-700"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copier mon lien d'affiliation
                      </Button>
                    </div>
                  ) : (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={performanceData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: "white", 
                              borderRadius: "8px", 
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)", 
                              border: "none" 
                            }} 
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="clicks" 
                            stroke="#be2de2" 
                            strokeWidth={2} 
                            dot={{ r: 4 }} 
                            activeDot={{ r: 6 }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="conversions" 
                            stroke="#d277ed" 
                            strokeWidth={2} 
                            dot={{ r: 4 }} 
                            activeDot={{ r: 6 }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#66BB6A" 
                            strokeWidth={2} 
                            dot={{ r: 4 }} 
                            activeDot={{ r: 6 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-brand-purple" />
                      Trafic par source
                    </CardTitle>
                    <CardDescription>
                      D'où viennent vos visiteurs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats.clicks === 0 ? (
                      <div className="h-64 flex items-center justify-center text-center">
                        <p className="text-gray-500">
                          Aucune donnée disponible pour le moment. 
                          Partagez votre lien pour commencer à collecter des statistiques.
                        </p>
                      </div>
                    ) : (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { name: "Social", value: Math.floor(stats.clicks * 0.45) },
                              { name: "Blog", value: Math.floor(stats.clicks * 0.28) },
                              { name: "Direct", value: Math.floor(stats.clicks * 0.15) },
                              { name: "Email", value: Math.floor(stats.clicks * 0.12) },
                            ]}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: "white", 
                                borderRadius: "8px", 
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)", 
                                border: "none" 
                              }}
                            />
                            <Bar dataKey="value" fill="#be2de2" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-brand-purple" />
                      Activité récente
                    </CardTitle>
                    <CardDescription>
                      Dernières interactions avec vos liens
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats.clicks === 0 ? (
                      <div className="flex items-center justify-center text-center h-64">
                        <p className="text-gray-500">
                          Aucune activité récente.
                          Revenez ici après avoir partagé votre lien.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {[
                          { action: "Nouveau clic", time: "Il y a 5 minutes", source: "Twitter" },
                          { action: "Nouvelle conversion", time: "Il y a 28 minutes", source: "Facebook" },
                          { action: "Nouveau clic", time: "Il y a 42 minutes", source: "Blog" },
                          { action: "Nouveau clic", time: "Il y a 1 heure", source: "LinkedIn" },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-sm">{item.action}</p>
                              <p className="text-xs text-gray-500">{item.time}</p>
                            </div>
                            <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-brand-purple rounded-full">
                              {item.source}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="conversions">
              <Card>
                <CardHeader>
                  <CardTitle>Dernières Conversions</CardTitle>
                  <CardDescription>
                    Liste des achats générés via votre lien d'affiliation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {conversions.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-purple-50 inline-block p-3 rounded-full mb-4">
                        <TrendingUp className="h-6 w-6 text-brand-purple" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Pas encore de conversions</h3>
                      <p className="text-gray-500 max-w-md mx-auto mb-6">
                        Vous n'avez pas encore généré de conversions. Partagez votre lien d'affiliation 
                        pour commencer à gagner des commissions.
                      </p>
                      <Button 
                        onClick={handleCopyLink} 
                        className="bg-brand-purple hover:bg-purple-700"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copier mon lien d'affiliation
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Produit
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Montant
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Statut
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {conversions.map((conversion) => (
                            <tr key={conversion.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                #{conversion.id.substring(0, 8)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {conversion.product}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(conversion.created_at).toLocaleDateString('fr-FR', {
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {parseFloat(conversion.amount).toFixed(2)} €
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    conversion.status === "completed"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {conversion.status === "completed" ? "Validé" : "En attente"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payouts">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Paiements</CardTitle>
                    <CardDescription>
                      Historique des paiements et montants disponibles
                    </CardDescription>
                  </div>
                  <Button>
                    <Download className="w-4 h-4 mr-2" />
                    Demander un retrait
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-3 mb-8">
                    <div className="bg-purple-50 rounded-xl p-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Montant disponible</h3>
                      <p className="text-3xl font-bold text-brand-purple">
                        {stats.revenue.toFixed(2)} €
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">En attente</h3>
                      <p className="text-3xl font-bold">0,00 €</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Total reçu</h3>
                      <p className="text-3xl font-bold">0,00 €</p>
                    </div>
                  </div>

                  <h3 className="font-medium mb-4">Historique des paiements</h3>
                  {stats.revenue === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">
                        Vous n'avez pas encore reçu de paiements. Les paiements seront
                        affichés ici une fois traités.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Sample payment history will be replaced with real data */}
                      {[
                        { date: "15 Oct 2023", amount: "350,00 €", method: "PayPal", status: "Complété" },
                        { date: "15 Sep 2023", amount: "228,00 €", method: "PayPal", status: "Complété" },
                      ].map((payment, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                          <div>
                            <p className="font-medium">{payment.date}</p>
                            <p className="text-sm text-gray-500">Via {payment.method}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{payment.amount}</p>
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                              {payment.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default Dashboard;
