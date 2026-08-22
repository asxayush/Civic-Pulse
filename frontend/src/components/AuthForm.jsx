import { useState, useEffect, useRef } from "react";
import { Lock, Mail, User, Key, RefreshCw, Sparkles } from "lucide-react";
import { authService } from "../services/api";

export const AuthForm = ({ onLoginSuccess, onError, initialMode = "login" }) => {
    const [authMode, setAuthMode] = useState(initialMode);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [adminPin, setAdminPin] = useState("");
    const [name, setName] = useState("");
    const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
    const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
    const [resendTimer, setResendTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        let interval = null;
        if (authMode === "otp" && resendTimer > 0) {
            interval = setInterval(() => setResendTimer((p) => p - 1), 1000);
        } else if (resendTimer === 0 && !canResend) {
            setCanResend(true);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [authMode, resendTimer, canResend]);

    const formatApiError = (err) => {
        const data = err.response?.data;
        if (!data) return err.message || "Request failed";
        if (Array.isArray(data.errors) && data.errors.length) {
            const details = data.errors
                .map((e) => (typeof e === "string" ? e : Object.values(e).join(", ")))
                .filter(Boolean)
                .join(" · ");
            return details ? `${data.message || "Validation failed"}: ${details}` : data.message;
        }
        return data.message || err.message || "Request failed";
    };

    const setErr = (msg) => {
        setErrorMsg(msg);
        if (onError) onError(msg);
    };

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const next = [...otpDigits];
        next[index] = value.slice(-1);
        setOtpDigits(next);
        if (value && index < 5 && otpRefs[index + 1]?.current) {
            otpRefs[index + 1].current.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otpDigits[index] && index > 0 && otpRefs[index - 1]?.current) {
            otpRefs[index - 1].current.focus();
        }
    };

    const handleResendOTP = async () => {
        if (!password) {
            setErr("Re-enter your password to resend OTP.");
            return;
        }
        setResendTimer(30);
        setCanResend(false);
        setErrorMsg("");
        setSuccessMsg("");
        setOtpDigits(["", "", "", "", "", ""]);
        try {
            await authService.register(name || "Student User", email, password);
            setSuccessMsg("New OTP generated. Check the message below or backend logs.");
        } catch (err) {
            setErr(formatApiError(err));
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        setSubmitting(true);
        try {
            const res = await authService.register(name, email, password);
            setSubmitting(false);
            setAuthMode("otp");
            setResendTimer(30);
            setCanResend(false);
            const devOTP = res.data?.devOTP;
            if (devOTP) {
                const digits = String(devOTP).padStart(6, "0").slice(0, 6).split("");
                setOtpDigits(digits);
                setSuccessMsg(`Dev OTP auto-filled: ${devOTP} — click Verify to continue.`);
            } else {
                setSuccessMsg(res.message || "Verification OTP sent. Check your email.");
            }
        } catch (err) {
            setSubmitting(false);
            setErr(formatApiError(err));
        }
    };

    const handleOtpVerify = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        const fullOtp = otpDigits.join("");
        if (fullOtp.length < 6) {
            setErr("Enter the 6-digit OTP");
            return;
        }
        setSubmitting(true);
        try {
            const res = await authService.verifyOTP(email, fullOtp);
            setSubmitting(false);
            onLoginSuccess(res.data?.user || { name: name || "Student User", email, role: "student" });
        } catch (err) {
            setSubmitting(false);
            setErr(formatApiError(err));
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSubmitting(true);
        try {
            const res = await authService.login(email, password, adminPin);
            setSubmitting(false);
            onLoginSuccess(res.data?.user || { name: email.split("@")[0], email, role: "student" });
        } catch (err) {
            setSubmitting(false);
            setErr(formatApiError(err));
        }
    };

    const inputClass =
        "w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-black/70 text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#39a0ff]/70 focus:ring-2 focus:ring-[#39a0ff]/10 transition";

    return (
        <div>
            {authMode !== "otp" && (
                <div className="flex border-b border-white/10 mb-6 -mt-1">
                    <button
                        type="button"
                        onClick={() => {
                            setAuthMode("login");
                            setErrorMsg("");
                            setSuccessMsg("");
                        }}
                        className={`flex-1 py-2.5 text-xs font-medium transition border-b-2 ${
                            authMode === "login"
                                ? "border-white text-white"
                                : "border-transparent text-zinc-500 hover:text-zinc-300"
                        }`}
                    >
                        Sign in
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setAuthMode("register");
                            setErrorMsg("");
                            setSuccessMsg("");
                        }}
                        className={`flex-1 py-2.5 text-xs font-medium transition border-b-2 ${
                            authMode === "register"
                                ? "border-white text-white"
                                : "border-transparent text-zinc-500 hover:text-zinc-300"
                        }`}
                    >
                        Register
                    </button>
                </div>
            )}

            {errorMsg && (
                <div className="mb-4 p-3 rounded-lg border border-rose-500/30 bg-rose-950/40 text-rose-300 text-xs">
                    {errorMsg}
                </div>
            )}
            {successMsg && (
                <div className="mb-4 p-3 rounded-lg border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 text-xs">
                    {successMsg}
                </div>
            )}

            {authMode === "login" && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Campus email</label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                            <input
                                type="email"
                                placeholder="you@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={inputClass}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={inputClass}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Admin PIN <span className="text-zinc-600">(admin accounts only)</span></label>
                        <div className="relative">
                            <Key className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                            <input
                                type="password"
                                inputMode="numeric"
                                maxLength={8}
                                placeholder="Leave blank for student or staff"
                                value={adminPin}
                                onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, ""))}
                                className={inputClass}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-[#d9efff] transition disabled:opacity-50"
                    >
                        {submitting ? "Signing in…" : "Sign in"}
                    </button>
                </form>
            )}

            {authMode === "register" && (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Full name</label>
                        <div className="relative">
                            <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                            <input
                                type="text"
                                placeholder="Aarav Sharma"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={inputClass}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">College email</label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                            <input
                                type="email"
                                placeholder="you@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={inputClass}
                                required
                            />
                        </div>
                        <p className="text-[11px] text-zinc-600 mt-1">Any valid email works for this MVP.</p>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={inputClass}
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 transition disabled:opacity-50"
                    >
                        {submitting ? "Sending OTP…" : "Send verification OTP"}
                    </button>
                </form>
            )}

            {authMode === "otp" && (
                <form onSubmit={handleOtpVerify} className="space-y-5">
                    <div className="text-center">
                        <Key className="w-6 h-6 text-[#0072FF] mx-auto mb-2" />
                        <h4 className="text-sm font-medium text-white">Email verification</h4>
                        <p className="text-xs text-zinc-500 mt-1">
                            Code sent to <span className="text-zinc-300">{email}</span>
                        </p>
                    </div>
                    <div className="p-3 rounded-lg border border-white/10 bg-black text-xs text-zinc-400 flex gap-2">
                        <Sparkles className="w-4 h-4 text-[#0072FF] shrink-0" />
                        Dev: check backend terminal for the OTP if email is not configured.
                    </div>
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
                                className="w-10 h-12 text-center text-lg font-mono font-semibold rounded-lg border border-white/10 bg-black text-white focus:outline-none focus:border-white/30"
                            />
                        ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span>Valid ~5 mins</span>
                        {canResend ? (
                            <button
                                type="button"
                                onClick={handleResendOTP}
                                className="text-white font-medium hover:underline inline-flex items-center gap-1"
                            >
                                <RefreshCw className="w-3.5 h-3.5" /> Resend
                            </button>
                        ) : (
                            <span className="font-mono text-zinc-600">Resend in {resendTimer}s</span>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 transition disabled:opacity-50"
                    >
                        {submitting ? "Verifying…" : "Verify & continue"}
                    </button>
                </form>
            )}
        </div>
    );
};
