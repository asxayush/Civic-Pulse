import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children, roles }) => {
    const { currentUser, loading, isAuthenticated } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-zinc-500 text-sm font-mono animate-pulse">Loading…</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    if (roles && !roles.includes(currentUser.role)) {
        const home =
            currentUser.role === "admin"
                ? "/admin"
                : currentUser.role === "staff"
                  ? "/staff"
                  : "/app";
        return <Navigate to={home} replace />;
    }

    return children;
};

export const roleHome = (role) => {
    if (role === "admin") return "/admin";
    if (role === "staff") return "/staff";
    return "/app";
};
