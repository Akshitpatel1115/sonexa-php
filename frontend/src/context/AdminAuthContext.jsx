import { createContext, useState, useEffect } from "react";
import { adminLogin, adminLogout, getAdminMe } from "../services/adminService";

const AdminAuthContext = createContext();

const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("admin_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmin = async () => {
      if (token) {
        try {
          const adminData = await getAdminMe();
          setAdmin(adminData);
        } catch (error) {
          console.error("Failed to fetch admin data", error);
          setToken(null);
          localStorage.removeItem("admin_token");
        }
      }
      setLoading(false);
    };
    fetchAdmin();
  }, [token]);

  const login = async (credentials) => {
    const data = await adminLogin(credentials);
    setToken(data.access_token);
    setAdmin(data.admin);
    localStorage.setItem("admin_token", data.access_token);
    return data;
  };

  const logout = async () => {
    try {
      if (token) await adminLogout();
    } catch (e) {
      console.error(e);
    } finally {
      setToken(null);
      setAdmin(null);
      localStorage.removeItem("admin_token");
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!admin,
        loading
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export { AdminAuthProvider, AdminAuthContext };
