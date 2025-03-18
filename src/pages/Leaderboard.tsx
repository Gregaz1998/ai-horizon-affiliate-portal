import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Calendar, Info } from "lucide-react";
import Layout from "@/components/Layout";
import LeaderboardTable from "@/components/LeaderboardTable";

// Sample data for top affiliates
const topAffiliates = [
  {
    rank: 1,
    username: "MarketingPro",
    conversions: 157,
    revenue: "15,890 €",
    change: 12,
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    rank: 2,
    username: "DigitalExpert",
    conversions: 142,
    revenue: "12,745 €",
    change: 5,
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    rank: 3,
    username: "TechInfluencer",
    conversions: 132,
    revenue: "11,560 €",
    change: 8,
    avatar: "https://randomuser.me/api/portraits/men/86.jpg",
  },
  {
    rank: 4,
    username: "AffiliateKing",
    conversions: 118,
    revenue: "10,290 €",
    change: -2,
    avatar: "https://randomuser.me/api/portraits/men/55.jpg",
  },
  {
    rank: 5,
    username: "ContentCreator",
    conversions: 105,
    revenue: "9,340 €",
    change: 4,
    avatar: "https://randomuser.me/api/portraits/women/63.jpg",
  },
  {
    rank: 6,
    username: "TechBlogger",
    conversions: 96,
    revenue: "8,760 €",
    change: 0,
    avatar: "https://randomuser.me/api/portraits/men/36.jpg",
  },
  {
    rank: 7,
    username: "MarketingGuru",
    conversions: 88,
    revenue: "7,880 €",
    change: -3,
    avatar: "https://randomuser.me/api/portraits/women/24.jpg",
  },
  {
    rank: 8,
    username: "DigitalNomad",
    conversions: 78,
    revenue: "6,920 €",
    change: 2,
    avatar: "https://randomuser.me/api/portraits/men/29.jpg",
  },
  {
    rank: 9,
    username: "AIPioneer",
    conversions: 72,
    revenue: "6,340 €",
    change: 9,
    avatar: "https://randomuser.me/api/portraits/women/14.jpg",
  },
  {
    rank: 10,
    username: "WebGenius",
    conversions: 65,
    revenue: "5,720 €",
    change: -1,
    avatar: "https://randomuser.me/api/portraits/men/42.jpg",
  },
];

// Monthly top performers
const monthlyTopPerformers = [
  {
    rank: 1,
    username: "ContentCreator",
    conversions: 58,
    revenue: "5,210 €",
    change: 15,
    avatar: "https://randomuser.me/api/portraits/women/63.jpg",
  },
  {
    rank: 2,
    username: "TechBlogger",
    conversions: 52,
    revenue: "4,680 €",
    change: 22,
    avatar: "https://randomuser.me/api/portraits/men/36.jpg",
  },
  {
    rank: 3,
    username: "MarketingPro",
    conversions: 49,
    revenue: "4,410 €",
    change: 8,
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  // ... other entries
];

// Newcomers top performers
const newcomersTopPerformers = [
  {
    rank: 1,
    username: "AIInnovator",
    conversions: 42,
    revenue: "3,780 €",
    change: 100,
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
  },
  {
    rank: 2,
    username: "StartupGuide",
    conversions: 38,
    revenue: "3,420 €",
    change: 100,
    avatar: "https://randomuser.me/api/portraits/men/71.jpg",
  },
  {
    rank: 3,
    username: "TechSolutions",
    conversions: 35,
    revenue: "3,150 €",
    change: 100,
    avatar: "https://randomuser.me/api/portraits/women/58.jpg",
  },
  // ... other entries
];

const Leaderboard = () => {
  return (
    <Layout>
      <section className="pt-28 pb-16">
        <div className="responsive-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center mb-12"
          >
            <span className="inline-block px-3 py-1 bg-blue-100 text-brand-blue rounded-full text-sm font-medium mb-4">
              Classement
            </span>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Top Affiliés AI Horizon
            </h1>
            <p className="text-lg text-gray-600">
              Découvrez nos meilleurs affiliés et rejoignez le classement pour bénéficier de récompenses exclusives.
            </p>
          </motion.div>

          {/* Top Performers Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-lg transform transition hover:scale-105 duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-white">
                  <Trophy className="mr-2 h-5 w-5" />
                  1ère Place
                </CardTitle>
                <CardDescription className="text-yellow-100">
                  Meilleur affilié toutes catégories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <img
                    src="https://randomuser.me/api/portraits/men/32.jpg"
                    alt="MarketingPro"
                    className="h-14 w-14 rounded-full border-2 border-white"
                  />
                  <div className="ml-4">
                    <h3 className="font-bold text-lg">MarketingPro</h3>
                    <p className="text-yellow-100">15,890 € de revenus générés</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-lg transform transition hover:scale-105 duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-white">
                  <Trophy className="mr-2 h-5 w-5" />
                  2ème Place
                </CardTitle>
                <CardDescription className="text-gray-100">
                  Deuxième meilleur affilié
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <img
                    src="https://randomuser.me/api/portraits/women/44.jpg"
                    alt="DigitalExpert"
                    className="h-14 w-14 rounded-full border-2 border-white"
                  />
                  <div className="ml-4">
                    <h3 className="font-bold text-lg">DigitalExpert</h3>
                    <p className="text-gray-100">12,745 € de revenus générés</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-700 to-amber-900 text-white shadow-lg transform transition hover:scale-105 duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-white">
                  <Trophy className="mr-2 h-5 w-5" />
                  3ème Place
                </CardTitle>
                <CardDescription className="text-amber-100">
                  Troisième meilleur affilié
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <img
                    src="https://randomuser.me/api/portraits/men/86.jpg"
                    alt="TechInfluencer"
                    className="h-14 w-14 rounded-full border-2 border-white"
                  />
                  <div className="ml-4">
                    <h3 className="font-bold text-lg">TechInfluencer</h3>
                    <p className="text-amber-100">11,560 € de revenus générés</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard Tabs */}
          <Tabs defaultValue="all-time" className="mb-8">
            <div className="flex justify-center mb-8">
              <TabsList>
                <TabsTrigger value="all-time" className="flex items-center">
                  <Trophy className="h-4 w-4 mr-2" />
                  Top Global
                </TabsTrigger>
                <TabsTrigger value="monthly" className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Top Mensuel
                </TabsTrigger>
                <TabsTrigger value="newcomers" className="flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  Nouveaux Talents
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all-time">
              <Card>
                <CardHeader>
                  <CardTitle>Top Affiliés — Classement Global</CardTitle>
                  <CardDescription>
                    Les meilleurs affiliés de tous les temps basés sur les revenus générés
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LeaderboardTable data={topAffiliates} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monthly">
              <Card>
                <CardHeader>
                  <CardTitle>Top Affiliés — Ce Mois</CardTitle>
                  <CardDescription>
                    Les meilleurs affiliés du mois en cours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LeaderboardTable data={monthlyTopPerformers} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="newcomers">
              <Card>
                <CardHeader>
                  <CardTitle>Top Nouveaux Affiliés</CardTitle>
                  <CardDescription>
                    Les meilleurs affiliés ayant rejoint la plateforme ces 30 derniers jours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LeaderboardTable data={newcomersTopPerformers} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Rewards Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
            className="bg-gradient-to-r from-brand-blue to-blue-600 text-white rounded-2xl p-8 mt-10"
          >
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Programme de Récompenses Exclusives
              </h2>
              <p className="text-lg opacity-90 mb-8">
                En tant que top affilié, vous bénéficiez d'avantages et de récompenses exclusifs.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                  <div className="bg-white/20 rounded-full p-3 inline-block mb-4">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">Bonus Mensuels</h3>
                  <p className="opacity-80">
                    Recevez des bonus financiers supplémentaires en fonction de votre classement.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                  <div className="bg-white/20 rounded-full p-3 inline-block mb-4">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">Événements VIP</h3>
                  <p className="opacity-80">
                    Accès à des événements exclusifs et sessions de formation privées.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                  <div className="bg-white/20 rounded-full p-3 inline-block mb-4">
                    <Info className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">Commissions Majorées</h3>
                  <p className="opacity-80">
                    Bénéficiez de taux de commission plus élevés selon votre niveau de performance.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Leaderboard;
