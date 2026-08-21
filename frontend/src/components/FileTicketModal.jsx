import React, { useState } from "react";
import { X, UploadCloud, Shield, Sparkles } from "lucide-react";

export const FileTicketModal = ({ isOpen, onClose, onSubmit }) => {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("electricity");
    const [description, setDescription] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const formData = {
            title,
            category,
            description,
            isAnonymous,
            imagePreview,
            imageFile
        };

        await onSubmit(formData);
        setSubmitting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
                
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-[#002B66] text-white">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold">File a Campus Grievance</h3>
                            <p className="text-xs text-sky-200">Submit issue under 60 seconds for auto-routing</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-sky-200 hover:text-white hover:bg-blue-900 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    
                    {/* Category Dropdown */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Grievance Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#002B66] transition font-medium"
                            required
                        >
                            <option value="electricity">⚡ Electricity & Appliances</option>
                            <option value="water">💧 Water Supply & Plumbing</option>
                            <option value="food">🍲 Hostel Food & Mess Quality</option>
                            <option value="miscellaneous">📌 Miscellaneous / Infrastructure</option>
                        </select>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Title / Short Summary
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Water leakage in Room 304 bathroom"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#002B66] transition placeholder:text-slate-400 font-medium"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Detailed Description
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Provide details (location, urgency, severity)..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#002B66] transition placeholder:text-slate-400 resize-none font-medium"
                            required
                        />
                    </div>

                    {/* Image Drag & Drop Upload */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Photo Proof (Required)
                        </label>
                        
                        {imagePreview ? (
                            <div className="relative h-40 rounded-lg overflow-hidden border border-slate-300 group">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => { setImagePreview(null); setImageFile(null); }}
                                    className="absolute top-2 right-2 p-1.5 rounded bg-slate-900/80 text-white hover:bg-rose-600 transition"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center h-32 px-4 border-2 border-dashed border-slate-300 hover:border-blue-600 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition text-center group">
                                <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-blue-600 transition mb-1" />
                                <span className="text-xs font-bold text-slate-700">
                                    Click or Drag photo here to upload proof
                                </span>
                                <span className="text-[10px] text-slate-500 mt-1">Supports JPG, PNG (Max 5MB)</span>
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                        )}
                    </div>

                    {/* Anonymous Toggle */}
                    <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="anonymousToggle"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                            className="mt-1 w-4 h-4 text-[#002B66] rounded border-slate-300 focus:ring-[#002B66]"
                        />
                        <label htmlFor="anonymousToggle" className="cursor-pointer">
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5 text-blue-700" />
                                File Anonymously
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                                Hides your name from the public community feed, but remains visible to staff/admin for accountability.
                            </p>
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2.5 rounded-lg text-xs font-extrabold bg-[#002B66] hover:bg-[#001D47] text-white transition shadow-md active:scale-95 disabled:opacity-50 uppercase tracking-wider"
                        >
                            {submitting ? "Routing Ticket..." : "Submit & Auto-Route"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};
