import { useEffect, useState } from "react";
import { getDashboardStats } from "../../services/adminService";
import { FiShield, FiUsers, FiMic, FiMusic, FiDisc, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass }) => (
  <div className="p-5 rounded-3xl glass-card flex flex-col gap-2 border border-white/5 hover:border-[#6C63FF]/50 transition-all duration-300 shadow-xl relative overflow-hidden group">
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</span>
      {Icon && <Icon className={`w-5 h-5 ${colorClass}`} />}
    </div>
    <span className="text-3xl font-extrabold text-white mt-1">{value}</span>
    {subtitle && <span className={`text-[11px] font-semibold ${colorClass}`}>{subtitle}</span>}
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <h2 className="text-slate-400 font-bold text-lg animate-pulse">Loading System Analytics...</h2>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <h2 className="text-rose-400 font-bold text-lg">Failed to load statistics.</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Admin Control Center Hero Banner */}
      <div className="relative w-full rounded-3xl p-6 sm:p-8 glass-panel border border-white/5 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl bg-gradient-to-r from-blue-900/40 via-indigo-950/70 to-purple-950/80">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#6C63FF] to-[#8B5CF6] flex items-center justify-center shadow-2xl shrink-0">
            <FiShield className="w-10 h-10 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider bg-[#6C63FF] text-white rounded-full">
                Sonexa System Admin
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">Admin Control Center</h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">Monitor system metrics, verify artists, manage users, and moderate music content.</p>
          </div>
        </div>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          subtitle="+18% growth this month" 
          icon={FiUsers} 
          colorClass="text-[#6C63FF]" 
        />
        <StatCard 
          title="Total Artists" 
          value={stats.totalArtists} 
          subtitle="Registered Creators" 
          icon={FiMic} 
          colorClass="text-purple-400" 
        />
        <StatCard 
          title="Active Artists" 
          value={stats.verifiedArtists} 
          subtitle="Verified Badge Active" 
          icon={FiCheckCircle} 
          colorClass="text-emerald-400" 
        />
        <StatCard 
          title="Pending Artists" 
          value={stats.pendingArtists} 
          subtitle="Awaiting Verification" 
          icon={FiAlertCircle} 
          colorClass="text-amber-400" 
        />
        <StatCard 
          title="Total Songs" 
          value={stats.totalSongs} 
          subtitle="Global CDN Stream Ready" 
          icon={FiMusic} 
          colorClass="text-cyan-400" 
        />
        <StatCard 
          title="Total Albums" 
          value={stats.totalAlbums} 
          subtitle="Published Releases" 
          icon={FiDisc} 
          colorClass="text-pink-400" 
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
