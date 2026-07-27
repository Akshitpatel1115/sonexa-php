import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../context/useAuth";

const ArtistRoute = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "artist") {
    if (user?.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ArtistRoute;