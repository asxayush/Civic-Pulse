import React from "react";
import { AlertCircle, Clock, CheckCircle2, ThumbsUp } from "lucide-react";

const CLOSED_STATUSES = new Set(["VERIFIED_CLOSED", "resolved"]);

export const StatsHeader = ({ complaints = [] }) => {
    const totalOpen = complaints.filter((c) => !CLOSED_STATUSES.has(c.status)).length;
    const escalated = complaints.filter((c) => c.escalated).length;
    const resolved = complaints.filter((c) => CLOSED_STATUSES.has(c.status)).length;
    const totalUpvotes = complaints.reduce((sum, c) => sum + (c.upvotes?.length || 0), 0);

    const cards = [
        { label: "Open", value: totalOpen, icon: AlertCircle, accent: "text-amber-400" },
        { label: "Escalated", value: escalated, icon: Clock, accent: "text-rose-400" },
        { label: "Verified closed", value: resolved, icon: CheckCircle2, accent: "text-emerald-400" },
        { label: "Community votes", value: totalUpvotes, icon: ThumbsUp, accent: "text-[#0072FF]" }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {cards.map(({ label, value, icon: Icon, accent }) => (
                <div
                    key={label}
                    className="p-4 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-between"
                >
                    <div>
                        <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">{label}</p>
                        <h3 className="text-2xl font-semibold text-white mt-1 tabular-nums">{value}</h3>
                    </div>
                    <Icon className={`w-5 h-5 ${accent}`} />
                </div>
            ))}
        </div>
    );
};
