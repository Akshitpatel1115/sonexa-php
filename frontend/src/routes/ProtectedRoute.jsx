import { Navigate, Outlet } from "react-router-dom";
import { isLoggedIn, getUser } from "../utils/auth";

const ProtectedRoute = () => {
    const user = getUser();
    if (isLoggedIn() && user?.role === "admin") {
        return <Navigate to="/admin/dashboard" replace />;
    }
    return isLoggedIn() ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;