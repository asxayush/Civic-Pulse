import React from "react";
import { Link } from "react-router-dom";
import { Logo } from "./Logo";

const pages = {
    privacy: {
        title: "Privacy Policy",
        updated: "August 21, 2026",
        sections: [
            {
                h: "What we collect",
                p: "Account details (name, email), grievance tickets (text, photos, location), upvotes, and optional private wellness chat messages you send to the companion."
            },
            {
                h: "How we use data",
                p: "To route and resolve campus complaints, verify repairs, prevent abuse, and (for wellness) generate supportive responses. Photo proofs may be processed by AI vision for triage."
            },
            {
                h: "Anonymity",
                p: "Anonymous filing hides your name on the public community feed only. Staff and admins still see identity for accountability and resolution."
            },
            {
                h: "Wellness chats",
                p: "Wellness messages are private to your account. They are not a clinical record. Do not share passwords or highly sensitive personal data in chat."
            },
            {
                h: "Retention",
                p: "Ticket and chat data are retained for campus operations and audit. Contact administrators to request account deletion where policy allows."
            }
        ]
    },
    disclaimer: {
        title: "Disclaimer",
        updated: "August 21, 2026",
        sections: [
            {
                h: "Not emergency services",
                p: "Civic Pulse is a campus grievance and wellness support tool. It is not a substitute for emergency services, police, fire, medical care, or campus security."
            },
            {
                h: "AI limitations",
                p: "AI triage and wellness replies can be incomplete or incorrect. Always review auto-filled fields before submitting. Staff should verify on-site."
            },
            {
                h: "Wellness companion",
                p: "The stress companion is not therapy, diagnosis, or crisis intervention. If you are in danger or having thoughts of self-harm, contact helplines / emergency services immediately."
            },
            {
                h: "Demo / MVP",
                p: "This build may run without production email or cloud storage. Dev OTP codes may appear in the UI or server logs when SMTP is not configured."
            }
        ]
    },
    terms: {
        title: "Terms of Use",
        updated: "August 21, 2026",
        sections: [
            {
                h: "Acceptable use",
                p: "File genuine campus grievances with honest photo proof. Do not harass others, spam the system, or upload illegal content."
            },
            {
                h: "Accounts",
                p: "You are responsible for credentials. Repeated confirmed invalid complaints may lead to strikes and account bans."
            },
            {
                h: "Resolution handshake",
                p: "Tickets marked resolved by staff require student OTP verification (or rejection) before final closure."
            },
            {
                h: "Changes",
                p: "Features may change during hackathon / MVP iterations. Continued use means you accept the current policies linked in the footer."
            }
        ]
    }
};

export const LegalPage = ({ type = "privacy" }) => {
    const page = pages[type] || pages.privacy;

    return (
        <div className="min-h-screen bg-black text-zinc-100">
            <header className="border-b border-white/10 px-4 sm:px-6 h-14 flex items-center justify-between">
                <Link to="/">
                    <Logo className="h-8" variant="dark" showTagline={false} />
                </Link>
                <Link to="/" className="text-sm text-zinc-400 hover:text-white">
                    Home
                </Link>
            </header>
            <main className="max-w-2xl mx-auto px-4 py-12 sm:py-16 animate-fade-up">
                <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-2">
                    Updated {page.updated}
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-white mb-8">{page.title}</h1>
                <div className="space-y-8">
                    {page.sections.map((s) => (
                        <section key={s.h} className="border-t border-white/10 pt-5">
                            <h2 className="text-sm font-medium text-white mb-2">{s.h}</h2>
                            <p className="text-sm text-zinc-400 leading-relaxed">{s.p}</p>
                        </section>
                    ))}
                </div>
            </main>
            <SiteFooter />
        </div>
    );
};

export const SiteFooter = () => (
    <footer className="border-t border-white/10 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row gap-4 justify-between text-xs text-zinc-500">
            <p>© {new Date().getFullYear()} Civic Pulse · Campus grievance MVP</p>
            <nav className="flex flex-wrap gap-4">
                <Link to="/privacy" className="hover:text-white transition">
                    Privacy
                </Link>
                <Link to="/disclaimer" className="hover:text-white transition">
                    Disclaimer
                </Link>
                <Link to="/terms" className="hover:text-white transition">
                    Terms
                </Link>
                <Link to="/login" className="hover:text-white transition">
                    Sign in
                </Link>
            </nav>
        </div>
    </footer>
);
