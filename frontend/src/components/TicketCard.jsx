import React, { useState } from "react";
import {
    Copy,
    Check,
    ThumbsUp,
    Clock,
    AlertTriangle,
    Eye,
    UserX,
    ShieldAlert,
    CheckCircle2,
    Flame
} from "lucide-react";

export const TicketCard = ({
    complaint,
    currentRole,
    onUpvote,
    onStatusChange,
    onMarkInvalid,
    onOpenDetail
}) => {
    const [copied, setCopied] = useState(false);

    const copyTicketId = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(complaint.ticketId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const statusBadgeColors = {
        pending: "bg-amber-100 text-amber-800 border-amber-300",
        "in-progress": "bg-blue-100 text-blue-800 border-blue-300",
        resolved: "bg-emerald-100 text-emerald-800 border-emerald-300"
    };

    const categoryIcons = {
        electricity: "⚡",
        water: "💧",
        food: "🍲",
        miscellaneous: "📌"
    };

    const formattedDate = new Date(complaint.createdAt || complaint.filedAt || Date.now()).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

    return (
        <div className={`group rounded-xl bg-white border transition-all duration-200 hover:shadow-lg overflow-hidden flex flex-col justify-between ${
            complaint.escalated
                ? "border-rose-400 shadow-rose-100"
                : complaint.priority === "high"
                ? "border-blue-400 shadow-blue-100"
                : "border-slate-200 hover:border-slate-300"
        }`}>
            {/* Escalation Alert Bar */}
            {complaint.escalated && (
                <div className="bg-rose-600 px-4 py-2 flex items-center justify-between text-xs text-white">
                    <div className="flex items-center gap-2 font-bold">
                        <AlertTriangle className="w-4 h-4 text-white animate-pulse" />
                        <span>Escalated (&gt;24 Hours Untouched)</span>
                    </div>
                    <button
                        onClick={() => alert(`Directing to Admin Triage for Ticket ${complaint.ticketId}`)}
                        className="px-2.5 py-1 rounded bg-white text-rose-700 font-extrabold text-[11px] hover:bg-rose-50 transition shadow"
                    >
                        Contact Admin
                    </button>
                </div>
            )}

            {/* Main Content */}
            <div className="p-5">
                {/* Header: Ticket ID + Category + Priority */}
                <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={copyTicketId}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 border border-slate-300 text-xs font-mono font-bold text-slate-800 hover:bg-slate-200 transition"
                            title="Click to copy Ticket ID"
                        >
                            <span>{complaint.ticketId}</span>
                            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                        </button>
                        
                        <span className="capitalize px-2.5 py-1 rounded text-xs font-bold bg-slate-100 border border-slate-200 text-slate-700">
                            {categoryIcons[complaint.category]} {complaint.category}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {complaint.priority === "high" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-300">
                                <Flame className="w-3 h-3 text-blue-600" /> HIGH
                            </span>
                        )}
                        
                        <span className={`capitalize px-2.5 py-0.5 rounded text-xs font-bold border ${statusBadgeColors[complaint.status]}`}>
                            {complaint.status}
                        </span>
                    </div>
                </div>

                {/* Title & Description */}
                <h4 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-blue-700 transition-colors line-clamp-1">
                    {complaint.title}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {complaint.description}
                </p>

                {/* Image Proof Thumbnail */}
                {complaint.imageProof && (
                    <div
                        onClick={() => onOpenDetail(complaint)}
                        className="relative h-36 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 mb-4 cursor-pointer group/img"
                    >
                        <img
                            src={complaint.imageProof}
                            alt="Complaint proof"
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs">
                            <Eye className="w-4 h-4" /> View Full Image
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Metadata & Actions */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 text-xs">
                {/* Complainant Identity info */}
                <div className="text-slate-600 flex items-center gap-2">
                    {complaint.isAnonymous ? (
                        <span className="flex items-center gap-1 text-slate-500 font-semibold italic">
                            <UserX className="w-3.5 h-3.5 text-slate-400" /> Anonymous
                        </span>
                    ) : (
                        <span className="text-slate-900 font-bold truncate max-w-[120px]">
                            {complaint.filedBy?.name || "Student"}
                        </span>
                    )}
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 font-medium">{formattedDate}</span>
                </div>

                {/* Role Actions */}
                <div className="flex items-center gap-2">
                    {/* Student Upvote Action */}
                    {currentRole === "student" && (
                        <button
                            onClick={() => onUpvote(complaint._id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded border text-xs font-bold transition active:scale-95 ${
                                complaint.hasUpvoted
                                    ? "bg-[#002B66] text-white border-[#002B66] shadow"
                                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                            }`}
                        >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{complaint.upvotes?.length || 0}</span>
                        </button>
                    )}

                    {/* Staff Actions */}
                    {(currentRole === "staff" || currentRole === "admin") && (
                        <div className="flex items-center gap-1.5">
                            {complaint.status === "pending" && (
                                <button
                                    onClick={() => onStatusChange(complaint._id, "in-progress")}
                                    className="px-2.5 py-1 rounded bg-blue-700 text-white font-bold text-xs hover:bg-blue-800 transition"
                                >
                                    Start Progress
                                </button>
                            )}

                            {complaint.status === "in-progress" && (
                                <button
                                    onClick={() => onStatusChange(complaint._id, "resolved")}
                                    className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition inline-flex items-center gap-1"
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                                </button>
                            )}

                            {currentRole === "staff" && (
                                <button
                                    onClick={() => onMarkInvalid(complaint._id)}
                                    className="p-1 rounded bg-rose-100 border border-rose-300 text-rose-700 hover:bg-rose-600 hover:text-white transition"
                                    title="Mark Fake/Invalid Complaint"
                                >
                                    <ShieldAlert className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
