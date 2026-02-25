'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

// 3 unique realistic signature paths on rotation
const signatures = [
    // 1 — "J. Mitchell" — tall J with flowing cursive
    "M25 78 C 25 78, 28 72, 30 62 C 32 52, 35 30, 38 22 C 41 14, 43 18, 42 28 C 41 38, 36 55, 33 65 C 30 75, 28 82, 32 82 C 36 82, 45 60, 50 55 M 58 82 C 58 82, 56 78, 58 75 C 60 72, 62 75, 60 78 M 72 58 C 72 58, 74 42, 80 38 C 86 34, 88 45, 85 52 C 82 59, 76 62, 80 60 C 84 58, 92 48, 98 46 C 104 44, 102 52, 100 56 C 98 60, 96 62, 100 60 C 104 58, 108 50, 112 48 C 116 46, 117 52, 115 56 C 113 60, 112 62, 116 60 C 120 58, 126 46, 130 42 C 134 38, 136 38, 135 44 C 134 50, 130 60, 128 66 C 126 72, 126 74, 130 70 C 134 66, 140 55, 148 50 C 156 45, 158 48, 155 54 C 152 60, 145 68, 148 68 C 151 68, 158 56, 165 50 C 172 44, 178 42, 175 50 C 172 58, 164 72, 168 70 C 172 68, 180 52, 188 48 C 196 44, 200 50, 195 58 C 190 66, 182 74, 186 72 C 190 70, 198 58, 208 52 C 218 46, 224 48, 222 55 C 220 62, 216 72, 218 72 C 220 72, 232 58, 240 50 C 248 42, 260 38, 270 45",
    // 2 — "Sarah K." — loopy feminine signature with big S
    "M20 55 C 20 55, 22 35, 30 25 C 38 15, 48 18, 45 30 C 42 42, 28 55, 25 60 C 22 65, 25 68, 35 62 C 45 56, 55 42, 62 38 C 69 34, 72 40, 68 48 C 64 56, 55 65, 60 62 C 65 59, 75 45, 82 42 C 89 39, 88 48, 85 54 C 82 60, 78 65, 82 62 C 86 59, 95 45, 100 42 C 105 39, 108 42, 105 50 C 102 58, 95 68, 100 65 C 105 62, 112 50, 118 45 M 130 65 C 130 65, 128 58, 132 55 C 136 52, 140 58, 135 62 M 148 42 C 148 42, 145 55, 155 48 C 165 41, 158 62, 168 55 C 178 48, 175 38, 182 42 C 189 46, 192 55, 200 50 C 208 45, 215 38, 225 42 C 235 46, 240 55, 250 48 C 260 41, 268 38, 275 42",
    // 3 — "M. Torres" — elegant M with trailing flourish
    "M12 72 C 12 72, 15 30, 20 22 C 25 14, 30 22, 32 40 C 34 58, 35 72, 38 40 C 41 8, 46 18, 48 40 C 50 62, 48 78, 55 72 C 62 66, 68 50, 72 48 M 82 72 C 82 72, 78 65, 82 62 C 86 59, 90 65, 85 70 M 100 50 C 100 50, 98 30, 108 28 C 118 26, 120 42, 115 50 C 110 58, 100 62, 108 60 C 116 58, 128 42, 135 38 C 142 34, 145 42, 140 52 C 135 62, 128 70, 135 68 C 142 66, 152 48, 158 42 C 164 36, 168 40, 165 50 C 162 60, 155 70, 162 68 C 169 66, 178 50, 185 45 C 192 40, 196 44, 192 54 C 188 64, 180 74, 188 70 C 196 66, 208 48, 218 42 C 228 36, 238 40, 235 52 C 232 64, 222 75, 232 72 C 242 69, 258 50, 268 45 C 278 40, 285 48, 280 55",
];

// Animated SVG signature path
function SignaturePath() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % signatures.length);
        }, 2000); // Cycle immediately after draw finishes
        return () => clearInterval(interval);
    }, []);

    const sigPath = signatures[index];
    const pathRef = useRef<SVGPathElement>(null);
    const [pathLen, setPathLen] = useState(1000);

    useEffect(() => {
        if (pathRef.current) {
            setPathLen(pathRef.current.getTotalLength());
        }
    }, [sigPath]);

    // Unique animation name per signature to force restart
    const animName = `drawSig${index}`;

    return (
        <>
            <style>{`
                @keyframes ${animName} {
                    0% { stroke-dashoffset: ${pathLen}; }
                    100% { stroke-dashoffset: 0; }
                }
            `}</style>
            <svg key={index} viewBox="0 0 300 100" fill="none" className="w-full h-full">
                {/* Hidden path to measure length */}
                <path ref={pathRef} d={sigPath} fill="none" stroke="none" />

                {/* Faint ghost trail */}
                <path
                    d={sigPath}
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />

                {/* Animated drawing stroke — white line */}
                <path
                    d={sigPath}
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    style={{
                        strokeDasharray: pathLen,
                        strokeDashoffset: pathLen,
                        animation: `${animName} 2s ease-in-out forwards`,
                    }}
                />

                {/* Blue glowing dot at the drawing tip */}
                <path
                    d={sigPath}
                    stroke="#3b82f6"
                    strokeWidth="10"
                    strokeLinecap="round"
                    fill="none"
                    style={{
                        filter: "blur(3px)",
                        strokeDasharray: `8 ${pathLen - 8}`,
                        strokeDashoffset: pathLen,
                        animation: `${animName} 2s ease-in-out forwards`,
                    }}
                />

                {/* Solid blue dot core at drawing tip */}
                <path
                    d={sigPath}
                    stroke="#93c5fd"
                    strokeWidth="5"
                    strokeLinecap="round"
                    fill="none"
                    style={{
                        strokeDasharray: `4 ${pathLen - 4}`,
                        strokeDashoffset: pathLen,
                        animation: `${animName} 2s ease-in-out forwards`,
                    }}
                />
            </svg>
        </>
    );
}


// Floating hand icon
function HandIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
        </svg>
    );
}

const steps = [
    {
        number: "01",
        title: "Open your camera",
        description: "Hit 'Create' and allow camera access. No app download, no printer, no pen.",
    },
    {
        number: "02",
        title: "Point & draw in the air",
        description: "Raise your index finger in view of the webcam and write your signature as if signing a piece of glass.",
    },
    {
        number: "03",
        title: "Save & export",
        description: "SkySign captures your gesture as a clean PNG or PDF-ready signature. One click to download.",
    },
];

export default function FeaturesSection() {
    return (
        <section id="how-it-works" className="py-32 px-8 lg:px-12 relative z-10 bg-white border-t border-stone-100">
            <div className="max-w-6xl mx-auto">

                {/* Header in same style as other sections */}
                <div className="mb-20">
                    <span className="text-sm font-medium text-stone-400 uppercase tracking-widest mb-4 block">Air-Signing 101</span>
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <h2 className="text-4xl md:text-5xl font-bold text-stone-900 tracking-tight max-w-md">
                            Sign in 3 simple steps.
                        </h2>
                        <p className="text-stone-500 max-w-xs text-base leading-relaxed">
                            No pens, no scanners, no apps. Just your camera and your hand.
                        </p>
                    </div>
                </div>

                {/* Signature animation card — full width */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="bg-stone-900 rounded-3xl overflow-hidden relative min-h-[340px] flex flex-col justify-between p-10"
                >
                    {/* Camera viewfinder corner lines */}
                    <div className="absolute top-5 left-5 w-8 h-8 border-t-2 border-l-2 border-stone-600 rounded-tl-lg" />
                    <div className="absolute top-5 right-5 w-8 h-8 border-t-2 border-r-2 border-stone-600 rounded-tr-lg" />
                    <div className="absolute bottom-5 left-5 w-8 h-8 border-b-2 border-l-2 border-stone-600 rounded-bl-lg" />
                    <div className="absolute bottom-5 right-5 w-8 h-8 border-b-2 border-r-2 border-stone-600 rounded-br-lg" />

                    {/* REC indicator */}
                    <div className="flex items-center gap-2 self-start">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-xs font-mono text-stone-400 tracking-widest">REC</span>
                    </div>

                    {/* Animated signature in the middle */}
                    <div className="flex-1 flex items-center justify-center py-6 px-4">
                        <div className="w-full max-w-md opacity-90">
                            <SignaturePath />
                        </div>
                    </div>

                    {/* Floating hand label */}
                    <div className="flex items-center gap-3 self-end">
                        <HandIcon className="w-5 h-5 text-blue-400" />
                        <span className="text-sm text-stone-400">Drawing in progress…</span>
                    </div>
                </motion.div>

                {/* Horizontal steps timeline */}
                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-0 relative">
                    {/* Connecting line behind the step numbers */}
                    <div className="hidden md:block absolute top-5 left-[16.67%] right-[16.67%] h-px bg-stone-200" />

                    {steps.map((step, i) => (
                        <motion.div
                            key={step.number}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.12 }}
                            className="flex flex-col items-center text-center px-6"
                        >
                            {/* Step number circle */}
                            <div className="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center text-sm font-bold mb-5 relative z-10">
                                {step.number}
                            </div>
                            <h3 className="text-base font-bold text-stone-900 mb-2">{step.title}</h3>
                            <p className="text-sm text-stone-500 leading-relaxed max-w-[240px]">{step.description}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Old way vs SkySign comparison */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    {/* Old way */}
                    <div className="bg-stone-50 rounded-2xl border border-stone-200 p-7">
                        <span className="text-xs font-mono text-stone-400 tracking-widest uppercase mb-4 block">The old way</span>
                        <div className="space-y-3">
                            {["Print, sign, and scan every document", "Pay $30+/mo for basic features", "Complex setup and onboarding"].map((item) => (
                                <div key={item} className="flex items-center gap-3">
                                    <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    <span className="text-sm text-stone-400 line-through">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* SkySign way */}
                    <div className="bg-stone-900 rounded-2xl p-7">
                        <span className="text-xs font-mono text-blue-400 tracking-widest uppercase mb-4 block">The SkySign way</span>
                        <div className="space-y-3">
                            {["Point, draw in the air, done", "Free tier with affordable upgrades", "Open your camera and start signing"].map((item) => (
                                <div key={item} className="flex items-center gap-3">
                                    <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    <span className="text-sm text-stone-300">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
