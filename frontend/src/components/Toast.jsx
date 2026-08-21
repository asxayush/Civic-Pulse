import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

export const Toast = ({ toast, onClose }) => {
    if (!toast) return null;

    const icons = {
        success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
        error: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
        info: <Info className="w-5 h-5 text-blue-400 shrink-0" />
    };

    const borderColors = {
        success: "border-emerald-500/30 bg-emerald-950/80 text-emerald-100",
        warning: "border-amber-500/30 bg-amber-950/80 text-amber-100",
        error: "border-rose-500/30 bg-rose-950/80 text-rose-100",
        info: "border-blue-500/30 bg-blue-950/80 text-blue-100"
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl ${borderColors[toast.type || "info"]}`}>
                {icons[toast.type || "info"]}
                <span className="text-sm font-medium pr-2">{toast.message}</span>
                <button
                    onClick={onClose}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
