import React from "react";

export const Logo = ({ className = "h-10", variant = "dark", showTagline = true }) => {
    const isDark = variant === "dark";
    const uid = React.useId().replace(/:/g, "");

    return (
        <div className={`inline-flex items-center gap-3 ${className}`}>
            <svg
                viewBox="0 0 120 120"
                className="h-full w-auto max-h-12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                <path
                    d="M38 18C22.5 18 10 29.2 10 43c0 6.2 2.6 11.9 7 16.3-1.5 5.5-4.8 9.9-8.5 12.8 5.8.5 11.7-.8 16.5-3.6 4.1 2.2 8.7 3.5 13 3.5 15.5 0 28-11.2 28-25S53.5 18 38 18z"
                    fill={`url(#speech_${uid})`}
                />
                <circle cx="28" cy="43" r="3.5" fill="white" />
                <circle cx="38" cy="43" r="3.5" fill="white" />
                <circle cx="48" cy="43" r="3.5" fill="white" />
                <path
                    d="M62 48c0 7.7-6.3 14-14 14-3 0-5.8-1-8-2.6 3.8-3.4 6.2-8.3 6.2-13.8 0-4.2-1.4-8.1-3.8-11.2C44.7 32.8 48 31 52 31c5.5 0 10 4.5 10 10v7z"
                    fill={isDark ? "#e4e4e7" : "#1E293B"}
                />
                <path
                    d="M48 68c-15.5 0-28 12.5-28 28v6h56v-6c0-15.5-12.5-28-28-28z"
                    fill={`url(#body_${uid})`}
                />
                <defs>
                    <linearGradient id={`speech_${uid}`} x1="10" y1="18" x2="66" y2="72" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#00C6FF" />
                        <stop offset="1" stopColor="#0072FF" />
                    </linearGradient>
                    <linearGradient id={`body_${uid}`} x1="20" y1="68" x2="76" y2="102" gradientUnits="userSpaceOnUse">
                        <stop stopColor={isDark ? "#18181b" : "#0F172A"} />
                        <stop offset="1" stopColor="#0072FF" />
                    </linearGradient>
                </defs>
            </svg>

            <div className={`h-9 w-px ${isDark ? "bg-white/15" : "bg-slate-300"}`} />

            <div className="flex flex-col text-left leading-none">
                <div className="flex items-center">
                    <span className={`text-xl sm:text-2xl font-semibold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                        Civic
                    </span>
                    <span className="text-xl sm:text-2xl font-semibold tracking-tight text-[#0072FF] ml-1">
                        Pulse
                    </span>
                    <svg
                        className="w-8 h-5 text-[#0072FF] ml-0.5 stroke-[2.5]"
                        viewBox="0 0 50 30"
                        fill="none"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            d="M 2 15 L 12 15 L 17 5 L 23 25 L 29 10 L 33 18 L 37 15 L 48 15"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <circle cx="46" cy="15" r="2.5" fill="#0072FF" />
                    </svg>
                </div>
                {showTagline && (
                    <div className={`text-[9px] font-medium tracking-[0.2em] uppercase mt-1 ${isDark ? "text-zinc-500" : "text-slate-600"}`}>
                        Your voice <span className="text-[#0072FF]">•</span> our action
                    </div>
                )}
            </div>
        </div>
    );
};
