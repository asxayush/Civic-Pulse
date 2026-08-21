import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2, Mic, Radio, ShieldAlert, Square } from "lucide-react";
import { voiceComplaintService } from "../services/api";
import { Logo } from "./Logo";

export const VoiceComplaintPage = () => {
    const [block, setBlock] = useState("");
    const [room, setRoom] = useState("");
    const [recording, setRecording] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [error, setError] = useState("");
    const [complete, setComplete] = useState(false);
    const recorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);

    useEffect(() => () => {
        clearInterval(timerRef.current);
        recorderRef.current?.stream?.getTracks().forEach((track) => track.stop());
    }, []);

    const stopRecording = () => {
        if (recorderRef.current?.state === "recording") recorderRef.current.stop();
        clearInterval(timerRef.current);
        setRecording(false);
    };

    const submitAudio = async (blob) => {
        setProcessing(true);
        setError("");
        try {
            await voiceComplaintService.submit(blob, block, room, elapsed);
            setComplete(true);
        } catch (err) {
            setError(err.response?.data?.message || "We could not forward the recording. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    const startRecording = async () => {
        if (!block.trim() || !room.trim()) {
            setError("Add your hostel block and room number before recording.");
            return;
        }
        if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
            setError("Voice recording is not supported by this browser.");
            return;
        }

        try {
            setError("");
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
            const recorder = new MediaRecorder(stream, { mimeType });
            chunksRef.current = [];
            recorder.ondataavailable = (event) => {
                if (event.data.size) chunksRef.current.push(event.data);
            };
            recorder.onstop = () => {
                stream.getTracks().forEach((track) => track.stop());
                const blob = new Blob(chunksRef.current, { type: mimeType });
                if (blob.size > 5 * 1024 * 1024) {
                    setError("This recording is larger than 5MB. Please record a shorter complaint.");
                    return;
                }
                submitAudio(blob);
            };
            recorderRef.current = recorder;
            recorder.start();
            setElapsed(0);
            setRecording(true);
            timerRef.current = setInterval(() => {
                setElapsed((current) => {
                    if (current >= 59) {
                        stopRecording();
                        return 60;
                    }
                    return current + 1;
                });
            }, 1000);
        } catch {
            setError("Microphone permission was not granted.");
        }
    };

    const reset = () => {
        setComplete(false);
        setElapsed(0);
        setError("");
    };

    return (
        <div className="min-h-screen bg-[#05070a] text-zinc-100 flex flex-col">
            <header className="h-16 border-b border-white/10 px-4 sm:px-8 flex items-center justify-between">
                <Link to="/"><Logo className="h-8" variant="dark" showTagline={false} /></Link>
                <Link to="/" className="text-sm text-zinc-400 hover:text-white inline-flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Back</Link>
            </header>
            <main className="flex-1 flex items-center justify-center px-4 py-10 sm:px-8">
                <div className="w-full max-w-2xl">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-rose-300 border border-rose-400/20 bg-rose-400/10 rounded-full px-3 py-1.5 mb-5"><Radio className="w-3.5 h-3.5" /> Emergency channel</div>
                        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white">Speak up. We will route it.</h1>
                        <p className="text-sm text-zinc-400 mt-3 max-w-md mx-auto">Record up to 60 seconds. Your audio is forwarded to the campus admin team for human review.</p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-[#0b0f14] p-5 sm:p-8 shadow-2xl shadow-black/30">
                        {complete ? (
                            <div className="py-12 text-center">
                                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                                <h2 className="text-xl font-semibold text-white">Complaint forwarded</h2>
                                <p className="text-sm text-zinc-400 mt-2">Your recording has been recorded and sent to the admin team.</p>
                                <button type="button" onClick={reset} className="mt-7 px-5 py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-[#d9efff]">Record another</button>
                            </div>
                        ) : (
                            <>
                                <div className="grid sm:grid-cols-2 gap-3 mb-8">
                                    <label className="text-xs text-zinc-400">Hostel block
                                        <input value={block} onChange={(event) => setBlock(event.target.value)} placeholder="Block B" className="mt-2 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#39a0ff]/60" disabled={recording || processing} />
                                    </label>
                                    <label className="text-xs text-zinc-400">Room number
                                        <input value={room} onChange={(event) => setRoom(event.target.value)} placeholder="B-204" className="mt-2 w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#39a0ff]/60" disabled={recording || processing} />
                                    </label>
                                </div>
                                <div className="flex flex-col items-center py-4">
                                    <div className={`relative flex items-center justify-center w-44 h-44 rounded-full border ${recording ? "border-rose-400/60 bg-rose-400/10" : "border-[#39a0ff]/30 bg-[#39a0ff]/5"}`}>
                                        {recording && <span className="absolute inset-3 rounded-full border border-rose-400/30 animate-ping" />}
                                        <button type="button" onClick={recording ? stopRecording : startRecording} disabled={processing} aria-label={recording ? "Stop recording" : "Start recording"} className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center transition ${recording ? "bg-rose-500 text-white hover:bg-rose-400" : "bg-white text-black hover:bg-[#d9efff]"}`}>
                                            {recording ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-9 h-9" />}
                                        </button>
                                    </div>
                                    <div className="mt-5 font-mono text-2xl tabular-nums text-white">00:{String(elapsed).padStart(2, "0")} <span className="text-sm text-zinc-600">/ 01:00</span></div>
                                    <p className="text-xs text-zinc-500 mt-2">{processing ? "Processing your complaint…" : recording ? "Tap stop when you are finished" : "Tap the microphone to start"}</p>
                                </div>
                                {processing && <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[#8acbff]"><Loader2 className="w-4 h-4 animate-spin" /> Forwarding securely</div>}
                                {error && <div className="mt-6 p-3 rounded-xl border border-rose-500/30 bg-rose-950/40 text-sm text-rose-300 flex gap-2"><ShieldAlert className="w-4 h-4 shrink-0" /> {error}</div>}
                                <p className="mt-8 text-[11px] text-zinc-600 text-center">Please use this channel for urgent campus issues. Immediate danger still requires local emergency help.</p>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};
