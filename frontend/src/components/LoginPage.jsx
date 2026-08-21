import React, { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { AuthForm } from "./AuthForm";
import { useAuth } from "../context/AuthContext";
import { roleHome } from "./ProtectedRoute";
import { authService } from "../services/api";
import { ArrowLeft, Shield, Wrench, UserCheck, ArrowUpRight, LockKeyhole } from "lucide-react";

const DEMOS = [
    {
        role: "Admin portal",
        email: "admin@yourcollege.edu.in",
        password: "AdminPassword123!",
        adminPin: "1234",
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
            const res = await authService.login(demo.email, demo.password, demo.adminPin);
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
        <div className="min-h-screen bg-[#05070a] text-zinc-100 flex flex-col">
            <header className="border-b border-white/10 px-4 sm:px-8 h-16 flex items-center justify-between">
                <Link to="/">
                    <Logo className="h-8" variant="dark" showTagline={false} />
                </Link>
                <Link to="/" className="text-sm text-zinc-400 hover:text-white inline-flex items-center gap-1.5">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>
            </header>

            <main className="flex-1 flex items-center justify-center px-4 py-10 sm:px-8 lg:py-16">
                <div className="w-full max-w-5xl grid lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-16 items-center animate-slide-in">
                    <section className="max-w-lg">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#39a0ff]/25 bg-[#39a0ff]/10 text-[11px] text-[#8acbff] mb-5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Secure campus access
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white leading-[1.05] mb-4">One place to move campus issues forward.</h1>
                        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-md">Sign in to file, assign, resolve, and verify complaints with a clear record from report to closure.</p>
                        <div className="mt-8 grid grid-cols-3 gap-3 text-xs text-zinc-500">
                            <div className="border-l border-[#39a0ff] pl-3"><strong className="block text-white text-lg">24h</strong>SLA escalation</div>
                            <div className="border-l border-emerald-400 pl-3"><strong className="block text-white text-lg">2-way</strong>Resolution check</div>
                            <div className="border-l border-amber-400 pl-3"><strong className="block text-white text-lg">Live</strong>Ticket updates</div>
                        </div>
                    </section>

                    <section className="w-full max-w-xl lg:justify-self-end">
                        <div className="mb-4 flex items-end justify-between">
                            <div>
                                <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">Portal access</p>
                                <h2 className="text-lg font-medium text-white mt-1">Choose a workspace</h2>
                            </div>
                            <span className="text-[11px] text-zinc-600">Demo shortcuts</span>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-3 mb-5">
                        {DEMOS.map((demo) => {
                            const Icon = demo.icon;
                            return (
                                <button
                                    key={demo.email}
                                    type="button"
                                    disabled={Boolean(demoLoading)}
                                    onClick={() => quickDemo(demo)}
                                    className="min-h-[108px] text-left p-4 rounded-2xl border border-white/10 bg-[#0b0f14] hover:border-[#39a0ff]/60 hover:bg-[#0d151d] transition flex flex-col justify-between gap-3 disabled:opacity-50"
                                >
                                    <span className="flex items-center justify-between"><Icon className="w-4 h-4 text-[#39a0ff]" /><ArrowUpRight className="w-3.5 h-3.5 text-zinc-600" /></span>
                                    <span className="min-w-0">
                                        <span className="block text-xs font-semibold text-white">{demo.role}</span>
                                        <span className="block text-[11px] text-zinc-500 mt-1 leading-snug">{demo.hint}</span>
                                    </span>
                                    <span className="text-[10px] font-mono text-zinc-600">{demoLoading === demo.email ? "Connecting…" : "Open portal"}</span>
                                </button>
                            );
                        })}
                        </div>

                    <div className="rounded-2xl border border-white/10 bg-[#0b0f14] p-5 sm:p-7 shadow-2xl shadow-black/30">
                        <div className="flex items-center gap-2 mb-6 text-xs text-zinc-400"><LockKeyhole className="w-4 h-4 text-[#39a0ff]" /> Sign in or create a student account</div>
                        <AuthForm
                            onLoginSuccess={(user) => {
                                loginSuccess(user);
                                navigate(roleHome(user.role), { replace: true });
                            }}
                            onError={setToast}
                        />
                    </div>

                    {toast && <p className="mt-4 px-3 py-2 rounded-lg bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300">{toast}</p>}
                    </section>
                </div>
            </main>
        </div>
    );
};
