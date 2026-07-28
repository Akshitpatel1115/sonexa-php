import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import logoImg from "../../assets/sonexa-logo.png";
import { FiHome, FiDisc, FiPlusSquare, FiMusic, FiLogIn, FiUserPlus, FiUser, FiUsers } from "react-icons/fi";
import useAuth from "../../context/useAuth";
import { getAvatarSrc } from "../../utils/avatars";

const Sidebar = React.memo(() => {
  const { user, isAuthenticated } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const role = user?.role;

  const navLinks = [
    { name: "Home", path: "/", icon: FiHome },
    { name: "Musics", path: "/musics", icon: FiMusic },
    { name: "Albums", path: "/album", icon: FiDisc },
  ];

  const authLinks = [
    { name: "Login", path: "/login", icon: FiLogIn },
    { name: "Register", path: "/register", icon: FiUserPlus },
  ];

  return (
    <div className={`hidden md:flex relative h-[calc(100vh-2rem)] my-4 ml-4 transition-[width] duration-300 ease-out will-change-[width] ${isCollapsed ? 'w-20' : 'w-20 lg:w-64'} shrink-0 z-20`}>
      <aside className="flex flex-col w-full h-full glass-panel rounded-3xl p-4 gap-4 select-none relative overflow-hidden border border-white/5">
      {/* Glow background accent inside sidebar */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#6C63FF]/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top Logo & Toggle */}
      <div className={`flex ${isCollapsed ? 'justify-center mt-1' : 'items-center justify-between px-2'} py-1 mb-2`}>
        <div 
          className="flex items-center gap-3 cursor-pointer group/logo"
          onClick={() => { if (isCollapsed) setIsCollapsed(false); }}
          title={isCollapsed ? "Expand Sidebar" : ""}
        >
          <div className="relative w-10 h-10 rounded-2xl overflow-hidden glass-card p-1 flex items-center justify-center border border-white/5 shadow-lg group-hover/logo:scale-105 transition-transform shrink-0">
            <img 
              src={logoImg} 
              alt="SONEXA Logo" 
              className={`w-full h-full object-cover transition-opacity duration-300 ${isCollapsed ? 'group-hover/logo:opacity-0' : ''}`} 
            />
            {isCollapsed && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300 bg-white/5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                  <line x1="9" x2="9" y1="3" y2="21"/>
                </svg>
              </div>
            )}
          </div>
          <div className={`flex-col ${isCollapsed ? 'hidden' : 'hidden lg:flex'}`}>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
              SONEXA
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Spatial Sound</span>
          </div>
        </div>

        {!isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(true)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-all"
            title="Collapse Sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
              <line x1="9" x2="9" y1="3" y2="21"/>
            </svg>
          </button>
        )}
      </div>
      {/* Navigation */}
      <nav className="flex flex-col gap-1.5 flex-1 mt-2">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) => `
                flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200
                ${isActive
                  ? "glass-pill-active"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
                }
              `}
              title={link.name}
            >
              <Icon className="text-lg shrink-0" />
              <span className={`${isCollapsed ? 'hidden' : 'hidden lg:block'} truncate`}>{link.name}</span>
            </NavLink>
          );
        })}

        {/* Artist Section */}
        {role === "artist" && (
          <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-1.5">
            <span className={`${isCollapsed ? 'hidden' : 'hidden lg:block'} text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1`}>Artist Tools</span>
            <NavLink
              to="/create-album"
              className={({ isActive }) => `
                flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200
                ${isActive
                  ? "glass-pill-active"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
                }
              `}
              title="Create Album"
            >
              <FiPlusSquare className="text-lg shrink-0 text-emerald-400" />
              <span className={`${isCollapsed ? 'hidden' : 'hidden lg:block'} truncate`}>Create Album</span>
            </NavLink>
            <NavLink
              to="/createMusic"
              className={({ isActive }) => `
                flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200
                ${isActive
                  ? "glass-pill-active"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
                }
              `}
              title="Create Music"
            >
              <FiMusic className="text-lg shrink-0 text-[#6C63FF]" />
              <span className={`${isCollapsed ? 'hidden' : 'hidden lg:block'} truncate`}>Create Music</span>
            </NavLink>
          </div>
        )}
      </nav>

      {/* Auth Links / User Card (Bottom) */}
      {isAuthenticated ? (
        <div className="mt-auto border-t border-white/5 pt-3">
          <Link to="/profile" className="flex items-center gap-3 rounded-2xl p-2 glass-card hover:bg-white/10 transition-colors cursor-pointer">
            <img 
              src={getAvatarSrc(user?.avatar)}
              alt={user?.username || "Profile"}
              className="h-9 w-9 rounded-xl object-cover shrink-0 shadow-md border border-white/5"
            />

            <div className={`${isCollapsed ? 'hidden' : 'hidden lg:block'} overflow-hidden`}>
              <p className="truncate text-xs font-semibold text-white">
                {user?.username}
              </p>

              <p className="truncate text-[10px] capitalize text-slate-400">
                {user?.role} Account
              </p>
            </div>
          </Link>
        </div>
      ) : (
        <div className="mt-auto border-t border-white/5 pt-3 flex flex-col gap-1.5">
          {authLinks.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) => `
                  flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200
                  ${isActive
                    ? "glass-pill-active"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                <Icon className="text-lg shrink-0" />
                <span className={`${isCollapsed ? 'hidden' : 'hidden lg:block'}`}>
                  {link.name}
                </span>
              </NavLink>
            );
          })}
        </div>
      )}
      </aside>
    </div>
  );
});

export default Sidebar;
