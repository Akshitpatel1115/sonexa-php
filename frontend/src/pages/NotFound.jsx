import { Link } from "react-router-dom";
import { FiAlertCircle } from "react-icons/fi";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full p-4">
      <div className="glass-panel border border-white/5 p-10 sm:p-12 rounded-3xl flex flex-col items-center justify-center max-w-md text-center shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#6C63FF]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-[#6C63FF] to-[#8B5CF6] text-white shadow-xl shadow-[#6C63FF]/30 mb-6">
          <FiAlertCircle className="text-4xl" />
        </div>
        <h1 className="text-5xl font-extrabold text-white tracking-tight">404</h1>
        <h2 className="text-lg font-bold text-slate-300 mt-2">Page Not Found</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xs mt-3 leading-relaxed">
          We can't seem to find the page you are looking for. It might have been removed or the link is incorrect.
        </p>
        <Link 
          to="/"
          className="mt-8 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] px-8 py-3 text-xs font-bold text-white transition-all hover:scale-105 shadow-lg shadow-[#6C63FF]/40 border border-white/5"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
