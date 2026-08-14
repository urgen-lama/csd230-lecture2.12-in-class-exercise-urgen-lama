import { Navigate, Outlet } from "react-router";
import { useAuth } from "../provider/AuthProvider";

export const ProtectedRoute = () => {
    const { token } = useAuth();

    // If no passport, redirect to the login root
    if (!token) {
        return <Navigate to="/" replace />;
    }

    // If authenticated, render the intended child page
    return <Outlet />;
};

