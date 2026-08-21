import React, { useState } from "react";
import { X, UserPlus } from "lucide-react";

export const StaffModal = ({ isOpen, onClose, onSubmit }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [department, setDepartment] = useState("electricity");
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    if (!isOpen) return null;

    const field =
        "w-full px-4 py-2.5 rounded-lg bg-black border border-white/10 text-zinc-100 text-sm focus:outline-none focus:border-white/30";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSubmitting(true);
        try {
            await onSubmit({ name, email, password, department });
            setName("");
            setEmail("");
            setPassword("");
            setDepartment("electricity");
            onClose();
        } catch (err) {
            setErrorMsg(err.response?.data?.message || err.message || "Failed to create staff");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-zinc-950 border border-white/10 rounded-xl w-full max-w-md overflow-hidden animate-slide-in">
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-[#0072FF]" />
                        <div>
                            <h3 className="text-sm font-medium text-white">Provision staff</h3>
                            <p className="text-xs text-zinc-500">Department account for auto-routing</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="p-1 text-zinc-500 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {errorMsg && (
                        <div className="p-3 rounded-lg border border-rose-500/30 text-rose-300 text-xs">{errorMsg}</div>
                    )}
                    <div>
                        <label className="block text-[11px] font-mono uppercase text-zinc-500 mb-1.5">Name</label>
                        <input className={field} value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-[11px] font-mono uppercase text-zinc-500 mb-1.5">Email</label>
                        <input
                            type="email"
                            className={field}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-mono uppercase text-zinc-500 mb-1.5">Password</label>
                        <input
                            type="password"
                            className={field}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-mono uppercase text-zinc-500 mb-1.5">Department</label>
                        <select className={field} value={department} onChange={(e) => setDepartment(e.target.value)}>
                            <option value="electricity">Electricity</option>
                            <option value="water">Water</option>
                            <option value="food">Food</option>
                            <option value="miscellaneous">Miscellaneous</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-xs text-zinc-400 hover:text-white">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2 rounded-lg text-xs font-medium bg-white text-black hover:bg-zinc-200 disabled:opacity-50"
                        >
                            {submitting ? "Creating…" : "Create staff"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
