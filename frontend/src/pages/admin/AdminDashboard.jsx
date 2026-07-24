import { useEffect, useState } from "react";
import { getDashboardStats } from "../../services/adminService";

const StatCard = ({ title, value, color }) => (
  <div className={`bg-gray-800 p-6 rounded-lg border-l-4 ${color} shadow-md`}>
    <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">{title}</h3>
    <p className="text-3xl font-bold text-white mt-2">{value}</p>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-gray-400">Loading dashboard...</div>;
  if (!stats) return <div className="text-red-500">Failed to load statistics.</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Platform Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} color="border-blue-500" />
        <StatCard title="Total Artists" value={stats.totalArtists} color="border-purple-500" />
        <StatCard title="Active Artists" value={stats.verifiedArtists} color="border-green-500" />
        <StatCard title="Suspended Artists" value={stats.pendingArtists} color="border-red-500" />
        <StatCard title="Total Songs" value={stats.totalSongs} color="border-yellow-500" />
        <StatCard title="Total Albums" value={stats.totalAlbums} color="border-pink-500" />
      </div>
    </div>
  );
};

export default AdminDashboard;
