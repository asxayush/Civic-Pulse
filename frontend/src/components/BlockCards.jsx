import React from "react";
import { UserCheck, Search, PlusCircle, HelpCircle } from "lucide-react";

export const BlockCards = ({ onOpenAuth, onOpenStatus, onFileTicket }) => {
    return (
        <div className="my-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Block Card 1: REGISTER / LOGIN (Sky Blue Block) */}
                <div className="bg-[#7DD3FC] p-8 rounded-xl shadow-md border border-sky-300 flex flex-col items-center justify-between text-center transition-transform hover:-translate-y-1">
                    <div className="mb-6">
                        <div className="w-12 h-12 rounded-full bg-[#002B66]/10 flex items-center justify-center text-[#002B66] mx-auto mb-3">
                            <UserCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-black text-[#002B66] tracking-tight">Student Portal Access</h3>
                        <p className="text-xs text-slate-800 font-medium mt-1">
                            Domain-restricted registration & single sign-on verification for campus residents.
                        </p>
                    </div>
                    <button
                        onClick={onOpenAuth}
                        className="w-full py-3.5 px-6 rounded-lg bg-[#002B66] hover:bg-[#001D47] text-white font-extrabold text-xs uppercase tracking-wider transition shadow-md active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span>REGISTER / LOGIN</span>
                    </button>
                </div>

                {/* Block Card 2: VIEW STATUS (Soft Pink / Magenta Block) */}
                <div className="bg-[#F472B6] p-8 rounded-xl shadow-md border border-pink-300 flex flex-col items-center justify-between text-center transition-transform hover:-translate-y-1">
                    <div className="mb-6">
                        <div className="w-12 h-12 rounded-full bg-[#002B66]/10 flex items-center justify-center text-[#002B66] mx-auto mb-3">
                            <Search className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-black text-[#002B66] tracking-tight">Grievance Status Tracker</h3>
                        <p className="text-xs text-slate-800 font-medium mt-1">
                            Track resolution progress using your unique Ticket ID (e.g. CP-2026-00147).
                        </p>
                    </div>
                    <button
                        onClick={onOpenStatus}
                        className="w-full py-3.5 px-6 rounded-lg bg-[#002B66] hover:bg-[#001D47] text-white font-extrabold text-xs uppercase tracking-wider transition shadow-md active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span>VIEW STATUS</span>
                    </button>
                </div>

                {/* Block Card 3: FILE GRIEVANCE (Warm Peach / Gold Block) */}
                <div className="bg-[#FDE047] p-8 rounded-xl shadow-md border border-amber-300 flex flex-col items-center justify-between text-center transition-transform hover:-translate-y-1">
                    <div className="mb-6">
                        <div className="w-12 h-12 rounded-full bg-[#002B66]/10 flex items-center justify-center text-[#002B66] mx-auto mb-3">
                            <PlusCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-black text-[#002B66] tracking-tight">File Campus Grievance</h3>
                        <p className="text-xs text-slate-800 font-medium mt-1">
                            Snap photo proof & file a complaint under 60 seconds with auto-routing to staff.
                        </p>
                    </div>
                    <button
                        onClick={onFileTicket}
                        className="w-full py-3.5 px-6 rounded-lg bg-[#002B66] hover:bg-[#001D47] text-white font-extrabold text-xs uppercase tracking-wider transition shadow-md active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span>FILE COMPLAINT</span>
                    </button>
                </div>

            </div>
        </div>
    );
};
