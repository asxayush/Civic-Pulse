import React from "react";
import { AlertCircle, Clock, CheckCircle2, ThumbsUp } from "lucide-react";

export const StatsHeader = ({ complaints }) => {
    const totalOpen = complaints.filter(c => c.status !== "resolved").length;
    const escalated = complaints.filter(c => c.escalated).length;
    const resolved = complaints.filter(c => c.status === "resolved").length;
    const totalUpvotes = complaints.reduce((sum, c) => sum + (c.upvotes?.length || 0), 0);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Total Open */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Open Grievances</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">{totalOpen}</h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                    <AlertCircle className="w-5 h-5" />
                </div>
            </div>

            {/* Escalated (>24h) */}
            <div className="p-4 rounded-xl bg-white border border-rose-200 shadow-sm flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-rose-500"></div>
                <div>
                    <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-rose-700 uppercase tracking-wider">Escalated (&gt;24h)</p>
                        {escalated > 0 && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                        )}
                    </div>
                    <h3 className="text-2xl font-black text-rose-600 mt-1">{escalated}</h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                    <Clock className="w-5 h-5" />
                </div>
            </div>

            {/* Resolved Today */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resolved Issues</p>
                    <h3 className="text-2xl font-black text-emerald-600 mt-1">{resolved}</h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                </div>
            </div>

            {/* Community Upvotes */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Community Votes</p>
                    <h3 className="text-2xl font-black text-blue-600 mt-1">{totalUpvotes}</h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                    <ThumbsUp className="w-5 h-5" />
                </div>
            </div>
        </div>
    );
};
