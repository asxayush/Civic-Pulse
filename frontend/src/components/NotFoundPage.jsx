import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { Logo } from "./Logo";

export const NotFoundPage = () => (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col">
        <header className="h-14 border-b border-white/10 px-4 sm:px-6 flex items-center">
            <Link to="/"><Logo className="h-8" variant="dark" showTagline={false} /></Link>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 py-16">
            <div className="text-center max-w-md">
                <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#39a0ff] mb-3">404 · Route not found</p>
                <h1 className="text-3xl font-semibold text-white tracking-tight">This page does not exist.</h1>
                <p className="text-sm text-zinc-500 mt-3">The link may be outdated or the address may be mistyped.</p>
                <div className="mt-7 flex items-center justify-center gap-3">
                    <button type="button" onClick={() => window.history.back()} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 text-sm text-zinc-300 hover:bg-white/5">
                        <ArrowLeft className="w-4 h-4" /> Go back
                    </button>
                    <Link to="/" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-sm font-medium text-black hover:bg-zinc-200">
                        <Home className="w-4 h-4" /> Home
                    </Link>
                </div>
            </div>
        </main>
    </div>
);
