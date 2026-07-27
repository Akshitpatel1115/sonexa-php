import { Outlet, Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AdminAuthContext } from "../../context/AdminAuthContext";

const AdminLayout = () => {
  const { logout, admin } = useContext(AdminAuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-blue-500">SONEXA ADMIN</h2>
          <p className="text-xs text-gray-400 mt-1">v1.0.0</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link to="/admin/dashboard" className="block px-4 py-2 rounded hover:bg-gray-700 transition">Dashboard</Link>
          <Link to="/admin/users" className="block px-4 py-2 rounded hover:bg-gray-700 transition">Users</Link>
          <Link to="/admin/artists" className="block px-4 py-2 rounded hover:bg-gray-700 transition">Artists</Link>
          <Link to="/admin/music" className="block px-4 py-2 rounded hover:bg-gray-700 transition">Music</Link>
          <Link to="/admin/albums" className="block px-4 py-2 rounded hover:bg-gray-700 transition">Albums</Link>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <p className="text-sm text-gray-400 mb-2">Logged in as: {admin?.name}</p>
          <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-gray-800 shadow-md h-16 flex items-center px-6 border-b border-gray-700 justify-between">
            <h1 className="text-xl font-semibold">Admin Panel</h1>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
