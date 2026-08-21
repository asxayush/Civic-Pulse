import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import {
    ShieldCheck,
    BrainCircuit,
    Link2,
    Clock,
    ArrowRight,
    Search,
    Mic
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { roleHome } from "./ProtectedRoute";

const features = [
    {
        icon: ShieldCheck,
        title: "Closed-loop OTP verification",
        body: "Staff cannot unilaterally close tickets. Students confirm the fix with a 4-digit OTP after inspecting before/after proof."
    },
    {
        icon: BrainCircuit,
        title: "Photo → AI auto-triage",
        body: "Upload proof and Gemini fills department, title, description, and priority — then auto-routes to the right staff."
    },
    {
        icon: Link2,
        title: "Parent-child aggregation",
        body: "Duplicate reports in the same hostel block and category link under one parent ticket so queues stay clean."
    },
    {
        icon: Clock,
        title: "Wellness + anti-abuse SLA",
        body: "Private stress companion with crisis helplines, plus idle-ticket escalation and two-tier invalid review."
    }
];

export const LandingPage = () => {
    const { isAuthenticated, currentUser } = useAuth();
    const navigate = useNavigate();
    const [trackId, setTrackId] = useState("");

    const goWorkspace = () => {
        if (isAuthenticated) navigate(roleHome(currentUser.role));
        else navigate("/login");
    };

    const handleTrack = (e) => {
        e.preventDefault();
        if (!trackId.trim()) return;
        navigate(`/track/${encodeURIComponent(trackId.trim())}`);
    };

    return (
        <div className="min-h-screen bg-black text-zinc-100">
            <header className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link to="/">
                        <Logo className="h-9" variant="dark" showTagline={false} />
                    </Link>
                    <nav className="flex items-center gap-2 sm:gap-3">
                        <Link
                            to="/track"
                            className="hidden sm:inline-flex text-sm text-zinc-400 hover:text-white transition px-3 py-1.5"
                        >
                            Track
                        </Link>
                        <Link
                            to="/voice-complaint"
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-400/30 text-rose-200 text-sm font-medium px-6 py-3 hover:bg-rose-400/10 transition"
                        >
                            <Mic className="w-4 h-4" /> Voice emergency complaint
                        </Link>
                        <button
                            onClick={goWorkspace}
                            className="inline-flex items-center gap-1.5 rounded-full bg-white text-black text-sm font-medium px-4 py-2 hover:bg-zinc-200 transition"
                        >
                            {isAuthenticated ? "Open workspace" : "Sign in"}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </nav>
                </div>
            </header>

            {/* Hero — brand first, one composition */}
            <section className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center overflow-hidden">
                <div className="absolute inset-0 cp-grid-bg pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0072FF]/10 via-transparent to-black pointer-events-none" />

                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
                    <div className="animate-fade-up">
                        <Logo className="h-14 sm:h-16 mb-10" variant="dark" />
                    </div>
                    <h1 className="animate-fade-up text-4xl sm:text-6xl font-semibold tracking-tight text-white max-w-3xl leading-[1.1]" style={{ animationDelay: "80ms" }}>
                        Campus grievances that cannot disappear.
                    </h1>
                    <p className="animate-fade-up mt-5 text-lg sm:text-xl text-zinc-400 max-w-xl leading-relaxed" style={{ animationDelay: "140ms" }}>
                        Closed-loop redress for hostels — AI triage, auto-routing, and student-verified resolution.
                    </p>
                    <div className="animate-fade-up mt-10 flex flex-col sm:flex-row gap-3" style={{ animationDelay: "200ms" }}>
                        <button
                            onClick={goWorkspace}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-black text-sm font-medium px-6 py-3 hover:bg-zinc-200 transition"
                        >
                            {isAuthenticated ? "Go to dashboard" : "Sign in"}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                        <Link
                            to="/track"
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 text-white text-sm font-medium px-6 py-3 hover:bg-white/5 transition"
                        >
                            <Search className="w-4 h-4" />
                            Track ticket
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features below fold */}
            <section className="border-t border-white/10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 space-y-16">
                    <div>
                        <p className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500 mb-3">Why Civic Pulse</p>
                        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white max-w-xl">
                            Built like CPGRAMS — with AI and a real handshake.
                        </h2>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-10 sm:gap-12">
                        {features.map(({ icon: Icon, title, body }, i) => (
                            <div
                                key={title}
                                className="animate-fade-up border-t border-white/10 pt-6"
                                style={{ animationDelay: `${i * 60}ms` }}
                            >
                                <Icon className="w-5 h-5 text-[#0072FF] mb-4" />
                                <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
                                <p className="text-sm text-zinc-400 leading-relaxed">{body}</p>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 max-w-lg pt-4">
                        <input
                            type="text"
                            value={trackId}
                            onChange={(e) => setTrackId(e.target.value)}
                            placeholder="CP-2026-00001"
                            className="flex-1 rounded-lg bg-zinc-950 border border-white/10 px-4 py-2.5 text-sm font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30"
                        />
                        <button
                            type="submit"
                            className="rounded-lg bg-white text-black text-sm font-medium px-5 py-2.5 hover:bg-zinc-200 transition"
                        >
                            Look up
                        </button>
                    </form>
                </div>
            </section>

            <footer className="border-t border-white/10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-4 text-xs text-zinc-500">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                        <p>Civic Pulse · Campus grievance system</p>
                        <nav className="flex flex-wrap gap-4">
                            <Link to="/privacy" className="hover:text-white">Privacy</Link>
                            <Link to="/disclaimer" className="hover:text-white">Disclaimer</Link>
                            <Link to="/terms" className="hover:text-white">Terms</Link>
                            <Link to="/login" className="hover:text-white">Admin / Staff login</Link>
                        </nav>
                    </div>
                    <p className="font-mono text-[11px] text-zinc-600">
                        Admin demo: admin@yourcollege.edu.in / AdminPassword123! · Student signup: any email
                    </p>
                </div>
            </footer>
        </div>
    );
};
