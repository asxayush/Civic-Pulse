import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { complaintService } from "../services/api";
import {
    Search,
    ArrowLeft,
    AlertTriangle,
    Copy,
    Check,
    Loader2
} from "lucide-react";

const PIPELINE = ["PENDING", "IN_PROGRESS", "RESOLVED_BY_STAFF", "VERIFIED_CLOSED"];

const statusIndex = (status) => {
    if (status === "REOPENED") return 1;
    const i = PIPELINE.indexOf(status);
    return i >= 0 ? i : 0;
};

export const TrackPage = () => {
    const { ticketId: paramId } = useParams();
    const navigate = useNavigate();
    const [searchId, setSearchId] = useState(paramId || "");
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    const fetchTicket = async (id) => {
        if (!id?.trim()) return;
        setLoading(true);
        setError("");
        setSearched(true);
        try {
            const res = await complaintService.getByTicketId(id.trim());
            setTicket(res.data || null);
            if (!res.data) setError("Ticket not found");
        } catch (err) {
            setTicket(null);
            setError(err.response?.data?.message || "Ticket not found");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (paramId) {
            setSearchId(paramId);
            fetchTicket(paramId);
        }
    }, [paramId]);

    const handleSearch = (e) => {
        e.preventDefault();
        const id = searchId.trim();
        if (!id) return;
        navigate(`/track/${encodeURIComponent(id)}`, { replace: true });
        fetchTicket(id);
    };

    const copyId = () => {
        if (!ticket?.ticketId) return;
        navigator.clipboard.writeText(ticket.ticketId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const step = ticket ? statusIndex(ticket.status) : -1;

    return (
        <div className="min-h-screen bg-black text-zinc-100">
            <header className="border-b border-white/10 px-4 sm:px-6 h-14 flex items-center justify-between">
                <Link to="/">
                    <Logo className="h-8" variant="dark" showTagline={false} />
                </Link>
                <Link to="/" className="text-sm text-zinc-400 hover:text-white inline-flex items-center gap-1.5">
                    <ArrowLeft className="w-4 h-4" /> Home
                </Link>
            </header>

            <main className="max-w-xl mx-auto px-4 py-12 sm:py-16">
                <h1 className="text-2xl font-semibold tracking-tight mb-1">Track a ticket</h1>
                <p className="text-sm text-zinc-500 mb-8">Look up live status by Ticket ID</p>

                <form onSubmit={handleSearch} className="flex gap-2 mb-8">
                    <input
                        type="text"
                        placeholder="CP-2026-00001"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 bg-zinc-950 text-sm font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-5 py-2.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 transition disabled:opacity-50 inline-flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        Track
                    </button>
                </form>

                {ticket && (
                    <div className="animate-slide-in rounded-xl border border-white/10 bg-zinc-950 p-5 space-y-6">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-medium bg-black border border-white/10 px-2.5 py-1 rounded">
                                        {ticket.ticketId}
                                    </span>
                                    <button type="button" onClick={copyId} className="text-zinc-500 hover:text-white">
                                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                                <h2 className="text-base font-medium text-white mt-3">{ticket.title}</h2>
                                <p className="text-xs text-zinc-500 mt-1 capitalize">{ticket.category} · {ticket.hostelBlock || "Campus"}</p>
                            </div>
                            <span className="text-[11px] font-mono px-2 py-1 rounded border border-white/10 text-zinc-300 whitespace-nowrap animate-status-pulse">
                                {ticket.status}
                            </span>
                        </div>

                        <div>
                            <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-3">Lifecycle</p>
                            <div className="flex flex-col gap-2">
                                {PIPELINE.map((s, i) => (
                                    <div key={s} className="flex items-center gap-3">
                                        <div
                                            className={`w-2 h-2 rounded-full shrink-0 ${
                                                i <= step ? "bg-[#0072FF]" : "bg-zinc-700"
                                            }`}
                                        />
                                        <span className={`text-xs font-mono ${i <= step ? "text-zinc-200" : "text-zinc-600"}`}>
                                            {s}
                                        </span>
                                    </div>
                                ))}
                                {ticket.status === "REOPENED" && (
                                    <p className="text-xs text-amber-400 ml-5">Reopened — student rejected resolution</p>
                                )}
                            </div>
                        </div>

                        {ticket.escalated && (
                            <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-950/30 text-rose-300 text-xs flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Escalated to campus administration (&gt;24h idle or repeated reopen)
                            </div>
                        )}

                        {ticket.aiAnalysis?.aiSummary && (
                            <div className="p-3 rounded-lg border border-white/10 bg-black text-xs text-zinc-400">
                                <span className="text-[#0072FF] font-medium">AI · </span>
                                {ticket.aiAnalysis.aiSummary}
                            </div>
                        )}
                    </div>
                )}

                {!ticket && searched && !loading && (
                    <div className="p-8 text-center rounded-xl border border-white/10 bg-zinc-950 text-zinc-500 text-sm">
                        {error || "No ticket found"}
                    </div>
                )}
            </main>
        </div>
    );
};
