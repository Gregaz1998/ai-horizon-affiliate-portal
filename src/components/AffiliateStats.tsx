
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

const StatCard = ({ title, value, icon, trend, delay }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className="bg-white rounded-xl p-6 shadow-sm flex flex-col h-full card-hover"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-lg bg-blue-50">{icon}</div>
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

const AffiliateStats = () => {
  const stats = [
    {
      title: "Total des clics",
      value: "1,248",
      icon: <MousePointer className="w-5 h-5 text-brand-blue" />,
      trend: {
        value: "+12.5%",
        isPositive: true,
      },
    },
    {
      title: "Conversions",
      value: "86",
      icon: <Users className="w-5 h-5 text-brand-blue" />,
      trend: {
        value: "+8.2%",
        isPositive: true,
      },
    },
    {
      title: "Taux de conversion",
      value: "6.89%",
      icon: <TrendingUp className="w-5 h-5 text-brand-blue" />,
      trend: {
        value: "-1.5%",
        isPositive: false,
      },
    },
    {
      title: "Revenus générés",
      value: "1,286€",
      icon: <DollarSign className="w-5 h-5 text-brand-blue" />,
      trend: {
        value: "+18.3%",
        isPositive: true,
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
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
