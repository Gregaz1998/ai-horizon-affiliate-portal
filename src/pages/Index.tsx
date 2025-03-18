
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Award, DollarSign, Users } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";

const Index = () => {
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    },
  };

  // Features data
  const features = [
    {
      icon: <TrendingUp className="h-8 w-8 text-brand-blue" />,
      title: "Gains Illimités",
      description:
        "Aucune limite sur vos gains. Plus vous partagez, plus vous gagnez.",
    },
    {
      icon: <Award className="h-8 w-8 text-brand-blue" />,
      title: "Récompenses Exclusives",
      description:
        "Bonus spéciaux et avantages pour nos meilleurs affiliés chaque mois.",
    },
    {
      icon: <DollarSign className="h-8 w-8 text-brand-blue" />,
      title: "Paiements Rapides",
      description:
        "Retirez vos gains rapidement via PayPal ou virement bancaire.",
    },
    {
      icon: <Users className="h-8 w-8 text-brand-blue" />,
      title: "Réseau d'Impact",
      description:
        "Transformez votre audience en une source de revenus passive.",
    },
  ];

  // Steps data
  const steps = [
    {
      number: "01",
      title: "Inscription Simple",
      description: "Créez votre compte en 5 étapes rapides et intuitives.",
    },
    {
      number: "02",
      title: "Génération de Lien",
      description: "Obtenez instantanément votre lien d'affiliation unique.",
    },
    {
      number: "03",
      title: "Partagez",
      description: "Diffusez votre lien à travers vos réseaux et canaux.",
    },
    {
      number: "04",
      title: "Suivez vos Performances",
      description: "Analysez vos résultats en temps réel via le tableau de bord.",
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-28 pb-16 md:pt-40 md:pb-24">
        <div className="responsive-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              <span className="text-gradient">Monétisez</span> votre réseau avec AI Horizon
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10">
              Rejoignez notre programme d'affiliation et transformez vos recommandations en revenus. 
              Commencez dès maintenant et propulsez vos gains.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-brand-blue hover:bg-blue-600 transition-colors btn-hover-effect rounded-xl px-8 py-6 text-white font-medium">
                <NavLink to="/register">
                  Commencer maintenant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </NavLink>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl px-8 py-6">
                <a href="#how-it-works">En savoir plus</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-secondary/50">
        <div className="responsive-container">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="animate-on-scroll"
          >
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pourquoi choisir notre programme d'affiliation
              </h2>
              <p className="text-lg text-gray-600">
                Une opportunité unique de générer des revenus tout en recommandant des produits que vous aimez.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={item}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 card-hover"
                >
                  <div className="mb-4 p-3 bg-blue-50 inline-block rounded-xl">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24">
        <div className="responsive-container">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="animate-on-scroll"
          >
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Comment ça fonctionne
              </h2>
              <p className="text-lg text-gray-600">
                Suivez ces étapes simples pour commencer à générer des revenus dès aujourd'hui.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  variants={item}
                  className="relative"
                >
                  <div className="text-4xl font-bold text-gray-100 absolute -top-6 -left-2 select-none">
                    {step.number}
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm relative z-10 card-hover border border-gray-100">
                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>

                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 left-[calc(100%-20px)] w-[calc(100%-40px)] h-[2px] bg-gray-200 -translate-y-1/2 z-0"></div>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <Button asChild size="lg" className="bg-brand-blue hover:bg-blue-600 transition-colors btn-hover-effect rounded-xl px-8 py-6 text-white font-medium">
                <NavLink to="/register">
                  Rejoindre le programme
                  <ArrowRight className="ml-2 h-5 w-5" />
                </NavLink>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-brand-blue">
        <div className="responsive-container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto text-white"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Prêt à générer des revenus avec AI Horizon ?
            </h2>
            <p className="text-xl opacity-90 mb-10">
              Inscris-toi maintenant et commence à monétiser ton réseau !
            </p>
            <Button asChild size="lg" className="bg-white text-brand-blue hover:bg-gray-100 transition-colors btn-hover-effect rounded-xl px-8 py-6 font-medium">
              <NavLink to="/register">
                S'inscrire maintenant
                <ArrowRight className="ml-2 h-5 w-5" />
              </NavLink>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
