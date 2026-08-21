import React, { useState, useEffect, useCallback } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { Navbar } from "./Navbar";
import { StatsHeader } from "./StatsHeader";
import { FileTicketModal } from "./FileTicketModal";
import { StaffModal } from "./StaffModal";
import { ResolutionVerifyModal } from "./ResolutionVerifyModal";
import { Toast } from "./Toast";
import { ComplaintDetailModal } from "./ComplaintDetailModal";
import { useAuth } from "../context/AuthContext";
import { complaintService, adminService } from "../services/api";

export const AppShell = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const [publicFeed, setPublicFeed] = useState([]);
    const [myComplaints, setMyComplaints] = useState([]);
    const [assigned, setAssigned] = useState([]);
    const [adminComplaints, setAdminComplaints] = useState([]);
    const [escalated, setEscalated] = useState([]);
    const [users, setUsers] = useState([]);

    const [isFileModalOpen, setIsFileModalOpen] = useState(false);
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [selectedDetailComplaint, setSelectedDetailComplaint] = useState(null);
    const [verifyResolutionComplaint, setVerifyResolutionComplaint] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4500);
    };

    const refreshData = useCallback(async () => {
        try {
            const feedRes = await complaintService.getPublicFeed();
            if (feedRes.data && Array.isArray(feedRes.data)) setPublicFeed(feedRes.data);
        } catch {
            /* guest-safe */
        }

        if (!currentUser?.role) return;

        try {
            if (currentUser.role === "student") {
                const myRes = await complaintService.getMyComplaints();
                if (myRes.data) setMyComplaints(myRes.data);
            }
            if (currentUser.role === "staff") {
                const aRes = await complaintService.getAssignedComplaints();
                if (aRes.data) setAssigned(aRes.data);
            }
            if (currentUser.role === "admin") {
                const [allRes, escRes, usersRes] = await Promise.all([
                    adminService.getAllComplaints(),
                    adminService.getEscalatedComplaints(),
                    adminService.getAllUsers()
                ]);
                if (allRes.data) setAdminComplaints(allRes.data);
                if (escRes.data) setEscalated(escRes.data);
                if (usersRes.data) setUsers(usersRes.data);
            }
        } catch (err) {
            console.warn("Dashboard refresh:", err.message);
        }
    }, [currentUser?.role]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    // Live updates — poll every 8s while dashboard is open
    useEffect(() => {
        const id = setInterval(() => {
            refreshData();
        }, 8000);
        return () => clearInterval(id);
    }, [refreshData]);

    const handleFileComplaint = async (formData) => {
        try {
            const apiRes = await complaintService.createComplaint(formData);
            showToast(apiRes.message || "Grievance filed and auto-routed.", "success");
            await refreshData();
        } catch (err) {
            showToast(err.response?.data?.message || err.message || "Failed to file", "error");
            throw err;
        }
    };

    const handleUpvote = async (id) => {
        try {
            const res = await complaintService.upvote(id);
            showToast(res.message || "Upvote toggled", "info");
            await refreshData();
        } catch (err) {
            showToast(err.response?.data?.message || "Login required to upvote", "error");
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const res = await complaintService.updateStatus(id, newStatus);
            showToast(res.message || `Status → ${newStatus}`, "success");
            await refreshData();
        } catch (err) {
            showToast(err.response?.data?.message || err.message || "Status update failed", "error");
        }
    };

    const handleResolveWithImage = async (id, afterImageFile) => {
        try {
            const res = await complaintService.updateStatus(id, "RESOLVED_BY_STAFF", afterImageFile);
            showToast(res.message || "Marked resolved. OTP emailed to student.", "success");
            await refreshData();
        } catch (err) {
            showToast(err.response?.data?.message || err.message || "Resolution failed", "error");
        }
    };

    const handleMarkInvalid = async (id) => {
        try {
            const res = await complaintService.requestInvalid(id);
            showToast(res.message || "Flagged for admin review", "warning");
            await refreshData();
        } catch (err) {
            showToast(err.response?.data?.message || err.message || "Flag failed", "error");
        }
    };

    const handleToggleBanUser = async (userId) => {
        try {
            const res = await adminService.toggleBanUser(userId);
            showToast(res.message || "User status updated", "info");
            setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, isBanned: !u.isBanned } : u)));
        } catch (err) {
            showToast(err.response?.data?.message || err.message || "Ban update failed", "error");
        }
    };

    const handleCreateStaff = async (staffData) => {
        try {
            const res = await adminService.createStaff(staffData);
            showToast(res.message || `Staff created for ${staffData.name}`, "success");
            if (res.data) setUsers((prev) => [res.data, ...prev]);
        } catch (err) {
            showToast(err.response?.data?.message || err.message || "Failed to create staff", "error");
            throw err;
        }
    };

    const handleLogout = () => {
        logout();
        showToast("Signed out", "info");
        navigate("/");
    };

    const statsSource =
        currentUser?.role === "admin"
            ? adminComplaints
            : currentUser?.role === "staff"
              ? assigned
              : [...myComplaints, ...publicFeed];

    return (
        <div className="min-h-screen bg-black text-zinc-100 pb-16 flex flex-col">
            <Navbar
                onOpenFileModal={() => setIsFileModalOpen(true)}
                currentUser={currentUser}
                onLogout={handleLogout}
                live
            />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 flex-1 w-full">
                <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 inline-flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                        </span>
                        Live complaints · refreshes every 8s
                    </p>
                </div>
                <StatsHeader complaints={statsSource} />

                <Outlet
                    context={{
                        publicFeed,
                        myComplaints,
                        assigned,
                        adminComplaints,
                        escalated,
                        users,
                        refreshData,
                        showToast,
                        onUpvote: handleUpvote,
                        onOpenFileModal: () => setIsFileModalOpen(true),
                        onOpenDetail: setSelectedDetailComplaint,
                        onVerifyResolution: setVerifyResolutionComplaint,
                        onStatusChange: handleStatusChange,
                        onResolveWithImage: handleResolveWithImage,
                        onMarkInvalid: handleMarkInvalid,
                        onToggleBanUser: handleToggleBanUser,
                        onOpenStaffModal: () => setIsStaffModalOpen(true)
                    }}
                />
            </main>

            <SiteFooterCompact />

            <FileTicketModal
                isOpen={isFileModalOpen}
                onClose={() => setIsFileModalOpen(false)}
                onSubmit={handleFileComplaint}
            />

            <StaffModal
                isOpen={isStaffModalOpen}
                onClose={() => setIsStaffModalOpen(false)}
                onSubmit={handleCreateStaff}
            />

            {verifyResolutionComplaint && (
                <ResolutionVerifyModal
                    isOpen={Boolean(verifyResolutionComplaint)}
                    complaint={verifyResolutionComplaint}
                    onClose={() => setVerifyResolutionComplaint(null)}
                    onSuccess={() => refreshData()}
                    showToast={showToast}
                />
            )}

            {selectedDetailComplaint && (
                <ComplaintDetailModal
                    complaint={selectedDetailComplaint}
                    currentUser={currentUser}
                    onClose={() => setSelectedDetailComplaint(null)}
                />
            )}

            <Toast toast={toast} onClose={() => setToast(null)} />
        </div>
    );
};

function SiteFooterCompact() {
    return (
        <footer className="border-t border-white/10 mt-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row gap-3 justify-between text-[11px] text-zinc-600">
                <p>Civic Pulse · AI triage can err — review before submit</p>
                <div className="flex gap-4">
                    <Link to="/privacy" className="hover:text-zinc-300">Privacy</Link>
                    <Link to="/disclaimer" className="hover:text-zinc-300">Disclaimer</Link>
                    <Link to="/terms" className="hover:text-zinc-300">Terms</Link>
                </div>
            </div>
        </footer>
    );
}
