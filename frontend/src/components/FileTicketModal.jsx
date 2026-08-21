import React, { useState } from "react";
import { X, UploadCloud, Shield, MapPin, BrainCircuit, Loader2 } from "lucide-react";
import { complaintService } from "../services/api";

const HOSTEL_BLOCKS = [
    "Block A - Floor 1", "Block A - Floor 2", "Block A - Floor 3", "Block A - Floor 4", "Block A - Floor 5",
    "Block B - Floor 1", "Block B - Floor 2", "Block B - Floor 3", "Block B - Floor 4", "Block B - Floor 5",
    "Block C - Floor 1", "Block C - Floor 2", "Block C - Floor 3", "Block C - Floor 4", "Block C - Floor 5",
    "Block D - Floor 1", "Block D - Floor 2", "Block D - Floor 3", "Block D - Floor 4", "Block D - Floor 5",
    "Block E - Floor 1", "Block E - Floor 2", "Block E - Floor 3", "Block E - Floor 4", "Block E - Floor 5",
    "Block F - Floor 1", "Block F - Floor 2", "Block F - Floor 3", "Block F - Floor 4", "Block F - Floor 5",
    "Mess / Canteen Area", "Library Building", "Sports Complex", "Main Campus Road", "Other"
];

export const FileTicketModal = ({ isOpen, onClose, onSubmit }) => {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("electricity");
    const [hostelBlock, setHostelBlock] = useState("");
    const [description, setDescription] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [aiPreview, setAiPreview] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");

    if (!isOpen) return null;

    const reset = () => {
        setTitle("");
        setCategory("electricity");
        setHostelBlock("");
        setDescription("");
        setIsAnonymous(false);
        setImagePreview(null);
        setImageFile(null);
        setAiPreview(null);
        setErrorMsg("");
    };

    const runAiTriage = async (file, block) => {
        setAnalyzing(true);
        setErrorMsg("");
        try {
            const res = await complaintService.analyzeImage({
                imageFile: file,
                hostelBlock: block || hostelBlock,
                category
            });
            const data = res.data;
            if (!data) return;
            setAiPreview(data);
            if (data.predictedCategory && data.predictedCategory !== "miscellaneous") {
                setCategory(data.predictedCategory);
            }
            if (data.suggestedTitle) setTitle(data.suggestedTitle);
            if (data.suggestedDescription) setDescription(data.suggestedDescription);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || "AI triage failed — you can still fill fields manually");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setAiPreview(null);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
        await runAiTriage(file, hostelBlock);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        if (!imageFile) {
            setErrorMsg("Photo proof is required");
            return;
        }
        setSubmitting(true);
        try {
            await onSubmit({
                title,
                category,
                hostelBlock,
                description,
                isAnonymous,
                imagePreview,
                imageFile
            });
            reset();
            onClose();
        } catch (err) {
            setErrorMsg(err.response?.data?.message || err.message || "Failed to file complaint");
        } finally {
            setSubmitting(false);
        }
    };

    const field =
        "w-full px-4 py-2.5 rounded-lg bg-black border border-white/10 text-zinc-100 text-sm focus:outline-none focus:border-white/30 placeholder:text-zinc-600";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-zinc-950 border border-white/10 rounded-xl w-full max-w-xl overflow-hidden shadow-2xl animate-slide-in">
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-white">File a grievance</h3>
                        <p className="text-xs text-zinc-500">Upload photo → AI fills department, title & description</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-1 text-zinc-500 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                    {errorMsg && (
                        <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-950/40 text-rose-300 text-xs">
                            {errorMsg}
                        </div>
                    )}

                    <div>
                        <label className="block text-[11px] font-mono uppercase text-zinc-500 mb-1.5">
                            Photo proof (AI starts here)
                        </label>
                        {imagePreview ? (
                            <div className="relative h-40 rounded-lg overflow-hidden border border-white/10">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImagePreview(null);
                                        setImageFile(null);
                                        setAiPreview(null);
                                    }}
                                    className="absolute top-2 right-2 p-1.5 rounded bg-black/80 text-white hover:bg-rose-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                {analyzing && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 text-xs text-white">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Analyzing with AI…
                                    </div>
                                )}
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center h-28 border border-dashed border-white/15 hover:border-white/30 rounded-lg cursor-pointer bg-black text-center">
                                <UploadCloud className="w-6 h-6 text-zinc-500 mb-1" />
                                <span className="text-xs text-zinc-400">Upload JPG/PNG — AI auto-triages</span>
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                        )}
                    </div>

                    {aiPreview && (
                        <div className="p-3 rounded-lg border border-[#0072FF]/30 bg-[#0072FF]/5 text-xs space-y-1.5">
                            <div className="flex items-center justify-between text-[#0072FF] font-medium">
                                <span className="inline-flex items-center gap-1">
                                    <BrainCircuit className="w-3.5 h-3.5" /> AI triage applied
                                </span>
                                <span className="font-mono text-[10px] text-zinc-400">
                                    {Math.round((aiPreview.confidenceScore || 0.9) * 100)}% · {aiPreview.suggestedPriority} · {aiPreview.predictedCategory}
                                </span>
                            </div>
                            <p className="text-zinc-400">{aiPreview.aiSummary}</p>
                            {aiPreview.triageNotes && (
                                <p className="text-zinc-500 text-[11px]">Why: {aiPreview.triageNotes}</p>
                            )}
                            {aiPreview.detectedObjects?.length > 0 && (
                                <p className="text-[11px] text-zinc-500 font-mono">
                                    Seen: {aiPreview.detectedObjects.slice(0, 6).join(", ")}
                                </p>
                            )}
                            <p className="text-[10px] text-zinc-600">Review fields below — AI can be wrong; edit before submit.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-mono uppercase text-zinc-500 mb-1.5">
                                Department / category
                            </label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)} className={field} required>
                                <option value="electricity">Electricity</option>
                                <option value="water">Water</option>
                                <option value="food">Food & Mess</option>
                                <option value="miscellaneous">Miscellaneous</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-mono uppercase text-zinc-500 mb-1.5">
                                <span className="inline-flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> Location
                                </span>
                            </label>
                            <select
                                value={hostelBlock}
                                onChange={(e) => setHostelBlock(e.target.value)}
                                className={field}
                                required
                            >
                                <option value="" disabled>
                                    Select block…
                                </option>
                                {HOSTEL_BLOCKS.map((b) => (
                                    <option key={b} value={b}>
                                        {b}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-mono uppercase text-zinc-500 mb-1.5">Title</label>
                        <input
                            type="text"
                            placeholder="AI will suggest after photo upload"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={field}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-mono uppercase text-zinc-500 mb-1.5">Description</label>
                        <textarea
                            rows={3}
                            placeholder="AI will draft from the photo — edit if needed"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={`${field} resize-none`}
                            required
                        />
                    </div>

                    <label className="flex items-start gap-3 p-3 rounded-lg border border-white/10 bg-black cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                            className="mt-0.5"
                        />
                        <span>
                            <span className="text-xs font-medium text-white inline-flex items-center gap-1">
                                <Shield className="w-3.5 h-3.5 text-[#0072FF]" /> File anonymously
                            </span>
                            <span className="block text-[11px] text-zinc-500 mt-0.5">
                                Hidden on public feed; visible to staff/admin.
                            </span>
                        </span>
                    </label>

                    <div className="flex items-center justify-end gap-3 pt-1">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-xs text-zinc-400 hover:text-white">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || analyzing}
                            className="px-5 py-2.5 rounded-lg text-xs font-medium bg-white text-black hover:bg-zinc-200 disabled:opacity-50"
                        >
                            {submitting ? "Submitting…" : "Submit & route"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
