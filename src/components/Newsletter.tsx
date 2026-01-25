'use client';

import { useState } from "react";
import { motion } from "framer-motion";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Newsletter() {
    const subscribe = useMutation(api.newsletter.subscribe);
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "already_subscribed">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage("");

        try {
            await subscribe({ email });
            setStatus("success");
            setEmail("");
        } catch (error: unknown) {
            console.error("Subscription error:", error);
            // Check for various ways the backend might report a duplicate
            const msg = error instanceof Error ? error.message?.toLowerCase() : String(error).toLowerCase();
            if (msg.includes("already subscribed") || msg.includes("duplicate") || msg.includes("unique constraint")) {
                setStatus("already_subscribed");
            } else {
                setStatus("error");
                setErrorMessage(error instanceof Error ? error.message : 'Something went wrong');
            }
        }
    };

    return (
        <section className="py-32 px-8 lg:px-12 bg-stone-900 text-stone-50 relative overflow-hidden">
            {/* Abstract background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-stone-800 rounded-full blur-[120px] opacity-30 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-stone-800 rounded-full blur-[100px] opacity-30 translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12">
                    <div className="lg:max-w-md">
                        <span className="text-sm font-medium text-stone-400 uppercase tracking-widest mb-4 block">Newsletter</span>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            Stay in the loop
                        </h2>
                        <p className="text-stone-400 text-lg leading-relaxed">
                            Join our newsletter to get the latest updates on AR technology, new features, and tips for creating the perfect digital signature.
                        </p>
                    </div>

                    <div className="lg:w-[400px]">
                        {status === "success" ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-stone-800/50 border border-stone-700 rounded-2xl p-8"
                            >
                                <div className="flex items-center gap-4 text-emerald-400">
                                    <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="font-semibold block">You&apos;re subscribed!</span>
                                        <span className="text-sm text-stone-400">Thanks for joining us.</span>
                                    </div>
                                </div>
                            </motion.div>
                        ) : status === "already_subscribed" ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-stone-800/50 border border-stone-700 rounded-2xl p-8"
                            >
                                <div className="flex items-center gap-4 text-amber-400">
                                    <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="font-semibold block">Already Subscribed!</span>
                                        <span className="text-sm text-stone-400">You&apos;re already on the list.</span>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full px-6 py-4 rounded-xl bg-stone-800 border border-stone-700 text-stone-50 placeholder-stone-500 focus:outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-500 transition-all"
                                />
                                {status === "error" && (
                                    <p className="text-red-400 text-sm px-2">
                                        {errorMessage}
                                    </p>
                                )}
                                <button
                                    type="submit"
                                    disabled={status === "loading"}
                                    className="w-full px-8 py-4 bg-stone-50 text-stone-900 font-medium rounded-xl hover:bg-white transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {status === "loading" ? "Subscribing..." : "Subscribe to Newsletter"}
                                </button>
                                <p className="text-sm text-stone-500 text-center">
                                    No spam, ever. Unsubscribe anytime.
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
