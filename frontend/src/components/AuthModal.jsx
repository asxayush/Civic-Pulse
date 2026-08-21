import React from "react";
import { X } from "lucide-react";
import { AuthForm } from "./AuthForm";

/** Optional modal wrapper — primary auth is /login */
export const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-zinc-950 border border-white/10 rounded-xl w-full max-w-md overflow-hidden animate-slide-in">
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-white">Sign in</h3>
                    <button type="button" onClick={onClose} className="p-1 text-zinc-500 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">
                    <AuthForm
                        onLoginSuccess={(user) => {
                            onLoginSuccess(user);
                            onClose();
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
