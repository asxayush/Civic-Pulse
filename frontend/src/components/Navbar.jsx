import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Logo } from "./Logo";
import { PlusCircle, LogOut, Search, Heart, Shield, Wrench, LayoutDashboard } from "lucide-react";
import { roleHome } from "./ProtectedRoute";

export const Navbar = ({ onOpenFileModal, currentUser, onLogout }) => {
    const [profileOpen, setProfileOpen] = useState(false);
    const role = currentUser?.role;

    const linkClass = ({ isActive }) =>
        `text-sm px-3 py-1.5 rounded-md transition ${
            isActive ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"
        }`;

    const portalPath = role ? roleHome(role) : "/login";
    const portalLabel =
        role === "admin" ? "Admin portal" : role === "staff" ? "Staff queue" : "Workspace";

    return (
        <header className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-md">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
                <Link to="/" className="shrink-0">
                    <Logo className="h-8" variant="dark" showTagline={false} />
                </Link>

                <nav className="hidden sm:flex items-center gap-1">
                    <Link to="/track" className="text-sm text-zinc-400 hover:text-white px-3 py-1.5 inline-flex items-center gap-1.5">
                        <Search className="w-3.5 h-3.5" /> Track
                    </Link>
                    {role === "student" && (
                        <>
                            <NavLink to="/app" className={linkClass}>
                                Workspace
                            </NavLink>
                            <NavLink to="/wellness" className={linkClass}>
                                <span className="inline-flex items-center gap-1">
                                    <Heart className="w-3.5 h-3.5" /> Wellness
                                </span>
                            </NavLink>
                        </>
                    )}
                    {role === "staff" && (
                        <NavLink to="/staff" className={linkClass}>
                            <span className="inline-flex items-center gap-1">
                                <Wrench className="w-3.5 h-3.5" /> Queue
                            </span>
                        </NavLink>
                    )}
                    {role === "admin" && (
                        <NavLink to="/admin" className={linkClass}>
                            <span className="inline-flex items-center gap-1">
                                <Shield className="w-3.5 h-3.5" /> Admin
                            </span>
                        </NavLink>
                    )}
                </nav>

                <div className="flex items-center gap-2">
                    {currentUser?.email ? (
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition"
                            >
                                <div className="w-7 h-7 rounded-full bg-white text-black text-xs font-semibold flex items-center justify-center">
                                    {(currentUser.name || "U").substring(0, 2).toUpperCase()}
                                </div>
                                <div className="hidden lg:block text-left leading-tight">
                                    <div className="text-xs font-medium text-white">{currentUser.name}</div>
                                    <div className="text-[10px] text-zinc-500 font-mono capitalize">{currentUser.role}</div>
                                </div>
                            </button>

                            {profileOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-zinc-950 border border-white/10 rounded-xl py-1.5 z-50 animate-slide-in shadow-2xl">
                                    <div className="px-3 py-2 border-b border-white/10">
                                        <p className="text-xs font-medium text-white truncate">{currentUser.name}</p>
                                        <p className="text-[11px] text-zinc-500 font-mono truncate">{currentUser.email}</p>
                                    </div>
                                    <Link
                                        to={portalPath}
                                        onClick={() => setProfileOpen(false)}
                                        className="w-full text-left px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5 flex items-center gap-2"
                                    >
                                        <LayoutDashboard className="w-3.5 h-3.5" />
                                        {portalLabel}
                                    </Link>
                                    {role === "admin" && (
                                        <Link
                                            to="/admin"
                                            onClick={() => setProfileOpen(false)}
                                            className="w-full text-left px-3 py-2 text-xs font-medium text-[#0072FF] hover:bg-white/5 flex items-center gap-2"
                                        >
                                            <Shield className="w-3.5 h-3.5" />
                                            Open admin portal
                                        </Link>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProfileOpen(false);
                                            onLogout();
                                        }}
                                        className="w-full text-left px-3 py-2 text-xs font-medium text-rose-400 hover:bg-white/5 flex items-center gap-2"
                                    >
                                        <LogOut className="w-3.5 h-3.5" />
                                        Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : null}

                    {role === "student" && (
                        <button
                            type="button"
                            onClick={onOpenFileModal}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-white text-black hover:bg-zinc-200 transition"
                        >
                            <PlusCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">File grievance</span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};
