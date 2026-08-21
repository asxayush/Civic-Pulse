import React, { useState } from "react";
import { TicketCard } from "./TicketCard";
import { ShieldAlert, UserPlus, Users, Clock, UserCheck, ShieldX } from "lucide-react";

export const AdminView = ({
    complaints,
    users,
    onStatusChange,
    onToggleBanUser,
    onOpenStaffModal,
    onOpenDetail
}) => {
    const [adminSubTab, setAdminSubTab] = useState("escalated");

    const escalatedComplaints = complaints.filter((c) => c.escalated);

    return (
        <div className="space-y-6">
            
            {/* Admin Header */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center">
                        <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Admin Operations Dashboard</h3>
                        <p className="text-xs text-slate-500">Campus oversight, escalations triage & staff provisioning</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={onOpenStaffModal}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-[#002B66] hover:bg-[#001D47] text-white transition shadow"
                    >
                        <UserPlus className="w-4 h-4" /> Provision Staff
                    </button>
                </div>
            </div>

            {/* Sub Tabs */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200 w-fit">
                <button
                    onClick={() => setAdminSubTab("escalated")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition ${
                        adminSubTab === "escalated"
                            ? "bg-rose-600 text-white shadow"
                            : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                    <Clock className="w-3.5 h-3.5" />
                    Escalated Queue ({escalatedComplaints.length})
                </button>
                <button
                    onClick={() => setAdminSubTab("all")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition ${
                        adminSubTab === "all"
                            ? "bg-[#002B66] text-white shadow"
                            : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                    All Grievances ({complaints.length})
                </button>
                <button
                    onClick={() => setAdminSubTab("users")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition ${
                        adminSubTab === "users"
                            ? "bg-[#002B66] text-white shadow"
                            : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                    <Users className="w-3.5 h-3.5" />
                    User Directory & Bans ({users.length})
                </button>
            </div>

            {/* Sub Tab 1: Escalated Queue */}
            {adminSubTab === "escalated" && (
                <div className="space-y-4">
                    {escalatedComplaints.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl max-w-md mx-auto my-8 shadow-sm">
                            <Clock className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
                            <h4 className="text-base font-bold text-slate-900">Zero Escalated Issues</h4>
                            <p className="text-xs text-slate-500 mt-1">
                                No complaints have passed the 24-hour idle threshold without activity!
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Sub Tab 2: All Complaints */}
            {adminSubTab === "all" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

            {/* Sub Tab 3: User Directory & Bans */}
            {adminSubTab === "users" && (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-100 border-b border-slate-200 text-xs text-slate-600 font-bold uppercase tracking-wider">
                                    <th className="p-4">User</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4 text-center">Invalid Strikes</th>
                                    <th className="p-4 text-center">Account Status</th>
                                    <th className="p-4 text-right">Ban Control</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 text-xs">
                                {users.map((user) => (
                                    <tr key={user._id || user.email} className="hover:bg-slate-50 transition">
                                        <td className="p-4 font-bold text-slate-900">{user.name}</td>
                                        <td className="p-4 text-slate-600 font-mono">{user.email}</td>
                                        <td className="p-4">
                                            <span className={`capitalize px-2 py-0.5 rounded text-[11px] font-bold ${
                                                user.role === "admin"
                                                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                                                    : user.role === "staff"
                                                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                                                    : "bg-slate-100 text-slate-700"
                                            }`}>
                                                {user.role} {user.department ? `(${user.department})` : ""}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                                                (user.invalidComplaintCount || 0) >= 3
                                                    ? "bg-rose-100 text-rose-800"
                                                    : (user.invalidComplaintCount || 0) > 0
                                                    ? "bg-amber-100 text-amber-800"
                                                    : "text-slate-400"
                                            }`}>
                                                {user.invalidComplaintCount || 0} / 3
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            {user.isBanned ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 font-bold">
                                                    <ShieldX className="w-3 h-3" /> Banned
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                                                    <UserCheck className="w-3 h-3" /> Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            {user.role !== "admin" && (
                                                <button
                                                    onClick={() => onToggleBanUser(user._id || user.email)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                                        user.isBanned
                                                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                                            : "bg-rose-100 border border-rose-300 text-rose-700 hover:bg-rose-600 hover:text-white"
                                                    }`}
                                                >
                                                    {user.isBanned ? "Unban Account" : "Ban User"}
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

        </div>
    );
};
