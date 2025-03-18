
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Users, DollarSign, MousePointer } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  delay: number;
}

interface Stats {
  clicks: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
}

interface AffiliateStatsProps {
  stats: Stats;
}

const StatCard = ({ title, value, icon, trend, delay }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className="bg-white rounded-xl p-6 shadow-sm flex flex-col h-full card-hover"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-lg bg-purple-50">{icon}</div>
        {trend && (
          <div
            className={`flex items-center text-sm font-medium ${
              trend.isPositive ? "text-green-600" : "text-red-500"
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            {trend.value}
          </div>
        )}
      </div>
      <div className="mt-auto">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </motion.div>
  );
};

const AffiliateStats = ({ stats }: AffiliateStatsProps) => {
  const formattedStats = [
    {
      title: "Total des clics",
      value: stats.clicks.toString(),
      icon: <MousePointer className="w-5 h-5 text-brand-purple" />,
      trend: stats.clicks > 0 
        ? { value: "+12.5%", isPositive: true }
        : undefined,
    },
    {
      title: "Conversions",
      value: stats.conversions.toString(),
      icon: <Users className="w-5 h-5 text-brand-purple" />,
      trend: stats.conversions > 0 
        ? { value: "+8.2%", isPositive: true }
        : undefined,
    },
    {
      title: "Taux de conversion",
      value: `${stats.conversionRate}%`,
      icon: <TrendingUp className="w-5 h-5 text-brand-purple" />,
      trend: stats.conversions > 0 
        ? { value: "-1.5%", isPositive: false }
        : undefined,
    },
    {
      title: "Revenus générés",
      value: `${stats.revenue.toFixed(2)}€`,
      icon: <DollarSign className="w-5 h-5 text-brand-purple" />,
      trend: stats.revenue > 0 
        ? { value: "+18.3%", isPositive: true }
        : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {formattedStats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          trend={stat.trend}
          delay={index}
        />
      ))}
    </div>
  );
};

export default AffiliateStats;
