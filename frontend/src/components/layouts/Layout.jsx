import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import FooterPlayer from "./FooterPlayer";
import MobileBottomNav from "./MobileBottomNav";
import { usePlayer } from "../../context/PlayerContext";
import { useTheme } from "../../context/ThemeContext";

const Layout = ({ children }) => {
  const { currentSong } = usePlayer();
  const { effectiveTheme } = useTheme();
  const location = useLocation();
  const hideNavbar = ['/profile', '/create-album', '/createMusic'].includes(location.pathname);
  const hideSidebar = ['/profile'].includes(location.pathname);

  const isLight = effectiveTheme === 'light';

  const getThemeClass = () => {
    if (isLight) {
      return 'theme-light bg-[#EEF2F6]';
    }
    return 'bg-[#121212]';
  };

  // Remove large padding so content fills the screen and player overlays it absolutely
  const paddingClass = "pb-36 sm:pb-40 md:pb-6";

  return (
    <div className={`flex h-[100dvh] w-full flex-col overflow-hidden text-white transition-colors duration-300 ${getThemeClass()}`}>
      
      {/* Background Glowing Ambient Blobs (Only visible in Light Theme for now) */}
      <div className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-300 ${isLight ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] rounded-full blur-[140px] animate-blob bg-gradient-to-br from-indigo-300/60 via-purple-300/40 to-blue-400/30" />
        
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[160px] animate-blob animation-delay-2000 bg-gradient-to-tr from-cyan-300/40 via-violet-300/50 to-[#6C63FF]/30" />

        <div className="absolute top-[40%] left-[30%] w-[450px] h-[450px] rounded-full blur-[150px] animate-blob animation-delay-4000 bg-pink-300/35" />


      </div>

      {/* Top Section: Sidebar + Main Content */}
      <div className="flex flex-1 overflow-hidden z-10 relative">
        {!hideSidebar && <Sidebar />}
        
        {/* Main Content Area */}
        <main className="relative flex flex-1 flex-col min-w-0 overflow-y-auto custom-scrollbar">
          {!hideNavbar && <Navbar />}
          
          <div className={`flex-1 p-4 lg:p-8 ${paddingClass}`}>
            {<Outlet />}
          </div>
        </main>
      </div>

      {/* Bottom Section: Footer Player & Mobile Nav */}
      <div className="absolute bottom-0 left-0 w-full z-50 flex flex-col pointer-events-none">
        <div className="pointer-events-auto w-full">
          <FooterPlayer />
          <MobileBottomNav />
        </div>
      </div>
    </div>
  );
};

export default Layout;
