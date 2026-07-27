import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AdminAuthContext } from "../context/AdminAuthContext";
import Loader from "../components/common/Loader";
import { getUser } from "../utils/auth";

const AdminRoute = () => {
  const { isAuthenticated, loading } = useContext(AdminAuthContext);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader />
      </div>
    );
  }

  const adminToken = localStorage.getItem("admin_token") || (getUser()?.role === "admin" ? localStorage.getItem("token") : null);

  if (!isAuthenticated || !adminToken) {
    const user = getUser();
    if (user && user.role !== "admin") {
      return <Navigate to="/" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
