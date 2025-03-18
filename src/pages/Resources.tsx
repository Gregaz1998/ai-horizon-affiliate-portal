
import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Layout from "@/components/Layout";
import ResourceCard from "@/components/ResourceCard";

// Sample resources data
const resourcesData = [
  {
    id: 1,
    title: "Guide de démarrage rapide",
    description: "Apprenez les bases du marketing d'affiliation et comment commencer à générer des revenus.",
    imageUrl: "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Guide",
    downloadable: true,
    type: "guide",
  },
  {
    id: 2,
    title: "Bannières promotionnelles",
    description: "Collection de bannières de haute qualité pour promouvoir AI Horizon sur votre site web.",
    imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Visuel",
    downloadable: true,
    type: "promotional",
  },
  {
    id: 3,
    title: "Modèles d'emails",
    description: "Emails pré-rédigés pour promouvoir AI Horizon auprès de votre liste d'abonnés.",
    imageUrl: "https://images.unsplash.com/photo-1526948531399-320e7e40f0ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Email",
    downloadable: true,
    type: "promotional",
  },
  {
    id: 4,
    title: "Webinaire : Maximiser vos revenus d'affiliation",
    description: "Apprenez des stratégies avancées pour optimiser vos revenus d'affiliation avec AI Horizon.",
    imageUrl: "https://images.unsplash.com/photo-1591115765373-5207764f72e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Webinaire",
    link: "#",
    type: "training",
  },
  {
    id: 5,
    title: "Posts pour réseaux sociaux",
    description: "Collection de posts pré-rédigés pour promouvoir AI Horizon sur vos réseaux sociaux.",
    imageUrl: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Social Media",
    downloadable: true,
    type: "promotional",
  },
  {
    id: 6,
    title: "Guide SEO pour affiliés",
    description: "Apprenez à optimiser votre contenu pour les moteurs de recherche et augmenter votre trafic.",
    imageUrl: "https://images.unsplash.com/photo-1432888622747-4eb9a8f5a70d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Guide",
    downloadable: true,
    type: "guide",
  },
  {
    id: 7,
    title: "Cours : Marketing d'affiliation avancé",
    description: "Formation complète sur les techniques avancées du marketing d'affiliation.",
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Formation",
    link: "#",
    type: "training",
  },
  {
    id: 8,
    title: "Analyse de cas concrets",
    description: "Études de cas de nos affiliés les plus performants et leurs stratégies gagnantes.",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Étude de cas",
    link: "#",
    type: "guide",
  },
];

const Resources = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredResources = resourcesData.filter((resource) => {
    // Filter by search query
    const matchesSearch =
      searchQuery === "" ||
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.category.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by tab
    const matchesTab = activeTab === "all" || resource.type === activeTab;

    return matchesSearch && matchesTab;
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

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
              Centre de ressources
            </span>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Tout ce dont vous avez besoin pour réussir
            </h1>
            <p className="text-lg text-gray-600">
              Accédez à nos guides, modèles et formations pour maximiser vos gains en tant qu'affilié.
            </p>
          </motion.div>

          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher une ressource..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="mb-8"
          >
            <div className="flex justify-center mb-8">
              <TabsList>
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="guide">Guides</TabsTrigger>
                <TabsTrigger value="promotional">Promotionnel</TabsTrigger>
                <TabsTrigger value="training">Formation</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab}>
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredResources.length > 0 ? (
                  filteredResources.map((resource) => (
                    <motion.div key={resource.id} variants={item}>
                      <ResourceCard
                        title={resource.title}
                        description={resource.description}
                        imageUrl={resource.imageUrl}
                        category={resource.category}
                        link={resource.link}
                        downloadable={resource.downloadable}
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">
                      Aucune ressource ne correspond à votre recherche.
                    </p>
                  </div>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default Resources;
