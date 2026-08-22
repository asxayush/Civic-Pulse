import { X } from "lucide-react";

export const ComplaintDetailModal = ({ complaint, currentUser, onClose }) => {
    const canUnmask = currentUser?.role === "staff" || currentUser?.role === "admin";
    const showIdentity = canUnmask || !complaint.isAnonymous;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-zinc-950 border border-white/10 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl animate-slide-in">
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-xs text-zinc-400 bg-black border border-white/10 px-2.5 py-1 rounded shrink-0">
                            {complaint.ticketId}
                        </span>
                        <h3 className="text-sm font-medium text-white truncate">{complaint.title}</h3>
                    </div>
                    <button type="button" onClick={onClose} className="p-1 rounded text-zinc-500 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                    {complaint.imageProof && (
                        <div className="rounded-lg overflow-hidden bg-black border border-white/10 max-h-80 flex items-center justify-center">
                            <img src={complaint.imageProof} alt="Proof" className="w-full h-full object-contain" />
                        </div>
                    )}

                    <div>
                        <h4 className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-1.5">Description</h4>
                        <p className="text-sm text-zinc-300 bg-black p-4 rounded-lg border border-white/10 leading-relaxed">
                            {complaint.description}
                        </p>
                    </div>

                    {complaint.hostelBlock && (
                        <div>
                            <h4 className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-1.5">Location</h4>
                            <div className="text-xs font-medium text-zinc-200 bg-black p-3 rounded-lg border border-white/10">
                                {complaint.hostelBlock}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-black p-3 rounded-lg border border-white/10">
                            <span className="text-zinc-500 block mb-1">
                                Filed by {canUnmask ? "(staff/admin view)" : ""}
                            </span>
                            {showIdentity ? (
                                <>
                                    <span className="font-medium text-white">{complaint.filedBy?.name || "Student"}</span>
                                    <span className="block font-mono text-[11px] text-zinc-500 mt-0.5">
                                        {complaint.filedBy?.email}
                                    </span>
                                </>
                            ) : (
                                <span className="font-medium text-zinc-400 italic">Anonymous student</span>
                            )}
                        </div>
                        <div className="bg-black p-3 rounded-lg border border-white/10">
                            <span className="text-zinc-500 block mb-1">Assigned officer</span>
                            <span className="font-medium text-white">{complaint.assignedTo?.name || "Department staff"}</span>
                            <span className="block font-mono text-[11px] text-zinc-500 capitalize mt-0.5">
                                {complaint.category}
                            </span>
                        </div>
                    </div>

                    {complaint.aiAnalysis?.aiSummary && (
                        <div className="p-3 rounded-lg border border-[#0072FF]/30 bg-[#0072FF]/5 text-xs text-zinc-300">
                            <span className="text-[#0072FF] font-medium">AI analysis · </span>
                            {complaint.aiAnalysis.aiSummary}
                            {complaint.aiAnalysis.resolutionMatchScore != null && (
                                <span className="block mt-1 font-mono text-zinc-500">
                                    Resolution match: {complaint.aiAnalysis.resolutionMatchScore}%
                                </span>
                            )}
                        </div>
                    )}

                    {complaint.statusHistory?.length > 0 && (
                        <div>
                            <h4 className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-2">
                                Audit trail
                            </h4>
                            <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                {complaint.statusHistory.map((hist, idx) => (
                                    <div
                                        key={idx}
                                        className="p-2.5 rounded-lg bg-black border border-white/10 text-xs flex items-center justify-between gap-2"
                                    >
                                        <div>
                                            <span className="font-mono text-zinc-200">
                                                {hist.from || "INIT"} → {hist.to}
                                            </span>
                                            {hist.note && (
                                                <span className="block text-[11px] text-zinc-500 mt-0.5">{hist.note}</span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-zinc-600 shrink-0">
                                            {new Date(hist.changedAt).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
