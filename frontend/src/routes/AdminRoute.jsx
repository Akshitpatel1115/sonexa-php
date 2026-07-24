import { useContext } from "react";
import { Outlet } from "react-router-dom";
import { AdminAuthContext } from "../context/AdminAuthContext";
import Loader from "../components/common/Loader";
import NotFound from "../pages/NotFound";

const AdminRoute = () => {
  const { isAuthenticated, loading } = useContext(AdminAuthContext);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader />
      </div>
    );
  }

  // Strictly enforce security: If not authenticated, render a 404 to mask the route's existence.
  if (!isAuthenticated) {
    return <NotFound />;
  }

  return <Outlet />;
};

export default AdminRoute;
