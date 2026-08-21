import React from "react";
import { Logo } from "./Logo";
import { UserCheck, Wrench, ShieldAlert, PlusCircle, LogIn, PhoneCall, Info } from "lucide-react";

export const Navbar = ({ currentRole, setRole, onOpenFileModal, onOpenAuthModal, currentUser }) => {
    return (
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
            {/* Top Official Announcement Ticker Bar (CPGRAMS Style) */}
            <div className="bg-[#002B66] text-white py-1.5 px-4 text-xs font-medium border-b border-blue-900">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 overflow-hidden truncate">
                        <span className="bg-sky-500 text-white text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded">OFFICIAL</span>
                        <span className="truncate text-slate-200">Centralized Campus Grievance Redress & Auto-Routing System</span>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-[11px] text-slate-300">
                        <span className="flex items-center gap-1"><PhoneCall className="w-3 h-3 text-sky-400" /> Helpline: 1800-CAMPUS-CP</span>
                        <span>•</span>
                        <span>Government Domain Restricted (@yourcollege.edu.in)</span>
                    </div>
                </div>
            </div>

            {/* Main Navbar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
                
                {/* Logo using Official Logo Component */}
                <div className="flex items-center gap-3">
                    <Logo className="h-10 sm:h-12" />
                </div>

                {/* Center / Role Switcher Toolbar */}
                <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                    <button
                        onClick={() => setRole("student")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            currentRole === "student"
                                ? "bg-[#002B66] text-white shadow"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                        }`}
                    >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Student</span>
                    </button>
                    <button
                        onClick={() => setRole("staff")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            currentRole === "staff"
                                ? "bg-[#002B66] text-white shadow"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                        }`}
                    >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Staff</span>
                    </button>
                    <button
                        onClick={() => setRole("admin")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            currentRole === "admin"
                                ? "bg-[#002B66] text-white shadow"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                        }`}
                    >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Admin</span>
                    </button>
                </div>

                {/* Right Profile / Auth Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onOpenAuthModal}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 hover:bg-sky-100 font-bold text-xs transition"
                    >
                        <LogIn className="w-4 h-4 text-sky-600" />
                        <span className="hidden sm:inline">Register / Sign In</span>
                    </button>

                    {currentRole === "student" && (
                        <button
                            onClick={onOpenFileModal}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold bg-[#002B66] hover:bg-[#001D47] text-white transition shadow-md active:scale-95 uppercase tracking-wider"
                        >
                            <PlusCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">File Grievance</span>
                        </button>
                    )}
                </div>

            </div>
        </header>
    );
};
