import { useEffect, useRef, useState } from "react";
import { Heart, Send, Loader2, Phone, AlertTriangle, Wind } from "lucide-react";
import { wellnessService } from "../services/api";

export const WellnessPage = () => {
    const [content, setContent] = useState("");
    const [messages, setMessages] = useState([]);
    const [helplines, setHelplines] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [crisisBanner, setCrisisBanner] = useState(false);
    const bottomRef = useRef(null);

    const load = async () => {
        try {
            const res = await wellnessService.getMyReflections();
            setMessages(res.data?.messages || []);
            setHelplines(res.data?.helplines || null);
            if ((res.data?.messages || []).some((m) => m.crisisFlag)) setCrisisBanner(true);
        } catch (err) {
            setError(err.response?.data?.message || "Could not load chat history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, submitting]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const text = content.trim();
        if (!text) return;

        setSubmitting(true);
        setContent("");
        // Optimistic user bubble
        const tempId = `temp-${Date.now()}`;
        setMessages((prev) => [
            ...prev,
            { id: tempId, role: "user", text, createdAt: new Date().toISOString() }
        ]);

        try {
            const res = await wellnessService.reflect(text);
            setCrisisBanner(Boolean(res.data?.showCrisisBanner) || crisisBanner);
            if (res.data?.helplines) setHelplines(res.data.helplines);
            await load();
        } catch (err) {
            setMessages((prev) => prev.filter((m) => m.id !== tempId));
            setContent(text);
            setError(err.response?.data?.message || "Could not get a response");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col max-w-3xl mx-auto h-[calc(100vh-8rem)] min-h-[520px]">
            <div className="p-4 rounded-xl border border-white/10 bg-zinc-950 mb-3 shrink-0">
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg border border-white/10 bg-black flex items-center justify-center text-rose-300">
                        <Heart className="w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="text-base font-medium text-white">Wellness chat</h2>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            Full private history · supportive AI · not therapy
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-3 py-2 rounded-lg border border-amber-500/25 bg-amber-950/20 text-[11px] text-amber-100/90 mb-3 shrink-0 space-y-0.5">
                <p className="font-medium inline-flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Helplines
                </p>
                <p>{helplines?.campus}</p>
                <p className="font-mono text-amber-200/80">{helplines?.india}</p>
            </div>

            {crisisBanner && (
                <div className="p-3 rounded-lg border border-rose-500/40 bg-rose-950/40 text-rose-100 text-xs flex gap-2 mb-3 shrink-0">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    If you are in danger, contact campus security or emergency services now.
                </div>
            )}

            <div className="flex-1 overflow-y-auto rounded-xl border border-white/10 bg-zinc-950/80 p-4 space-y-3">
                {loading ? (
                    <p className="text-xs text-zinc-600 text-center py-8">Loading chat history…</p>
                ) : messages.length === 0 ? (
                    <div className="text-center py-12 space-y-2">
                        <p className="text-sm text-zinc-400">No messages yet</p>
                        <p className="text-xs text-zinc-600 max-w-sm mx-auto">
                            Share exams stress, hostel loneliness, or anything on your mind. Your full chat stays here.
                        </p>
                    </div>
                ) : (
                    messages.map((m) => (
                        <div
                            key={m.id}
                            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                                    m.role === "user"
                                        ? "bg-white text-black rounded-br-md"
                                        : "bg-black border border-white/10 text-zinc-200 rounded-bl-md"
                                }`}
                            >
                                {m.role === "assistant" && (
                                    <p className="text-[10px] font-mono uppercase text-[#0072FF] mb-1">
                                        Companion{m.mood ? ` · ${m.mood}` : ""}
                                    </p>
                                )}
                                <p className="whitespace-pre-wrap">{m.text}</p>
                                {m.exercises?.length > 0 && (
                                    <ul className="mt-2 space-y-1 border-t border-white/10 pt-2">
                                        {m.exercises.map((ex) => (
                                            <li key={ex} className="text-xs text-zinc-400 flex gap-1.5">
                                                <Wind className="w-3 h-3 text-[#0072FF] mt-0.5 shrink-0" />
                                                {ex}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <p
                                    className={`text-[10px] mt-1.5 ${
                                        m.role === "user" ? "text-zinc-500" : "text-zinc-600"
                                    }`}
                                >
                                    {m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                {submitting && (
                    <div className="flex justify-start">
                        <div className="text-xs text-zinc-500 inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-black">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Companion is typing…
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSubmit} className="mt-3 shrink-0 flex gap-2 items-end">
                <textarea
                    rows={2}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Message your wellness companion…"
                    className="flex-1 px-4 py-3 rounded-xl bg-zinc-950 border border-white/10 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-white/30 resize-none"
                    maxLength={4000}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                        }
                    }}
                />
                <button
                    type="submit"
                    disabled={submitting || !content.trim()}
                    className="h-11 w-11 rounded-xl bg-white text-black flex items-center justify-center hover:bg-zinc-200 disabled:opacity-50 shrink-0"
                >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
            </form>
            {error && <p className="text-xs text-rose-400 mt-2">{error}</p>}
        </div>
    );
};
