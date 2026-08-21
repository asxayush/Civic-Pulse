import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { BlockCards } from "./components/BlockCards";
import { AuthModal } from "./components/AuthModal";
import { StatsHeader } from "./components/StatsHeader";
import { StudentView } from "./components/StudentView";
import { StaffView } from "./components/StaffView";
import { AdminView } from "./components/AdminView";
import { FileTicketModal } from "./components/FileTicketModal";
import { StaffModal } from "./components/StaffModal";
import { Toast } from "./components/Toast";
import { X, ShieldCheck, CheckCircle2, AlertTriangle, FileText, ExternalLink, Info } from "lucide-react";

// Initial Demo Grievances
const initialComplaints = [
    {
        _id: "c1",
        ticketId: "CP-2026-00147",
        title: "Main Hostel Block B - Water Supply Interrupted",
        description: "Water pressure has dropped completely on the 3rd floor since 8 AM today. Students cannot use washrooms.",
        category: "water",
        imageProof: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
        isAnonymous: false,
        filedBy: { name: "Aarav Sharma", email: "aarav.s@yourcollege.edu.in" },
        assignedTo: { name: "Ramesh Kumar (Plumbing)", email: "plumbing@yourcollege.edu.in", department: "water" },
        status: "pending",
        priority: "high",
        upvotes: ["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8", "u9", "u10", "u11", "u12"],
        hasUpvoted: true,
        escalated: true,
        isInvalid: false,
        isMine: true,
        createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString()
    },
    {
        _id: "c2",
        ticketId: "CP-2026-00148",
        title: "Mess Area - Refrigerator Cooling Faulty",
        description: "Mess refrigerator temperature fluctuates causing milk and dairy products to spoil quickly.",
        category: "food",
        imageProof: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=600&q=80",
        isAnonymous: true,
        filedBy: { name: "Anonymous Student", email: "hidden@yourcollege.edu.in" },
        assignedTo: { name: "Suresh Mess Manager", email: "mess@yourcollege.edu.in", department: "food" },
        status: "in-progress",
        priority: "normal",
        upvotes: ["u1", "u2", "u3", "u4"],
        hasUpvoted: false,
        escalated: false,
        isInvalid: false,
        isMine: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
        _id: "c3",
        ticketId: "CP-2026-00149",
        title: "Library Reading Room - AC Short Circuit",
        description: "Sparks observed in the AC unit on the 2nd floor reading hall. Power tripped.",
        category: "electricity",
        imageProof: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
        isAnonymous: false,
        filedBy: { name: "Priya Patel", email: "priya.p@yourcollege.edu.in" },
        assignedTo: { name: "Verma Electrician", email: "electrician@yourcollege.edu.in", department: "electricity" },
        status: "resolved",
        priority: "normal",
        upvotes: ["u1", "u2"],
        hasUpvoted: false,
        escalated: false,
        isInvalid: false,
        isMine: false,
        createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
    }
];

const initialUsers = [
    { _id: "u1", name: "Aarav Sharma", email: "aarav.s@yourcollege.edu.in", role: "student", invalidComplaintCount: 0, isBanned: false },
    { _id: "u2", name: "Priya Patel", email: "priya.p@yourcollege.edu.in", role: "student", invalidComplaintCount: 1, isBanned: false },
    { _id: "u3", name: "Rohan Verma", email: "rohan.v@yourcollege.edu.in", role: "student", invalidComplaintCount: 3, isBanned: true },
    { _id: "u4", name: "Verma Electrician", email: "electrician@yourcollege.edu.in", role: "staff", department: "electricity", invalidComplaintCount: 0, isBanned: false },
    { _id: "u5", name: "Ramesh Kumar", email: "plumbing@yourcollege.edu.in", role: "staff", department: "water", invalidComplaintCount: 0, isBanned: false },
    { _id: "u6", name: "Campus Chief Admin", email: "admin@yourcollege.edu.in", role: "admin", invalidComplaintCount: 0, isBanned: false }
];

export default function App() {
    const [currentRole, setCurrentRole] = useState("student");
    const [complaints, setComplaints] = useState(initialComplaints);
    const [users, setUsers] = useState(initialUsers);
    
    const [isFileModalOpen, setIsFileModalOpen] = useState(false);
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [selectedDetailComplaint, setSelectedDetailComplaint] = useState(null);
    const [toast, setToast] = useState(null);

    const currentUser = {
        name: currentRole === "student" ? "Aarav Sharma" : currentRole === "staff" ? "Verma Electrician" : "Campus Chief Admin",
        email: currentRole === "student" ? "aarav.s@yourcollege.edu.in" : currentRole === "staff" ? "electrician@yourcollege.edu.in" : "admin@yourcollege.edu.in",
        role: currentRole
    };

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // Handlers
    const handleFileComplaint = async (formData) => {
        const nextIdNumber = complaints.length + 148;
        const ticketId = `CP-2026-${String(nextIdNumber).padStart(5, '0')}`;
        
        const newComplaint = {
            _id: `c_${Date.now()}`,
            ticketId,
            title: formData.title,
            description: formData.description,
            category: formData.category,
            imageProof: formData.imagePreview || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
            isAnonymous: formData.isAnonymous,
            filedBy: { name: currentUser.name, email: currentUser.email },
            assignedTo: { name: `Assigned ${formData.category} Staff`, department: formData.category },
            status: "pending",
            priority: "normal",
            upvotes: [],
            hasUpvoted: false,
            escalated: false,
            isInvalid: false,
            isMine: true,
            createdAt: new Date().toISOString()
        };

        setComplaints([newComplaint, ...complaints]);
        showToast(`Grievance filed! Ticket ${ticketId} generated & auto-routed to ${formData.category} department.`, "success");
    };

    const handleUpvote = (id) => {
        setComplaints(complaints.map((c) => {
            if (c._id === id) {
                const alreadyUpvoted = c.hasUpvoted;
                const newUpvotes = alreadyUpvoted
                    ? c.upvotes.filter(u => u !== "currentUser")
                    : [...c.upvotes, "currentUser"];
                
                const isHigh = newUpvotes.length >= 10;

                if (!alreadyUpvoted && isHigh && c.priority !== "high") {
                    showToast(`Ticket ${c.ticketId} escalated to HIGH PRIORITY due to 10+ upvotes!`, "warning");
                } else {
                    showToast(alreadyUpvoted ? "Upvote removed" : "Upvote added!", "info");
                }

                return {
                    ...c,
                    upvotes: newUpvotes,
                    hasUpvoted: !alreadyUpvoted,
                    priority: isHigh ? "high" : c.priority
                };
            }
            return c;
        }));
    };

    const handleStatusChange = (id, newStatus) => {
        setComplaints(complaints.map((c) => {
            if (c._id === id) {
                return {
                    ...c,
                    status: newStatus,
                    lastUpdatedAt: new Date().toISOString()
                };
            }
            return c;
        }));
        showToast(`Ticket status updated to '${newStatus}'`, "success");
    };

    const handleMarkInvalid = (id) => {
        const target = complaints.find(c => c._id === id);
        if (!target) return;

        setComplaints(complaints.map((c) => c._id === id ? { ...c, isInvalid: true } : c));
        
        const emailToFind = target.filedBy?.email;
        setUsers(users.map((u) => {
            if (u.email === emailToFind) {
                const count = (u.invalidComplaintCount || 0) + 1;
                const isBanned = count >= 3;
                if (isBanned) {
                    showToast(`User ${u.name} accumulated 3 strikes and has been AUTOMATICALLY BANNED.`, "error");
                } else {
                    showToast(`Complaint marked invalid. Strike recorded for ${u.name} (${count}/3).`, "warning");
                }
                return { ...u, invalidComplaintCount: count, isBanned };
            }
            return u;
        }));
    };

    const handleToggleBanUser = (userKey) => {
        setUsers(users.map((u) => {
            if (u._id === userKey || u.email === userKey) {
                const nextBanned = !u.isBanned;
                showToast(`User ${u.name} ${nextBanned ? "banned" : "unbanned"} successfully.`, nextBanned ? "error" : "success");
                return { ...u, isBanned: nextBanned };
            }
            return u;
        }));
    };

    const handleCreateStaff = (staffData) => {
        const newStaffUser = {
            _id: `u_${Date.now()}`,
            name: staffData.name,
            email: staffData.email,
            role: "staff",
            department: staffData.department,
            invalidComplaintCount: 0,
            isBanned: false
        };
        setUsers([...users, newStaffUser]);
        showToast(`Staff account created for ${staffData.name} (${staffData.department} department).`, "success");
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-800 font-sans antialiased selection:bg-blue-600 selection:text-white pb-16">
            
            {/* Global CPGRAMS Style Navbar */}
            <Navbar
                currentRole={currentRole}
                setRole={setCurrentRole}
                onOpenFileModal={() => setIsFileModalOpen(true)}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
                currentUser={currentUser}
            />

            {/* CPGRAMS Guidance & Institutional Notice Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-xs text-slate-700 space-y-4">
                    <div>
                        <h4 className="font-extrabold text-[#002B66] uppercase tracking-wider text-xs mb-2">
                            Issues which are handled under Campus Redress:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-600 font-medium">
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                Hostel Room Electricity & Appliance Failures
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                Plumbing, Water Supply & Bathroom Hygiene
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                Mess Quality & Food Sanitation Concerns
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                Campus Infrastructure & Miscellaneous Grievances
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-slate-600 space-y-1">
                        <p><strong>Note 1:</strong> Every grievance filed is auto-routed to the assigned department officer. A unique registration Ticket ID (e.g. <code>CP-2026-00147</code>) is issued immediately for real-time tracking.</p>
                        <p><strong>Note 2:</strong> Complaints unresolved for more than 24 hours are automatically escalated to the Campus Administration office.</p>
                    </div>
                </div>
            </div>

            {/* Prominent CPGRAMS Block Action Cards (Register/Login, View Status, File Complaint) */}
            <BlockCards
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onOpenStatus={() => showToast("Use the search bar in the Community Feed below to track ticket status.", "info")}
                onFileTicket={() => setIsFileModalOpen(true)}
            />

            {/* Main Dashboard Container */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Stats Metrics Header */}
                <StatsHeader complaints={complaints} />

                {/* Workspace Views depending on Role */}
                {currentRole === "student" && (
                    <StudentView
                        complaints={complaints}
                        onUpvote={handleUpvote}
                        onOpenFileModal={() => setIsFileModalOpen(true)}
                        onOpenDetail={(c) => setSelectedDetailComplaint(c)}
                    />
                )}

                {currentRole === "staff" && (
                    <StaffView
                        complaints={complaints}
                        onStatusChange={handleStatusChange}
                        onMarkInvalid={handleMarkInvalid}
                        onOpenDetail={(c) => setSelectedDetailComplaint(c)}
                    />
                )}

                {currentRole === "admin" && (
                    <AdminView
                        complaints={complaints}
                        users={users}
                        onStatusChange={handleStatusChange}
                        onToggleBanUser={handleToggleBanUser}
                        onOpenStaffModal={() => setIsStaffModalOpen(true)}
                        onOpenDetail={(c) => setSelectedDetailComplaint(c)}
                    />
                )}
            </main>

            {/* CPGRAMS Authentication Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onLoginSuccess={(user) => {
                    showToast(`Logged in as ${user.name}! Welcome to Civic Pulse CPGRAMS Portal.`, "success");
                }}
            />

            {/* File Complaint Modal */}
            <FileTicketModal
                isOpen={isFileModalOpen}
                onClose={() => setIsFileModalOpen(false)}
                onSubmit={handleFileComplaint}
            />

            {/* Staff Provisioning Modal */}
            <StaffModal
                isOpen={isStaffModalOpen}
                onClose={() => setIsStaffModalOpen(false)}
                onSubmit={handleCreateStaff}
            />

            {/* Detail Drawer Modal */}
            {selectedDetailComplaint && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
                    <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
                        <div className="px-6 py-4 border-b border-slate-200 bg-[#002B66] text-white flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-sky-200 bg-blue-900 border border-blue-700 px-2.5 py-1 rounded">
                                    {selectedDetailComplaint.ticketId}
                                </span>
                                <h3 className="text-base font-bold text-white truncate max-w-md">
                                    {selectedDetailComplaint.title}
                                </h3>
                            </div>
                            <button onClick={() => setSelectedDetailComplaint(null)} className="p-1 rounded text-sky-200 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            {selectedDetailComplaint.imageProof && (
                                <div className="rounded-lg overflow-hidden bg-slate-100 border border-slate-200 max-h-80 flex items-center justify-center">
                                    <img src={selectedDetailComplaint.imageProof} alt="Proof" className="w-full h-full object-contain" />
                                </div>
                            )}
                            <div className="space-y-1.5">
                                <h4 className="text-xs font-bold uppercase text-slate-500">Grievance Description</h4>
                                <p className="text-sm text-slate-800 bg-slate-50 p-4 rounded-lg border border-slate-200 leading-relaxed font-medium">
                                    {selectedDetailComplaint.description}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                    <span className="text-slate-500 block mb-1 font-bold">Filed By (Unmasked for Staff/Admin)</span>
                                    <span className="font-bold text-slate-900">{selectedDetailComplaint.filedBy?.name || "Student"}</span>
                                    <span className="block font-mono text-[11px] text-blue-700 mt-0.5">{selectedDetailComplaint.filedBy?.email}</span>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                    <span className="text-slate-500 block mb-1 font-bold">Assigned Department Officer</span>
                                    <span className="font-bold text-slate-900">{selectedDetailComplaint.assignedTo?.name || "Department Staff"}</span>
                                    <span className="block font-mono text-[11px] text-slate-600 capitalize mt-0.5">{selectedDetailComplaint.category}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Toast */}
            <Toast toast={toast} onClose={() => setToast(null)} />
        </div>
    );
}
