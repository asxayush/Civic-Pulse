import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authService } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setCurrentUser(null);
            setLoading(false);
            return null;
        }
        try {
            const res = await authService.getCurrentUser();
            const user = res.data || null;
            setCurrentUser(user);
            return user;
        } catch {
            localStorage.removeItem("token");
            setCurrentUser(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const loginSuccess = (user) => {
        setCurrentUser(user);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setCurrentUser(null);
    };

    const isAuthenticated = Boolean(currentUser?.email);

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                loading,
                isAuthenticated,
                loginSuccess,
                logout,
                refreshUser,
                setCurrentUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
