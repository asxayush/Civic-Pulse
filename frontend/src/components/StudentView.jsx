import React, { useState } from "react";
import { TicketCard } from "./TicketCard";
import { Search, Filter, PlusCircle, Sparkles, AlertCircle } from "lucide-react";

export const StudentView = ({
    complaints,
    onUpvote,
    onOpenFileModal,
    onOpenDetail
}) => {
    const [activeTab, setActiveTab] = useState("community");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");

    const filteredComplaints = complaints.filter((item) => {
        if (activeTab === "my" && !item.isMine) return false;
        
        if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
        if (selectedStatus !== "all" && item.status !== selectedStatus) return false;

        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            const matchTicket = item.ticketId?.toLowerCase().includes(query);
            const matchTitle = item.title?.toLowerCase().includes(query);
            const matchDesc = item.description?.toLowerCase().includes(query);
            return matchTicket || matchTitle || matchDesc;
        }

        return true;
    });

    return (
        <div className="space-y-6">
            
            {/* Toolbar & Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Tabs */}
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200 w-full sm:w-auto">
                    <button
                        onClick={() => setActiveTab("community")}
                        className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-md text-xs font-bold transition ${
                            activeTab === "community"
                                ? "bg-[#002B66] text-white shadow"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        Community Feed ({complaints.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("my")}
                        className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-md text-xs font-bold transition ${
                            activeTab === "my"
                                ? "bg-[#002B66] text-white shadow"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        My Complaints ({complaints.filter(c => c.isMine).length})
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            placeholder="Search ticket ID or title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                        />
                    </div>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-600 capitalize"
                    >
                        <option value="all">All Categories</option>
                        <option value="electricity">⚡ Electricity</option>
                        <option value="water">💧 Water</option>
                        <option value="food">🍲 Food & Mess</option>
                        <option value="miscellaneous">📌 Miscellaneous</option>
                    </select>

                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-600 capitalize"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In-Progress</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>
            </div>

            {/* Complaints Grid */}
            {filteredComplaints.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredComplaints.map((item) => (
                        <TicketCard
                            key={item._id || item.ticketId}
                            complaint={item}
                            currentRole="student"
                            onUpvote={onUpvote}
                            onOpenDetail={onOpenDetail}
                        />
                    ))}
                </div>
            ) : (
                <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl max-w-md mx-auto my-8 shadow-sm">
                    <Sparkles className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                    <h4 className="text-base font-bold text-slate-900">No Grievances Found</h4>
                    <p className="text-xs text-slate-500 mt-1 mb-5">
                        {searchQuery ? "No tickets match your search parameters." : "No grievances have been filed in this view yet."}
                    </p>
                    <button
                        onClick={onOpenFileModal}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-[#002B66] hover:bg-[#001D47] text-white transition shadow"
                    >
                        <PlusCircle className="w-4 h-4" /> File Grievance
                    </button>
                </div>
            )}

        </div>
    );
};
