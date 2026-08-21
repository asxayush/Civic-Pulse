import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useOutletContext } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute, roleHome } from "./components/ProtectedRoute";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { TrackPage } from "./components/TrackPage";
import { AppShell } from "./components/AppShell";
import { StudentView } from "./components/StudentView";
import { StaffView } from "./components/StaffView";
import { AdminView } from "./components/AdminView";
import { WellnessPage } from "./components/WellnessPage";
import { LegalPage } from "./components/LegalPages";

function StudentRoute() {
    const ctx = useOutletContext();
    return (
        <StudentView
            publicFeed={ctx.publicFeed}
            myComplaints={ctx.myComplaints}
            onUpvote={ctx.onUpvote}
            onOpenFileModal={ctx.onOpenFileModal}
            onOpenDetail={ctx.onOpenDetail}
            onVerifyResolution={ctx.onVerifyResolution}
        />
    );
}

function StaffRoute() {
    const ctx = useOutletContext();
    return (
        <StaffView
            complaints={ctx.assigned}
            onStatusChange={ctx.onStatusChange}
            onResolveWithImage={ctx.onResolveWithImage}
            onMarkInvalid={ctx.onMarkInvalid}
            onOpenDetail={ctx.onOpenDetail}
        />
    );
}

function AdminRoute() {
    const ctx = useOutletContext();
    return (
        <AdminView
            complaints={ctx.adminComplaints}
            escalatedComplaints={ctx.escalated}
            users={ctx.users}
            onStatusChange={ctx.onStatusChange}
            onToggleBanUser={ctx.onToggleBanUser}
            onOpenStaffModal={ctx.onOpenStaffModal}
            onOpenDetail={ctx.onOpenDetail}
            showToast={ctx.showToast}
            refreshData={ctx.refreshData}
        />
    );
}

function RoleRedirect() {
    const { currentUser, loading } = useAuth();
    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 text-sm">
                Loading…
            </div>
        );
    }
    if (!currentUser) return <Navigate to="/login" replace />;
    return <Navigate to={roleHome(currentUser.role)} replace />;
}

function AppLayout() {
    return (
        <ProtectedRoute>
            <AppShell />
        </ProtectedRoute>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/track" element={<TrackPage />} />
                    <Route path="/track/:ticketId" element={<TrackPage />} />
                    <Route path="/privacy" element={<LegalPage type="privacy" />} />
                    <Route path="/disclaimer" element={<LegalPage type="disclaimer" />} />
                    <Route path="/terms" element={<LegalPage type="terms" />} />

                    <Route element={<AppLayout />}>
                        <Route
                            path="/app"
                            element={
                                <ProtectedRoute roles={["student"]}>
                                    <StudentRoute />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/wellness"
                            element={
                                <ProtectedRoute roles={["student"]}>
                                    <WellnessPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/staff"
                            element={
                                <ProtectedRoute roles={["staff"]}>
                                    <StaffRoute />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute roles={["admin"]}>
                                    <AdminRoute />
                                </ProtectedRoute>
                            }
                        />
                    </Route>

                    <Route path="/dashboard" element={<RoleRedirect />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
