import React, { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { AuthForm } from "./AuthForm";
import { useAuth } from "../context/AuthContext";
import { roleHome } from "./ProtectedRoute";
import { authService } from "../services/api";
import { ArrowLeft, Shield, Wrench, UserCheck } from "lucide-react";

const DEMOS = [
    {
        role: "Admin portal",
        email: "admin@yourcollege.edu.in",
        password: "AdminPassword123!",
        icon: Shield,
        hint: "Escalations · invalid review · users"
    },
    {
        role: "Staff",
        email: "electrician@yourcollege.edu.in",
        password: "StaffPassword123!",
        icon: Wrench,
        hint: "Assigned electricity queue"
    },
    {
        role: "Student",
        email: "student@yourcollege.edu.in",
        password: "StudentPassword123!",
        icon: UserCheck,
        hint: "File & verify tickets"
    }
];

export const LoginPage = () => {
    const { loginSuccess, isAuthenticated, currentUser, loading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [toast, setToast] = useState(null);
    const [demoLoading, setDemoLoading] = useState(null);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 text-sm">
                Loading…
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to={location.state?.from || roleHome(currentUser.role)} replace />;
    }

    const quickDemo = async (demo) => {
        setDemoLoading(demo.email);
        setToast(null);
        try {
            const res = await authService.login(demo.email, demo.password);
            const user = res.data?.user;
            loginSuccess(user);
            navigate(roleHome(user?.role || "student"), { replace: true });
        } catch (err) {
            setToast(err.response?.data?.message || "Demo login failed — run backend seed if needed");
        } finally {
            setDemoLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-black text-zinc-100 flex flex-col">
            <header className="border-b border-white/10 px-4 sm:px-6 h-14 flex items-center justify-between">
                <Link to="/">
                    <Logo className="h-8" variant="dark" showTagline={false} />
                </Link>
                <Link to="/" className="text-sm text-zinc-400 hover:text-white inline-flex items-center gap-1.5">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>
            </header>

            <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
                <div className="w-full max-w-md animate-slide-in">
                    <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Sign in</h1>
                    <p className="text-sm text-zinc-500 mb-6">Any email for new student signup · OTP verified</p>

                    <div className="mb-6 space-y-2">
                        <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">Quick demo portals</p>
                        {DEMOS.map((demo) => {
                            const Icon = demo.icon;
                            return (
                                <button
                                    key={demo.email}
                                    type="button"
                                    disabled={Boolean(demoLoading)}
                                    onClick={() => quickDemo(demo)}
                                    className="w-full text-left px-3 py-2.5 rounded-lg border border-white/10 bg-zinc-950 hover:bg-white/5 transition flex items-center gap-3 disabled:opacity-50"
                                >
                                    <Icon className="w-4 h-4 text-[#0072FF] shrink-0" />
                                    <span className="flex-1 min-w-0">
                                        <span className="block text-xs font-medium text-white">{demo.role}</span>
                                        <span className="block text-[11px] text-zinc-500 truncate">{demo.hint}</span>
                                    </span>
                                    <span className="text-[10px] font-mono text-zinc-600">
                                        {demoLoading === demo.email ? "…" : "Enter"}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="rounded-xl border border-white/10 bg-zinc-950 p-6">
                        <AuthForm
                            onLoginSuccess={(user) => {
                                loginSuccess(user);
                                navigate(roleHome(user.role), { replace: true });
                            }}
                            onError={setToast}
                        />
                    </div>

                    {toast && <p className="mt-4 text-xs text-rose-400">{toast}</p>}
                </div>
            </main>
        </div>
    );
};
