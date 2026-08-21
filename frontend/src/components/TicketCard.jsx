import React, { useState } from "react";
import {
    Copy,
    Check,
    ThumbsUp,
    AlertTriangle,
    Eye,
    UserX,
    ShieldAlert,
    CheckCircle2,
    Flame,
    Link2,
    MapPin,
    RotateCcw,
    ShieldCheck,
    BrainCircuit
} from "lucide-react";

const PIPELINE = ["PENDING", "IN_PROGRESS", "RESOLVED_BY_STAFF", "VERIFIED_CLOSED"];

export const TicketCard = ({
    complaint,
    currentRole,
    onUpvote,
    onStatusChange,
    onMarkInvalid,
    onOpenDetail,
    onVerifyResolution
}) => {
    const [copied, setCopied] = useState(false);

    const copyTicketId = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(complaint.ticketId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const statusBadge = {
        PENDING: "border-amber-500/40 text-amber-300",
        IN_PROGRESS: "border-[#0072FF]/40 text-sky-300",
        RESOLVED_BY_STAFF: "border-violet-500/40 text-violet-300",
        VERIFIED_CLOSED: "border-emerald-500/40 text-emerald-300",
        REOPENED: "border-rose-500/40 text-rose-300"
    };

    const statusLabels = {
        PENDING: "Pending",
        IN_PROGRESS: "In progress",
        RESOLVED_BY_STAFF: "Awaiting verify",
        VERIFIED_CLOSED: "Verified",
        REOPENED: "Reopened"
    };

    const formattedDate = new Date(complaint.createdAt || complaint.filedAt || Date.now()).toLocaleDateString(
        "en-US",
        { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
    );

    const pipeIdx =
        complaint.status === "REOPENED"
            ? 1
            : Math.max(0, PIPELINE.indexOf(complaint.status));

    return (
        <div
            className={`group rounded-xl bg-zinc-950 border overflow-hidden flex flex-col justify-between transition hover:border-white/20 ${
                complaint.escalated
                    ? "border-rose-500/40"
                    : complaint.status === "REOPENED"
                      ? "border-orange-500/40"
                      : complaint.priority === "high"
                        ? "border-[#0072FF]/35"
                        : "border-white/10"
            }`}
        >
            {complaint.escalated && (
                <div className="bg-rose-600/90 px-4 py-1.5 flex items-center gap-2 text-[11px] text-white font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Escalated · &gt;24h untouched
                </div>
            )}
            {complaint.status === "REOPENED" && (
                <div className="bg-orange-500/90 px-4 py-1.5 flex items-center gap-2 text-[11px] text-white font-medium">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reopened ×{complaint.reopenCount || 1}
                </div>
            )}

            <div className="p-4 flex-1">
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                            type="button"
                            onClick={copyTicketId}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black border border-white/10 text-[11px] font-mono text-zinc-300 hover:border-white/25"
                        >
                            {complaint.ticketId}
                            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-500" />}
                        </button>
                        <span className="capitalize text-[11px] text-zinc-500">{complaint.category}</span>
                        {(complaint.linkedCount > 0 || complaint.childTickets?.length > 0) && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400">
                                <Link2 className="w-3 h-3" />
                                {complaint.linkedCount || complaint.childTickets?.length}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        {complaint.priority === "high" && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-[#0072FF]">
                                <Flame className="w-3 h-3" /> HIGH
                            </span>
                        )}
                        <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono border animate-status-pulse ${
                                statusBadge[complaint.status] || statusBadge.PENDING
                            }`}
                        >
                            {statusLabels[complaint.status] || complaint.status}
                        </span>
                    </div>
                </div>

                {/* Lifecycle pipeline */}
                <div className="flex items-center gap-1 mb-3">
                    {PIPELINE.map((s, i) => (
                        <div
                            key={s}
                            className={`h-0.5 flex-1 rounded-full ${i <= pipeIdx ? "bg-[#0072FF]" : "bg-zinc-800"}`}
                            title={s}
                        />
                    ))}
                </div>

                <h4 className="text-sm font-medium text-white mb-1 line-clamp-1 group-hover:text-zinc-100">
                    {complaint.title}
                </h4>
                <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed mb-3">{complaint.description}</p>

                {complaint.aiAnalysis?.aiSummary && (
                    <div className="mb-3 p-2 rounded-lg border border-[#0072FF]/25 bg-[#0072FF]/5 text-[11px]">
                        <div className="flex items-center justify-between text-[#0072FF] font-medium mb-0.5">
                            <span className="inline-flex items-center gap-1">
                                <BrainCircuit className="w-3.5 h-3.5" /> AI Vision
                            </span>
                            <span className="font-mono text-[10px] text-zinc-400">
                                {Math.round((complaint.aiAnalysis.confidenceScore || 0.9) * 100)}%
                                {complaint.aiAnalysis.resolutionMatchScore != null &&
                                    ` · match ${complaint.aiAnalysis.resolutionMatchScore}%`}
                            </span>
                        </div>
                        <p className="text-zinc-400 line-clamp-2">{complaint.aiAnalysis.aiSummary}</p>
                    </div>
                )}

                {complaint.hostelBlock && (
                    <div className="inline-flex items-center gap-1 text-[11px] text-zinc-500 mb-3">
                        <MapPin className="w-3.5 h-3.5 text-[#0072FF]" />
                        {complaint.hostelBlock}
                    </div>
                )}

                {complaint.invalidStatus && complaint.invalidStatus !== "none" && (
                    <div className="mb-3 inline-flex items-center gap-1.5 text-[11px] text-amber-400">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        {complaint.invalidStatus === "REQUESTED_BY_STAFF" && "Flagged for admin"}
                        {complaint.invalidStatus === "CONFIRMED_BY_ADMIN" && "Confirmed invalid"}
                        {complaint.invalidStatus === "REJECTED_BY_ADMIN" && "Flag rejected"}
                    </div>
                )}

                {complaint.imageProof && (
                    <button
                        type="button"
                        onClick={() => onOpenDetail?.(complaint)}
                        className="relative h-32 w-full rounded-lg overflow-hidden bg-black border border-white/10 mb-2 group/img text-left"
                    >
                        <img
                            src={complaint.imageProof}
                            alt="Proof"
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center gap-1.5 text-white text-xs font-medium">
                            <Eye className="w-4 h-4" /> Details
                        </div>
                    </button>
                )}

                {complaint.afterImage && complaint.imageProof && (
                    <div className="grid grid-cols-2 gap-2 mb-1">
                        <div className="relative rounded-lg overflow-hidden border border-white/10">
                            <img src={complaint.imageProof} alt="Before" className="w-full h-16 object-cover" />
                            <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] font-mono text-center py-0.5">
                                BEFORE
                            </span>
                        </div>
                        <div className="relative rounded-lg overflow-hidden border border-emerald-500/30">
                            <img src={complaint.afterImage} alt="After" className="w-full h-16 object-cover" />
                            <span className="absolute bottom-0 inset-x-0 bg-emerald-900/80 text-[9px] font-mono text-center py-0.5">
                                AFTER
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between gap-2 text-xs bg-black/40">
                <div className="text-zinc-500 flex items-center gap-1.5 min-w-0">
                    {complaint.isAnonymous ? (
                        <span className="flex items-center gap-1 italic">
                            <UserX className="w-3.5 h-3.5" /> Anonymous
                        </span>
                    ) : (
                        <span className="text-zinc-300 truncate max-w-[100px]">
                            {complaint.filedBy?.name || "Student"}
                        </span>
                    )}
                    <span className="text-zinc-700">·</span>
                    <span className="truncate">{formattedDate}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    {currentRole === "student" && complaint.status !== "VERIFIED_CLOSED" && (
                        <button
                            type="button"
                            onClick={() => onUpvote?.(complaint._id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded border text-xs font-medium transition ${
                                complaint.hasUpvoted
                                    ? "bg-white text-black border-white"
                                    : "border-white/10 text-zinc-300 hover:border-white/25"
                            }`}
                        >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            {complaint.upvotes?.length || 0}
                        </button>
                    )}

                    {currentRole === "student" && complaint.status === "RESOLVED_BY_STAFF" && onVerifyResolution && (
                        <button
                            type="button"
                            onClick={() => onVerifyResolution(complaint)}
                            className="px-2.5 py-1 rounded bg-violet-600 text-white text-xs font-medium hover:bg-violet-500 inline-flex items-center gap-1"
                        >
                            <ShieldCheck className="w-3.5 h-3.5" /> Verify
                        </button>
                    )}

                    {(currentRole === "staff" || currentRole === "admin") && (
                        <>
                            {(complaint.status === "PENDING" || complaint.status === "REOPENED") && (
                                <button
                                    type="button"
                                    onClick={() => onStatusChange?.(complaint._id, "IN_PROGRESS")}
                                    className="px-2.5 py-1 rounded bg-[#0072FF] text-white text-xs font-medium hover:bg-blue-500"
                                >
                                    Accept
                                </button>
                            )}
                            {complaint.status === "IN_PROGRESS" && (
                                <button
                                    type="button"
                                    onClick={() => onStatusChange?.(complaint._id, "RESOLVED_BY_STAFF")}
                                    className="px-2.5 py-1 rounded bg-emerald-500 text-black text-xs font-medium hover:bg-emerald-400 inline-flex items-center gap-1"
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                                </button>
                            )}
                            {currentRole === "staff" &&
                                (complaint.invalidStatus === "none" || !complaint.invalidStatus) &&
                                onMarkInvalid && (
                                    <button
                                        type="button"
                                        onClick={() => onMarkInvalid(complaint._id)}
                                        className="p-1 rounded border border-white/10 text-rose-400 hover:bg-rose-500/10"
                                        title="Flag for admin"
                                    >
                                        <ShieldAlert className="w-3.5 h-3.5" />
                                    </button>
                                )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
