import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../context/useAuth";

const PublicRoute = () => {
  const { isAuthenticated, user } = useAuth();
  const token = localStorage.getItem("token") || localStorage.getItem("admin_token");

  if (isAuthenticated && token) {
    if (user?.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
