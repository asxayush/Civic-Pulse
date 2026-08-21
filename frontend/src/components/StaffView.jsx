import React, { useState } from "react";
import { TicketCard } from "./TicketCard";
import { Wrench, CheckCircle2, AlertOctagon } from "lucide-react";

export const StaffView = ({
    complaints,
    onStatusChange,
    onMarkInvalid,
    onOpenDetail
}) => {
    const [selectedDept, setSelectedDept] = useState("electricity");
    const [invalidModalTicketId, setInvalidModalTicketId] = useState(null);

    const deptComplaints = complaints.filter(
        (c) => c.category === selectedDept
    );

    const handleConfirmMarkInvalid = () => {
        if (invalidModalTicketId) {
            onMarkInvalid(invalidModalTicketId);
            setInvalidModalTicketId(null);
        }
    };

    return (
        <div className="space-y-6">
            
            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 text-[#002B66] flex items-center justify-center">
                        <Wrench className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Department Staff Portal</h3>
                        <p className="text-xs text-slate-500">Review auto-routed complaints and update resolution status</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200 flex-wrap">
                    {[
                        { id: "electricity", label: "⚡ Electricity" },
                        { id: "water", label: "💧 Water" },
                        { id: "food", label: "🍲 Food & Mess" },
                        { id: "miscellaneous", label: "📌 Miscellaneous" }
                    ].map((dept) => (
                        <button
                            key={dept.id}
                            onClick={() => setSelectedDept(dept.id)}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                                selectedDept === dept.id
                                    ? "bg-[#002B66] text-white shadow"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            {dept.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tickets Grid */}
            {deptComplaints.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {deptComplaints.map((item) => (
                        <TicketCard
                            key={item._id || item.ticketId}
                            complaint={item}
                            currentRole="staff"
                            onStatusChange={onStatusChange}
                            onMarkInvalid={(id) => setInvalidModalTicketId(id)}
                            onOpenDetail={onOpenDetail}
                        />
                    ))}
                </div>
            ) : (
                <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl max-w-md mx-auto my-8 shadow-sm">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
                    <h4 className="text-base font-bold text-slate-900">No Open Issues in {selectedDept.toUpperCase()}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                        All grievances routed to this department are currently resolved.
                    </p>
                </div>
            )}

            {/* Mark Invalid Warning Modal */}
            {invalidModalTicketId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
                    <div className="bg-white border border-rose-200 rounded-2xl w-full max-w-md p-6 text-center shadow-2xl">
                        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
                            <AlertOctagon className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900">Flag as Invalid / Spam Grievance?</h3>
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                            Marking a complaint invalid records a strike on the student's profile (`invalidComplaintCount++`). Accumulating 3 strikes automatically bans their account.
                        </p>
                        
                        <div className="flex items-center justify-center gap-3 mt-6">
                            <button
                                onClick={() => setInvalidModalTicketId(null)}
                                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmMarkInvalid}
                                className="px-5 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition shadow"
                            >
                                Confirm Strike & Mark Fake
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
