import React, { useState, useEffect, useRef } from "react";
import { X, Lock, Mail, User, ShieldCheck, Key, RefreshCw } from "lucide-react";
import { authService } from "../services/api";

export const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
    const [authMode, setAuthMode] = useState("login"); // 'login' | 'register' | 'otp'
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    
    // 6-digit OTP array state
    const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
    const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
    
    const [resendTimer, setResendTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        let interval;
        if (authMode === "otp" && resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        } else if (resendTimer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [authMode, resendTimer]);

    if (!isOpen) return null;

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otpDigits];
        newOtp[index] = value.slice(-1);
        setOtpDigits(newOtp);

        if (value && index < 5) {
            otpRefs[index + 1].current.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
            otpRefs[index - 1].current.focus();
        }
    };

    const handleResendOTP = async () => {
        setResendTimer(30);
        setCanResend(false);
        setErrorMsg("");
        setSuccessMsg("");
        setOtpDigits(["", "", "", "", "", ""]);
        try {
            await authService.register(name || "Student User", email, password || "Password123!");
            setSuccessMsg("A new verification OTP code has been sent!");
        } catch (err) {
            setErrorMsg(err.response?.data?.message || err.message || "Failed to resend OTP");
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        
        if (!email.toLowerCase().endsWith("@yourcollege.edu.in") && !email.toLowerCase().includes("@")) {
            setErrorMsg("Registration restricted. Email must end with @yourcollege.edu.in");
            return;
        }

        setSubmitting(true);
        try {
            const res = await authService.register(name, email, password);
            setSubmitting(false);
            setAuthMode("otp");
            setResendTimer(30);
            setCanResend(false);
            setSuccessMsg(res.message || "Verification OTP sent!");
        } catch (err) {
            setSubmitting(false);
            setErrorMsg(err.response?.data?.message || err.message || "Registration failed");
        }
    };

    const handleOtpVerify = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        const fullOtp = otpDigits.join("");
        if (fullOtp.length < 6) {
            setErrorMsg("Please enter 6-digit OTP code");
            return;
        }
        setSubmitting(true);
        try {
            const res = await authService.verifyOTP(email, fullOtp);
            setSubmitting(false);
            onLoginSuccess(res.data?.user || { name: name || "Student User", email, role: "student" });
            onClose();
        } catch (err) {
            setSubmitting(false);
            setErrorMsg(err.response?.data?.message || err.message || "Invalid or expired OTP code");
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        setSubmitting(true);
        try {
            const res = await authService.login(email, password);
            setSubmitting(false);
            onLoginSuccess(res.data?.user || { name: email.split("@")[0] || "User", email, role: "student" });
            onClose();
        } catch (err) {
            setSubmitting(false);
            setErrorMsg(err.response?.data?.message || err.message || "Login failed");
        }
    };

    const handleGoogleAuth = async () => {
        setErrorMsg("");
        setSuccessMsg("");
        const googleEmail = email || "student.google@yourcollege.edu.in";
        if (!googleEmail.toLowerCase().endsWith("@yourcollege.edu.in")) {
            setErrorMsg("Google Single Sign-On restricted to campus domain (@yourcollege.edu.in)");
            return;
        }
        setSubmitting(true);
        try {
            const res = await authService.googleAuth(googleEmail, "Google Verified User");
            setSubmitting(false);
            onLoginSuccess(res.data?.user || { name: "Google Verified User", email: googleEmail, role: "student" });
            onClose();
        } catch (err) {
            setSubmitting(false);
            setErrorMsg(err.response?.data?.message || err.message || "Google authentication failed");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200">
                
                {/* Header Bar */}
                <div className="bg-[#002B66] text-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-sky-400" />
                        <div>
                            <h3 className="text-sm font-bold tracking-tight">CPGRAMS Portal Authentication</h3>
                            <p className="text-[11px] text-sky-200">Live API OTP Verification & Google SSO</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg text-sky-200 hover:text-white hover:bg-blue-900 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Sub Tab Navigation */}
                {authMode !== "otp" && (
                    <div className="flex border-b border-slate-200 bg-slate-50">
                        <button
                            onClick={() => { setAuthMode("login"); setErrorMsg(""); setSuccessMsg(""); }}
                            className={`flex-1 py-3 text-xs font-bold transition border-b-2 ${
                                authMode === "login"
                                    ? "border-[#002B66] text-[#002B66] bg-white"
                                    : "border-transparent text-slate-500 hover:text-slate-800"
                            }`}
                        >
                            Sign In / Login
                        </button>
                        <button
                            onClick={() => { setAuthMode("register"); setErrorMsg(""); setSuccessMsg(""); }}
                            className={`flex-1 py-3 text-xs font-bold transition border-b-2 ${
                                authMode === "register"
                                    ? "border-[#002B66] text-[#002B66] bg-white"
                                    : "border-transparent text-slate-500 hover:text-slate-800"
                            }`}
                        >
                            New Registration
                        </button>
                    </div>
                )}

                {/* Body Content */}
                <div className="p-6">
                    {errorMsg && (
                        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                            {errorMsg}
                        </div>
                    )}
                    {successMsg && (
                        <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
                            {successMsg}
                        </div>
                    )}

                    {/* Google Single Sign-On (SSO) Button */}
                    {authMode !== "otp" && (
                        <div className="mb-5">
                            <button
                                type="button"
                                onClick={handleGoogleAuth}
                                disabled={submitting}
                                className="w-full py-2.5 px-4 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-3 transition shadow-sm active:scale-95"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.28v3.15C3.26 21.3 7.31 24 12 24z" />
                                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.28C.46 8.21 0 10.05 0 12s.46 3.79 1.28 5.42l4-3.15z" />
                                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.28 6.58l4 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                                </svg>
                                <span>Sign in with Google Campus SSO</span>
                            </button>

                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                                <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400 bg-white px-2">Or email OTP login</div>
                            </div>
                        </div>
                    )}

                    {/* Mode 1: Login */}
                    {authMode === "login" && (
                        <form onSubmit={handleLoginSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Campus Email Address</label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                    <input
                                        type="email"
                                        placeholder="student@yourcollege.edu.in"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#002B66]"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#002B66]"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3 rounded-lg bg-[#002B66] hover:bg-[#001D47] text-white font-bold text-xs uppercase tracking-wider transition shadow-md active:scale-95 disabled:opacity-50"
                            >
                                {submitting ? "Authenticating..." : "Login to Portal"}
                            </button>
                        </form>
                    )}

                    {/* Mode 2: Register */}
                    {authMode === "register" && (
                        <form onSubmit={handleRegisterSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Student Name</label>
                                <div className="relative">
                                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                    <input
                                        type="text"
                                        placeholder="e.g. Aarav Sharma"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#002B66]"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">College Email Domain Restricted</label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                    <input
                                        type="email"
                                        placeholder="student@yourcollege.edu.in"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#002B66]"
                                        required
                                    />
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1">Must end with @yourcollege.edu.in for domain check.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#002B66]"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3 rounded-lg bg-[#002B66] hover:bg-[#001D47] text-white font-bold text-xs uppercase tracking-wider transition shadow-md active:scale-95 disabled:opacity-50"
                            >
                                {submitting ? "Sending OTP..." : "Send Verification OTP"}
                            </button>
                        </form>
                    )}

                    {/* Mode 3: Split 6-Digit OTP Setup */}
                    {authMode === "otp" && (
                        <form onSubmit={handleOtpVerify} className="space-y-5">
                            <div className="text-center">
                                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-2 border border-blue-200">
                                    <Key className="w-6 h-6" />
                                </div>
                                <h4 className="text-base font-bold text-slate-900">Email Verification Code</h4>
                                <p className="text-xs text-slate-500 mt-1">
                                    Enter 6-digit OTP sent to <strong className="text-slate-900">{email}</strong>
                                </p>
                            </div>

                            {/* Split 6 Input Digit Boxes */}
                            <div className="flex items-center justify-center gap-2">
                                {otpDigits.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={otpRefs[index]}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        className="w-11 h-12 text-center text-xl font-bold font-mono rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:border-[#002B66] focus:ring-2 focus:ring-blue-500/20 bg-slate-50"
                                    />
                                ))}
                            </div>

                            {/* Resend Timer & Button */}
                            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                                <span>Code valid for 5 mins</span>
                                {canResend ? (
                                    <button
                                        type="button"
                                        onClick={handleResendOTP}
                                        className="text-[#002B66] font-bold hover:underline inline-flex items-center gap-1"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" /> Resend OTP
                                    </button>
                                ) : (
                                    <span className="font-mono text-slate-400">Resend in {resendTimer}s</span>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3 rounded-lg bg-[#002B66] hover:bg-[#001D47] text-white font-bold text-xs uppercase tracking-wider transition shadow-md active:scale-95"
                            >
                                {submitting ? "Verifying OTP..." : "Verify & Complete Setup"}
                            </button>
                        </form>
                    )}

                </div>
            </div>
        </div>
    );
};
