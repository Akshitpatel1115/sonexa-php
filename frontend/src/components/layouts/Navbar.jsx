import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";
import { usePlayer } from "../../context/PlayerContext";
import api from "../../api/axios";
import { FiLogOut, FiMoon, FiSun } from "react-icons/fi";
import ConfirmDialog from "../common/ConfirmDialog";
import GlobalSearch from "../common/GlobalSearch";
import logoImg from "../../assets/sonexa-logo.png";
import { getAvatarSrc } from "../../utils/avatars";
import { useTheme } from "../../context/ThemeContext";

const Navbar = React.memo(() => {
  const { signOut, user } = useAuth();
  const { clearHistory } = usePlayer();
  const navigate = useNavigate();
  const { effectiveTheme, changeTheme } = useTheme();

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const confirmLogout = async () => {
    try {
      await api.post("/auth/logout");
      clearHistory();
      signOut();
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header className="sticky top-4 z-50 mx-4 md:mx-6 my-4 flex h-16 sm:h-20 items-center justify-between rounded-3xl glass-panel border border-white/5 px-5 md:px-7 shadow-2xl backdrop-blur-2xl transition-all duration-300">
      {/* Left Greeting */}
      <div className="flex-1 flex items-center gap-3">
        {/* Mobile Logo */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/5 md:hidden">
          <img src={logoImg} alt="SONEXA Logo" className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-1.5">
            <span>
              {getGreeting()}, <span className="gradient-text">{user?.username || 'Guest'}</span>
            </span>
          </h1>
          <p className="hidden sm:flex text-xs text-slate-300 font-medium items-center gap-1.5 mt-0.5">
            <span>Let the music take you away</span>
            <span className="inline-block animate-bounce">🎵</span>
          </p>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="hidden sm:flex flex-1 justify-center px-4 max-w-xl">
        <div className="w-full max-w-md">
          <GlobalSearch />
        </div>
      </div>

      {/* Right User Controls */}
      <div className="flex-1 flex items-center justify-end gap-2 sm:gap-3">
        {/* User Profile Badge & Logout */}
        {user && (
          <>
            <button
              onClick={() => changeTheme(effectiveTheme === 'dark' ? 'light' : 'dark')}
              className="relative p-2 w-9 h-9 flex items-center justify-center rounded-full glass-card hover:bg-white/20 transition-all shadow-md group cursor-pointer"
              title={`Switch to ${effectiveTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <FiSun className={`absolute w-5 h-5 text-amber-300 transition-all duration-500 ease-spring ${effectiveTheme === 'dark' ? 'opacity-0 scale-50 -rotate-90' : 'opacity-100 scale-100 rotate-0'}`} />
                <FiMoon className={`absolute w-5 h-5 text-indigo-300 transition-all duration-500 ease-spring ${effectiveTheme === 'light' ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0'}`} />
              </div>
            </button>

            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-full glass-card hover:bg-white/20 p-1.5 pr-3 transition-all shadow-md cursor-pointer group"
              title="View Profile"
            >
              <img
                src={getAvatarSrc(user.avatar)}
                alt={user.username || "Profile"}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-[#6C63FF]/60 group-hover:scale-105 transition-transform"
              />
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-xs font-bold text-white max-w-[100px] truncate">
                  {user.username || "Profile"}
                </span>
                {user.role && (
                  <span className="text-[9px] font-black tracking-widest text-[#6C63FF] uppercase group-hover:text-white transition-colors mt-0.5">
                    {user.role}
                  </span>
                )}
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="flex shrink-0 items-center gap-2 rounded-2xl glass-card hover:bg-white/20 p-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-white transition-all shadow-md active:scale-95 cursor-pointer"
              title="Logout"
            >
              <FiLogOut className="text-[#EF4444]" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        )}
      </div>

      <ConfirmDialog 
        isOpen={showLogoutDialog}
        title="Logout"
        message="Are you sure you want to log out?"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutDialog(false)}
      />
    </header>
  );
});

export default Navbar;
