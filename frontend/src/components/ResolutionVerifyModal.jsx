import React, { useState } from "react";
import { X, ShieldCheck, Key, CheckCircle2, RotateCcw } from "lucide-react";
import { complaintService } from "../services/api";

export const ResolutionVerifyModal = ({ complaint, isOpen, onClose, onSuccess, showToast }) => {
    const [mode, setMode] = useState("verify");
    const [otp, setOtp] = useState("");
    const [rejectReason, setRejectReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    if (!isOpen || !complaint) return null;

    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        if (otp.length !== 4) {
            setErrorMsg("Enter the 4-digit OTP from your email.");
            return;
        }
        setSubmitting(true);
        try {
            const res = await complaintService.verifyResolution(complaint._id, otp);
            setSubmitting(false);
            if (showToast) showToast("Resolution verified. Ticket closed.", "success");
            if (onSuccess) onSuccess(res.data);
            onClose();
        } catch (err) {
            setSubmitting(false);
            setErrorMsg(err.response?.data?.message || err.message || "Verification failed");
        }
    };

    const handleRejectSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSubmitting(true);
        try {
            const res = await complaintService.rejectResolution(complaint._id, rejectReason);
            setSubmitting(false);
            if (showToast) showToast("Rejected. Ticket reopened.", "warning");
            if (onSuccess) onSuccess(res.data);
            onClose();
        } catch (err) {
            setSubmitting(false);
            setErrorMsg(err.response?.data?.message || err.message || "Rejection failed");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-zinc-950 border border-white/10 rounded-xl w-full max-w-lg overflow-hidden animate-slide-in">
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-[#0072FF]" />
                        <div>
                            <h3 className="text-sm font-medium text-white">Resolution handshake</h3>
                            <p className="text-xs text-zinc-500 font-mono">{complaint.ticketId}</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="p-1 text-zinc-500 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex border-b border-white/10">
                    <button
                        type="button"
                        onClick={() => {
                            setMode("verify");
                            setErrorMsg("");
                        }}
                        className={`flex-1 py-3 text-xs font-medium border-b-2 ${
                            mode === "verify"
                                ? "border-emerald-400 text-emerald-400"
                                : "border-transparent text-zinc-500 hover:text-zinc-300"
                        }`}
                    >
                        <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" /> Confirm (OTP)
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setMode("reject");
                            setErrorMsg("");
                        }}
                        className={`flex-1 py-3 text-xs font-medium border-b-2 ${
                            mode === "reject"
                                ? "border-rose-400 text-rose-400"
                                : "border-transparent text-zinc-500 hover:text-zinc-300"
                        }`}
                    >
                        <RotateCcw className="w-3.5 h-3.5 inline mr-1" /> Reject
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {errorMsg && (
                        <div className="p-3 rounded-lg border border-rose-500/30 text-rose-300 text-xs">{errorMsg}</div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Before</span>
                            <div className="h-28 rounded-lg overflow-hidden border border-white/10 bg-black">
                                {complaint.imageProof ? (
                                    <img src={complaint.imageProof} alt="Before" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-xs text-zinc-600">No image</div>
                                )}
                            </div>
                        </div>
                        <div>
                            <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">After</span>
                            <div className="h-28 rounded-lg overflow-hidden border border-emerald-500/30 bg-black">
                                {complaint.afterImage ? (
                                    <img src={complaint.afterImage} alt="After" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-xs text-zinc-600 p-2 text-center">
                                        No after photo
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {mode === "verify" ? (
                        <form onSubmit={handleVerifySubmit} className="space-y-4">
                            <p className="text-xs text-zinc-400">
                                Enter the 4-digit code emailed when staff marked this resolved.
                            </p>
                            <div className="relative">
                                <Key className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                                <input
                                    type="text"
                                    maxLength={4}
                                    placeholder="4812"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-white/10 bg-black text-white font-mono text-lg tracking-widest focus:outline-none focus:border-white/30"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-2.5 rounded-lg bg-emerald-500 text-black text-sm font-medium hover:bg-emerald-400 disabled:opacity-50"
                            >
                                {submitting ? "Verifying…" : "Confirm & close"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRejectSubmit} className="space-y-4">
                            <textarea
                                rows={3}
                                placeholder="Why is the fix incomplete?"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="w-full p-3 rounded-lg border border-white/10 bg-black text-sm text-white focus:outline-none focus:border-white/30 resize-none"
                                required
                            />
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-2.5 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-500 disabled:opacity-50"
                            >
                                {submitting ? "Reopening…" : "Reject & reopen"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
