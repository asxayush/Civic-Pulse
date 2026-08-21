import React from "react";

export const Logo = ({ className = "h-10" }) => {
    return (
        <div className={`inline-flex items-center gap-3 ${className}`}>
            {/* Student Silhouette + Speech Bubble Graphic */}
            <svg viewBox="0 0 120 120" className="h-full w-auto max-h-12 drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Speech Bubble */}
                <path
                    d="M38 18C22.5 18 10 29.2 10 43c0 6.2 2.6 11.9 7 16.3-1.5 5.5-4.8 9.9-8.5 12.8 5.8.5 11.7-.8 16.5-3.6 4.1 2.2 8.7 3.5 13 3.5 15.5 0 28-11.2 28-25S53.5 18 38 18z"
                    fill="url(#speech_grad)"
                />
                {/* Speech Dots */}
                <circle cx="28" cy="43" r="3.5" fill="white" />
                <circle cx="38" cy="43" r="3.5" fill="white" />
                <circle cx="48" cy="43" r="3.5" fill="white" />

                {/* Head & Student Silhouette */}
                <path
                    d="M62 48c0 7.7-6.3 14-14 14-3 0-5.8-1-8-2.6 3.8-3.4 6.2-8.3 6.2-13.8 0-4.2-1.4-8.1-3.8-11.2C44.7 32.8 48 31 52 31c5.5 0 10 4.5 10 10v7z"
                    fill="#1E293B"
                />
                <path
                    d="M48 68c-15.5 0-28 12.5-28 28v6h56v-6c0-15.5-12.5-28-28-28z"
                    fill="url(#body_grad)"
                />

                <defs>
                    <linearGradient id="speech_grad" x1="10" y1="18" x2="66" y2="72" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#00C6FF" />
                        <stop offset="1" stopColor="#0072FF" />
                    </linearGradient>
                    <linearGradient id="body_grad" x1="20" y1="68" x2="76" y2="102" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#0F172A" />
                        <stop offset="1" stopColor="#1E40AF" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Vertical Divider */}
            <div className="h-10 w-[2px] bg-slate-300 rounded-full"></div>

            {/* Typography Section */}
            <div className="flex flex-col text-left leading-none">
                <div className="flex items-center">
                    <span className="text-2xl font-black tracking-tight text-slate-900 font-sans">
                        Civic
                    </span>
                    <span className="text-2xl font-black tracking-tight text-blue-600 font-sans ml-1">
                        Pulse
                    </span>
                    
                    {/* Heartbeat Pulse Line Icon */}
                    <svg className="w-9 h-6 text-blue-600 ml-0.5 stroke-[3]" viewBox="0 0 50 30" fill="none" stroke="currentColor">
                        <path d="M 2 15 L 12 15 L 17 5 L 23 25 L 29 10 L 33 18 L 37 15 L 48 15" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="46" cy="15" r="2.5" fill="#2563EB" />
                    </svg>
                </div>
                
                <div className="text-[9.5px] font-extrabold tracking-[0.22em] text-slate-700 uppercase mt-1">
                    YOUR VOICE <span className="text-blue-600 font-bold">•</span> OUR ACTION
                </div>
            </div>
        </div>
    );
};
