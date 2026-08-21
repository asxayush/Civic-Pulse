import React, { useState } from "react";
import { TicketCard } from "./TicketCard";
import { Search, PlusCircle, Sparkles } from "lucide-react";

export const StudentView = ({
    publicFeed = [],
    myComplaints = [],
    onUpvote,
    onOpenFileModal,
    onOpenDetail,
    onVerifyResolution
}) => {
    const [activeTab, setActiveTab] = useState("community");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");

    const source = activeTab === "my" ? myComplaints : publicFeed;

    const filtered = source.filter((item) => {
        if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
        if (selectedStatus !== "all" && item.status !== selectedStatus) return false;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            return (
                item.ticketId?.toLowerCase().includes(q) ||
                item.title?.toLowerCase().includes(q) ||
                item.description?.toLowerCase().includes(q) ||
                item.hostelBlock?.toLowerCase().includes(q)
            );
        }
        return true;
    });

    const seg = (id, label, count) => (
        <button
            type="button"
            onClick={() => setActiveTab(id)}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition ${
                activeTab === id ? "bg-white text-black" : "text-zinc-400 hover:text-white"
            }`}
        >
            {label} ({count})
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 rounded-xl border border-white/10 bg-zinc-950">
                <div className="flex items-center gap-1 bg-black p-1 rounded-lg border border-white/10">
                    {seg("community", "Community", publicFeed.length)}
                    {seg("my", "My complaints", myComplaints.length)}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                    <div className="relative flex-1 sm:w-56">
                        <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            placeholder="Search…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-lg bg-black border border-white/10 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30"
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-black border border-white/10 text-xs text-zinc-300 focus:outline-none capitalize"
                    >
                        <option value="all">All categories</option>
                        <option value="electricity">Electricity</option>
                        <option value="water">Water</option>
                        <option value="food">Food & Mess</option>
                        <option value="miscellaneous">Miscellaneous</option>
                    </select>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-black border border-white/10 text-xs text-zinc-300 focus:outline-none"
                    >
                        <option value="all">All statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In progress</option>
                        <option value="RESOLVED_BY_STAFF">Awaiting verification</option>
                        <option value="VERIFIED_CLOSED">Verified closed</option>
                        <option value="REOPENED">Reopened</option>
                    </select>
                </div>
            </div>

            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((item) => (
                        <TicketCard
                            key={item._id || item.ticketId}
                            complaint={item}
                            currentRole="student"
                            onUpvote={onUpvote}
                            onOpenDetail={onOpenDetail}
                            onVerifyResolution={onVerifyResolution}
                        />
                    ))}
                </div>
            ) : (
                <div className="p-12 text-center border border-white/10 rounded-xl bg-zinc-950 max-w-md mx-auto">
                    <Sparkles className="w-8 h-8 text-[#0072FF] mx-auto mb-3" />
                    <h4 className="text-sm font-medium text-white">No grievances found</h4>
                    <p className="text-xs text-zinc-500 mt-1 mb-5">
                        {searchQuery ? "Nothing matches your filters." : "File your first campus grievance."}
                    </p>
                    <button
                        type="button"
                        onClick={onOpenFileModal}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-white text-black hover:bg-zinc-200"
                    >
                        <PlusCircle className="w-4 h-4" /> File grievance
                    </button>
                </div>
            )}
        </div>
    );
};
