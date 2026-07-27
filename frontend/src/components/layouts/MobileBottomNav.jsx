import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiHome, FiDisc, FiPlusSquare, FiMusic, FiLogIn, FiLogOut, FiUser } from "react-icons/fi";
import useAuth from "../../context/useAuth";
import api from "../../api/axios";
import ConfirmDialog from "../common/ConfirmDialog";

const MobileBottomNav = () => {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const confirmLogout = async () => {
    try {
      await api.post("/auth/logout");
      signOut();
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const navLinks = [
    { name: "Home", path: "/", icon: FiHome },
    { name: "Albums", path: "/album", icon: FiDisc },
  ];

  if (isAuthenticated) {
    navLinks.push({ name: "Profile", path: "/profile", icon: FiUser });
  }

  if (user?.role === "artist") {
    navLinks.push({ name: "Album+", path: "/create-album", icon: FiPlusSquare });
    navLinks.push({ name: "Music+", path: "/createMusic", icon: FiMusic });
  }

  return (
    <div className="md:hidden mx-3 mb-3 rounded-3xl glass-panel border border-white/5 h-16 shrink-0 z-50 pb-safe shadow-2xl backdrop-blur-2xl flex items-center justify-around px-2">
      {navLinks.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) => `
              flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-200
              ${
                isActive
                  ? "text-[#6C63FF] font-extrabold scale-105"
                  : "text-slate-400 hover:text-white"
              }
            `}
          >
            <Icon className="text-xl" />
            <span className="text-[10px] font-medium tracking-wide">{link.name}</span>
          </NavLink>
        );
      })}

      {!isAuthenticated ? (
        <NavLink
          to="/login"
          className={({ isActive }) => `
            flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-200
            ${isActive ? "text-[#6C63FF] font-extrabold scale-105" : "text-slate-400 hover:text-white"}
          `}
        >
          <FiLogIn className="text-xl" />
          <span className="text-[10px] font-medium tracking-wide">Login</span>
        </NavLink>
      ) : (
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors text-slate-400 hover:text-rose-400"
        >
          <FiLogOut className="text-xl" />
          <span className="text-[10px] font-medium tracking-wide">Logout</span>
        </button>
      )}

      <ConfirmDialog 
        isOpen={showLogoutDialog}
        title="Logout"
        message="Are you sure you want to log out?"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutDialog(false)}
      />
    </div>
  );
};

export default MobileBottomNav;
