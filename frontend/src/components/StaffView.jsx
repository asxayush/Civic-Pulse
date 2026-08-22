import { useState } from "react";
import { TicketCard } from "./TicketCard";
import { Wrench, CheckCircle2, ShieldAlert, Upload, X } from "lucide-react";

export const StaffView = ({
    complaints = [],
    onStatusChange,
    onMarkInvalid,
    onOpenDetail,
    onResolveWithImage
}) => {
    const [invalidModalTicketId, setInvalidModalTicketId] = useState(null);
    const [resolveModal, setResolveModal] = useState(null);

    const handleResolveImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setResolveModal((prev) => ({
                ...prev,
                afterImageFile: file,
                afterImagePreview: reader.result
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleStatusChangeIntercept = (id, newStatus) => {
        if (newStatus === "RESOLVED_BY_STAFF") {
            setResolveModal({ complaintId: id, afterImageFile: null, afterImagePreview: null });
        } else {
            onStatusChange(id, newStatus);
        }
    };

    const handleConfirmResolve = () => {
        if (!resolveModal) return;
        if (onResolveWithImage && resolveModal.afterImageFile) {
            onResolveWithImage(resolveModal.complaintId, resolveModal.afterImageFile);
        } else {
            onStatusChange(resolveModal.complaintId, "RESOLVED_BY_STAFF");
        }
        setResolveModal(null);
    };

    return (
        <div className="space-y-6">
            <div className="p-4 rounded-xl border border-white/10 bg-zinc-950 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg border border-white/10 bg-black flex items-center justify-center text-[#0072FF]">
                    <Wrench className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-sm font-medium text-white">Assigned queue</h3>
                    <p className="text-xs text-zinc-500">Tickets auto-routed to your department · {complaints.length} open</p>
                </div>
            </div>

            {complaints.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {complaints.map((item) => (
                        <TicketCard
                            key={item._id || item.ticketId}
                            complaint={item}
                            currentRole="staff"
                            onStatusChange={handleStatusChangeIntercept}
                            onMarkInvalid={(id) => setInvalidModalTicketId(id)}
                            onOpenDetail={onOpenDetail}
                        />
                    ))}
                </div>
            ) : (
                <div className="p-12 text-center border border-white/10 rounded-xl bg-zinc-950 max-w-md mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                    <h4 className="text-sm font-medium text-white">Queue clear</h4>
                    <p className="text-xs text-zinc-500 mt-1">No assigned tickets right now.</p>
                </div>
            )}

            {invalidModalTicketId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-zinc-950 border border-white/10 rounded-xl w-full max-w-md p-6 text-center animate-slide-in">
                        <ShieldAlert className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                        <h3 className="text-sm font-medium text-white">Flag for admin review?</h3>
                        <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                            Strike applies only after admin confirms — two-tier anti-abuse.
                        </p>
                        <div className="flex items-center justify-center gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setInvalidModalTicketId(null)}
                                className="px-4 py-2 text-xs text-zinc-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    onMarkInvalid(invalidModalTicketId);
                                    setInvalidModalTicketId(null);
                                }}
                                className="px-5 py-2 rounded-lg text-xs font-medium bg-amber-500 text-black hover:bg-amber-400"
                            >
                                Send to admin
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {resolveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-zinc-950 border border-white/10 rounded-xl w-full max-w-md p-6 animate-slide-in">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                        <h3 className="text-sm font-medium text-white text-center">Mark as resolved</h3>
                        <p className="text-xs text-zinc-400 mt-2 text-center">
                            Upload after-photo proof. A 4-digit OTP goes to the student.
                        </p>

                        <div className="mt-4">
                            <label className="block text-[11px] font-mono uppercase text-zinc-500 mb-2">
                                Resolution photo
                            </label>
                            {resolveModal.afterImagePreview ? (
                                <div className="relative h-40 rounded-lg overflow-hidden border border-white/10">
                                    <img
                                        src={resolveModal.afterImagePreview}
                                        alt="Resolution proof"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setResolveModal((p) => ({
                                                ...p,
                                                afterImageFile: null,
                                                afterImagePreview: null
                                            }))
                                        }
                                        className="absolute top-2 right-2 p-1.5 rounded bg-black/80 text-white hover:bg-rose-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center h-28 border border-dashed border-white/15 hover:border-white/30 rounded-lg cursor-pointer bg-black text-center">
                                    <Upload className="w-5 h-5 text-zinc-500 mb-1" />
                                    <span className="text-xs text-zinc-400">Upload after photo</span>
                                    <input type="file" accept="image/*" onChange={handleResolveImageChange} className="hidden" />
                                </label>
                            )}
                        </div>

                        <div className="flex items-center justify-center gap-3 mt-5">
                            <button
                                type="button"
                                onClick={() => setResolveModal(null)}
                                className="px-4 py-2 text-xs text-zinc-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmResolve}
                                className="px-5 py-2 rounded-lg text-xs font-medium bg-emerald-500 text-black hover:bg-emerald-400"
                            >
                                Confirm & send OTP
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
