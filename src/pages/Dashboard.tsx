import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!user && !isLoading) {
      navigate("/");
    }

    // Mocked stats for demonstration
    setStats({
      totalClicks: 1250,
      totalConversions: 230,
      totalRevenue: 4500,
      conversionRate: 18.4,
    });
  }, [user, isLoading, navigate]);

  if (isLoading) {
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tableau de bord</h1>
      <p>Bienvenue, {user.email} !</p>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-white shadow-sm rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Total Clics</h2>
            <p className="text-3xl font-bold">{stats.totalClicks}</p>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Total Conversions</h2>
            <p className="text-3xl font-bold">{stats.totalConversions}</p>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Revenu Total</h2>
            <p className="text-3xl font-bold">${stats.totalRevenue}</p>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Taux de Conversion</h2>
            <p className="text-3xl font-bold">{stats.conversionRate}%</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Fix the Stats type mismatch error
type Stats = {
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  conversionRate: number;
};

export default Dashboard;
