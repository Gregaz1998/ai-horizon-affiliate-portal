
import { motion } from "framer-motion";
import { Medal, TrendingUp, TrendingDown, Minus } from "lucide-react";

type AffiliateData = {
  rank: number;
  username: string;
  conversions: number;
  revenue: string;
  change: number;
  avatar: string;
};

interface LeaderboardTableProps {
  data: AffiliateData[];
}

const LeaderboardTable = ({ data }: LeaderboardTableProps) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rang
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Affilié
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Conversions
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Revenus
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Évolution
            </th>
          </tr>
        </thead>
        <motion.tbody
          variants={container}
          initial="hidden"
          animate="show"
          className="bg-white divide-y divide-gray-200"
        >
          {data.map((affiliate) => (
            <motion.tr key={affiliate.rank} variants={item}>
              <td className="px-6 py-4 whitespace-nowrap">
                {affiliate.rank <= 3 ? (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full">
                    <Medal
                      className={`h-6 w-6 ${
                        affiliate.rank === 1
                          ? "text-yellow-500"
                          : affiliate.rank === 2
                          ? "text-gray-400"
                          : "text-amber-800"
                      }`}
                    />
                  </div>
                ) : (
                  <div className="text-center font-medium text-gray-700">
                    {affiliate.rank}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={affiliate.avatar}
                      alt={affiliate.username}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {affiliate.username}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{affiliate.conversions}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {affiliate.revenue}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {affiliate.change > 0 ? (
                  <div className="flex items-center text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>{affiliate.change}%</span>
                  </div>
                ) : affiliate.change < 0 ? (
                  <div className="flex items-center text-red-500">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    <span>{Math.abs(affiliate.change)}%</span>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-500">
                    <Minus className="h-4 w-4 mr-1" />
                    <span>0%</span>
                  </div>
                )}
              </td>
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;
