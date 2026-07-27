import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AdminAuthContext } from "../../context/AdminAuthContext";
import ConfirmDialog from "../common/ConfirmDialog";
import { FiActivity, FiUsers, FiMic, FiMusic, FiDisc, FiLogOut, FiShield } from "react-icons/fi";

const AdminLayout = () => {
  const { logout, admin } = useContext(AdminAuthContext);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: FiActivity },
    { name: "Users", path: "/admin/users", icon: FiUsers },
    { name: "Artists", path: "/admin/artists", icon: FiMic },
    { name: "Music", path: "/admin/music", icon: FiMusic },
    { name: "Albums", path: "/admin/albums", icon: FiDisc },
  ];

  return (
    <div className="flex h-screen bg-background text-white font-sans overflow-hidden">
      {/* Glassmorphic Sidebar */}
      <div className="w-64 glass-panel border-r border-white/5 flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6C63FF] to-[#8B5CF6] flex items-center justify-center shadow-lg">
            <FiShield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">SONEXA ADMIN</h2>
            <p className="text-[10px] text-[#6C63FF] font-extrabold uppercase tracking-widest">System Control</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/30"
                    : "text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className={`text-base ${isActive ? "text-white" : "text-[#6C63FF]"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 flex flex-col gap-3">
          <div className="px-2">
            <p className="text-[11px] text-slate-400">Logged in as:</p>
            <p className="text-xs font-bold text-white truncate">{admin?.name || "System Administrator"}</p>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-bold py-2.5 px-4 rounded-xl transition-all border border-rose-500/30 flex items-center justify-center gap-2 text-xs"
          >
            <FiLogOut className="text-sm" />
            <span>Logout Admin</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        <header className="sticky top-4 z-50 mx-4 md:mx-6 my-4 rounded-3xl glass-panel border border-white/5 h-16 sm:h-20 flex items-center px-6 justify-between shrink-0 shadow-2xl backdrop-blur-2xl transition-all duration-300">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider bg-[#6C63FF]/20 text-[#6C63FF] border border-[#6C63FF]/30 rounded-full">
              Admin Portal
            </span>
            <h1 className="text-base font-bold text-white">Management Console</h1>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 sm:p-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>

      {/* Logout Confirm Modal */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to log out of the Admin Panel?"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
};

export default AdminLayout;
