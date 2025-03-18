
import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, BarChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Copy, Download, TrendingUp, Clock, Link as LinkIcon, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import AffiliateStats from "@/components/AffiliateStats";

// Sample data
const performanceData = [
  { name: "Jan", clicks: 65, conversions: 4, revenue: 42 },
  { name: "Fév", clicks: 78, conversions: 5, revenue: 63 },
  { name: "Mar", clicks: 90, conversions: 6, revenue: 78 },
  { name: "Avr", clicks: 81, conversions: 5, revenue: 68 },
  { name: "Mai", clicks: 156, conversions: 10, revenue: 125 },
  { name: "Juin", clicks: 230, conversions: 17, revenue: 213 },
  { name: "Juil", clicks: 310, conversions: 22, revenue: 298 },
  { name: "Août", clicks: 220, conversions: 15, revenue: 189 },
  { name: "Sep", clicks: 201, conversions: 14, revenue: 170 },
  { name: "Oct", clicks: 251, conversions: 18, revenue: 220 },
  { name: "Nov", clicks: 298, conversions: 21, revenue: 273 },
  { name: "Déc", clicks: 101, conversions: 7, revenue: 88 },
];

const latestConversions = [
  { id: 1, product: "AI Horizon Pro", date: "Aujourd'hui, 15:32", amount: "99,00 €", status: "Validé" },
  { id: 2, product: "AI Horizon Enterprise", date: "Hier, 10:14", amount: "299,00 €", status: "En attente" },
  { id: 3, product: "AI Horizon Pro", date: "18 Oct, 18:05", amount: "99,00 €", status: "Validé" },
  { id: 4, product: "AI Horizon Basic", date: "16 Oct, 09:22", amount: "49,00 €", status: "Validé" },
  { id: 5, product: "AI Horizon Pro", date: "14 Oct, 14:39", amount: "99,00 €", status: "Validé" },
];

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState("yearly");
  const { toast } = useToast();
  
  const affiliateLink = "aihorizon.com/ref/johndoe-a1b2c3";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    toast({
      description: "Lien d'affiliation copié !",
    });
  };

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
              <CardHeader className="bg-gradient-to-r from-brand-blue to-blue-600 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Votre lien d'affiliation</CardTitle>
                    <CardDescription className="text-blue-100">
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
                    <span className="text-gray-800 font-medium">{affiliateLink}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-8">
            <AffiliateStats />
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
                    <TrendingUp className="h-5 w-5 mr-2 text-brand-blue" />
                    Performance
                  </CardTitle>
                  <CardDescription>
                    Vue d'ensemble de vos statistiques d'affiliation
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                          stroke="#0066FF" 
                          strokeWidth={2} 
                          dot={{ r: 4 }} 
                          activeDot={{ r: 6 }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="conversions" 
                          stroke="#26C6DA" 
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
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-brand-blue" />
                      Trafic par source
                    </CardTitle>
                    <CardDescription>
                      D'où viennent vos visiteurs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: "Social", value: 45 },
                            { name: "Blog", value: 28 },
                            { name: "Direct", value: 15 },
                            { name: "Email", value: 12 },
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
                          <Bar dataKey="value" fill="#0066FF" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-brand-blue" />
                      Activité récente
                    </CardTitle>
                    <CardDescription>
                      Dernières interactions avec vos liens
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
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
                          <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-brand-blue rounded-full">
                            {item.source}
                          </span>
                        </div>
                      ))}
                    </div>
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
                        {latestConversions.map((conversion) => (
                          <tr key={conversion.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              #{conversion.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {conversion.product}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {conversion.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {conversion.amount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  conversion.status === "Validé"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {conversion.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
                    <div className="bg-blue-50 rounded-xl p-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Montant disponible</h3>
                      <p className="text-3xl font-bold text-brand-blue">468,90 €</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">En attente</h3>
                      <p className="text-3xl font-bold">299,00 €</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Total reçu</h3>
                      <p className="text-3xl font-bold">1 254,00 €</p>
                    </div>
                  </div>

                  <h3 className="font-medium mb-4">Historique des paiements</h3>
                  <div className="space-y-4">
                    {[
                      { date: "15 Oct 2023", amount: "350,00 €", method: "PayPal", status: "Complété" },
                      { date: "15 Sep 2023", amount: "228,00 €", method: "PayPal", status: "Complété" },
                      { date: "15 Août 2023", amount: "176,00 €", method: "PayPal", status: "Complété" },
                      { date: "15 Juil 2023", amount: "500,00 €", method: "PayPal", status: "Complété" },
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
