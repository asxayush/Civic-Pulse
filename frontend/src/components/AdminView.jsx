import React, { useState, useEffect } from "react";
import { TicketCard } from "./TicketCard";
import {
    ShieldAlert,
    UserPlus,
    Users,
    Clock,
    UserCheck,
    ShieldX,
    ShieldCheck,
    AlertTriangle,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { adminService } from "../services/api";

export const AdminView = ({
    complaints = [],
    escalatedComplaints = [],
    users = [],
    voiceComplaints = [],
    onStatusChange,
    onToggleBanUser,
    onOpenStaffModal,
    onOpenDetail,
    showToast,
    refreshData
}) => {
    const [adminSubTab, setAdminSubTab] = useState("escalated");
    const [invalidQueue, setInvalidQueue] = useState([]);
    const [loadingQueue, setLoadingQueue] = useState(false);
    const [voiceLoading, setVoiceLoading] = useState(false);

    useEffect(() => {
        if (adminSubTab !== "invalid-review") return;
        setLoadingQueue(true);
        adminService
            .getInvalidReviewQueue()
            .then((res) => {
                setInvalidQueue(res.data || []);
            })
            .catch(() => {
                setInvalidQueue(complaints.filter((c) => c.invalidStatus === "REQUESTED_BY_STAFF"));
            })
            .finally(() => setLoadingQueue(false));
    }, [adminSubTab, complaints]);

    const handleConfirmInvalid = async (id) => {
        try {
            const res = await adminService.confirmInvalid(id);
            if (showToast) {
                showToast(`Invalid confirmed. Strike (${res.data?.studentStrikeCount || "?"}/3).`, "warning");
            }
            setInvalidQueue((prev) => prev.filter((c) => c._id !== id));
            if (refreshData) refreshData();
        } catch (err) {
            if (showToast) showToast(err.response?.data?.message || "Failed to confirm", "error");
        }
    };

    const handleRejectInvalid = async (id) => {
        try {
            await adminService.rejectInvalid(id);
            if (showToast) showToast("Flag rejected. Complaint reinstated.", "success");
            setInvalidQueue((prev) => prev.filter((c) => c._id !== id));
            if (refreshData) refreshData();
        } catch (err) {
            if (showToast) showToast(err.response?.data?.message || "Failed to reject", "error");
        }
    };

    const tabs = [
        { id: "escalated", label: "Escalated", count: escalatedComplaints.length, icon: Clock },
        { id: "invalid-review", label: "Invalid review", count: invalidQueue.length, icon: AlertTriangle },
        { id: "all", label: "All", count: complaints.length, icon: null },
        { id: "users", label: "Users", count: users.length, icon: Users }
        , { id: "voice", label: "Voice complaints", count: voiceComplaints.length, icon: ShieldAlert }
    ];

    return (
        <div className="space-y-6">
            <div className="p-4 rounded-xl border border-white/10 bg-zinc-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg border border-white/10 bg-black flex items-center justify-center text-rose-400">
                        <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white">Admin operations</h3>
                        <p className="text-xs text-zinc-500">Escalations, invalid review, staff provisioning</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onOpenStaffModal}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-white text-black hover:bg-zinc-200"
                >
                    <UserPlus className="w-4 h-4" /> Provision staff
                </button>
            </div>

            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-white/10 w-fit flex-wrap">
                {tabs.map(({ id, label, count, icon: Icon }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setAdminSubTab(id)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium transition ${
                            adminSubTab === id ? "bg-white text-black" : "text-zinc-400 hover:text-white"
                        }`}
                    >
                        {Icon && <Icon className="w-3.5 h-3.5" />}
                        {label} ({count})
                    </button>
                ))}
            </div>

            {adminSubTab === "escalated" &&
                (escalatedComplaints.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {escalatedComplaints.map((item) => (
                            <TicketCard
                                key={item._id || item.ticketId}
                                complaint={item}
                                currentRole="admin"
                                onStatusChange={onStatusChange}
                                onOpenDetail={onOpenDetail}
                            />
                        ))}
                    </div>
                ) : (
                    <Empty icon={Clock} title="Zero escalations" body="No tickets past the 24h idle threshold." />
                ))}

            {adminSubTab === "invalid-review" &&
                (loadingQueue ? (
                    <div className="p-8 text-center text-zinc-500 text-xs">Loading review queue…</div>
                ) : invalidQueue.length > 0 ? (
                    <div className="space-y-3">
                        {invalidQueue.map((item) => (
                            <div key={item._id} className="bg-zinc-950 border border-white/10 rounded-xl p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className="font-mono text-xs bg-black border border-white/10 px-2 py-0.5 rounded">
                                                {item.ticketId}
                                            </span>
                                            <span className="capitalize text-[11px] text-zinc-400">{item.category}</span>
                                        </div>
                                        <h4 className="text-sm font-medium text-white mb-1">{item.title}</h4>
                                        <p className="text-xs text-zinc-500 line-clamp-2 mb-2">{item.description}</p>
                                        <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
                                            <span>
                                                Filed by{" "}
                                                <strong className="text-zinc-300">{item.filedBy?.name || "Student"}</strong>
                                            </span>
                                            <span>
                                                Strikes{" "}
                                                <strong className="text-amber-400">
                                                    {item.filedBy?.invalidComplaintCount || 0}/3
                                                </strong>
                                            </span>
                                        </div>
                                    </div>
                                    {item.imageProof && (
                                        <div className="w-24 h-20 rounded-lg overflow-hidden border border-white/10 shrink-0">
                                            <img src={item.imageProof} alt="Proof" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => handleRejectInvalid(item._id)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 text-emerald-400 hover:bg-white/5"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Legitimate
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleConfirmInvalid(item._id)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-600 text-white hover:bg-rose-500"
                                    >
                                        <XCircle className="w-3.5 h-3.5" /> Confirm invalid
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <Empty icon={ShieldCheck} title="No pending reviews" body="No staff invalid flags awaiting action." />
                ))}

            {adminSubTab === "all" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {complaints.map((item) => (
                        <TicketCard
                            key={item._id || item.ticketId}
                            complaint={item}
                            currentRole="admin"
                            onStatusChange={onStatusChange}
                            onOpenDetail={onOpenDetail}
                        />
                    ))}
                </div>
            )}

            {adminSubTab === "users" && (
                <div className="bg-zinc-950 border border-white/10 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                                    <th className="p-4">User</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4 text-center">Strikes</th>
                                    <th className="p-4 text-center">Status</th>
                                    <th className="p-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-xs">
                                {users.map((user) => (
                                    <tr key={user._id || user.email} className="hover:bg-white/[0.02]">
                                        <td className="p-4 font-medium text-white">{user.name}</td>
                                        <td className="p-4 text-zinc-500 font-mono">{user.email}</td>
                                        <td className="p-4 capitalize text-zinc-300">
                                            {user.role}
                                            {user.department ? ` · ${user.department}` : ""}
                                        </td>
                                        <td className="p-4 text-center tabular-nums">
                                            {user.invalidComplaintCount || 0}/3
                                        </td>
                                        <td className="p-4 text-center">
                                            {user.isBanned ? (
                                                <span className="inline-flex items-center gap-1 text-rose-400">
                                                    <ShieldX className="w-3 h-3" /> Banned
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-emerald-400">
                                                    <UserCheck className="w-3 h-3" /> Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            {user.role !== "admin" && (
                                                <button
                                                    type="button"
                                                    onClick={() => onToggleBanUser(user._id || user.email)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                                        user.isBanned
                                                            ? "bg-emerald-500 text-black"
                                                            : "border border-rose-500/40 text-rose-400 hover:bg-rose-500/10"
                                                    }`}
                                                >
                                                    {user.isBanned ? "Unban" : "Ban"}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {adminSubTab === "voice" && (
                <div className="space-y-3">
                    {voiceLoading ? <div className="p-8 text-center text-zinc-500 text-xs">Loading voice complaints…</div> : voiceComplaints.length === 0 ? (
                        <Empty icon={ShieldCheck} title="No voice complaints" body="Public voice submissions will appear here." />
                    ) : voiceComplaints.map((item) => (
                        <article key={item._id} className={`rounded-xl border p-5 bg-zinc-950 ${item.isEmergency ? "border-rose-500/70 shadow-lg shadow-rose-950/20" : "border-white/10"}`}>
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                {item.isEmergency && <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-2.5 py-1 text-[10px] font-bold text-white"><ShieldAlert className="w-3 h-3" /> EMERGENCY</span>}
                                <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-zinc-300">{item.category}</span>
                                <span className="rounded-full border border-amber-400/30 px-2.5 py-1 text-[10px] text-amber-300">{item.urgencyLevel}</span>
                                <span className="ml-auto text-[11px] text-zinc-600">{new Date(item.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="text-sm text-zinc-200 leading-relaxed">{item.transcript || item.summary || "No transcript available. Listen manually."}</p>
                            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                                <span>{item.location?.block || "Block not provided"}{item.location?.room ? ` · Room ${item.location.room}` : ""}</span>
                                <span>Confidence {Math.round((item.confidence || 0) * 100)}%</span>
                                {item.needsManualReview && <span className="text-amber-400">Manual review needed</span>}
                            </div>
                            <audio controls preload="none" src={item.audioUrl} className="mt-4 w-full h-9" />
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
};

function Empty({ icon: Icon, title, body }) {
    return (
        <div className="p-12 text-center border border-white/10 rounded-xl bg-zinc-950 max-w-md mx-auto">
            <Icon className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
            <h4 className="text-sm font-medium text-white">{title}</h4>
            <p className="text-xs text-zinc-500 mt-1">{body}</p>
        </div>
    );
}
