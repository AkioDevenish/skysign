'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

const SignatureCapture = dynamic(() => import('./SignatureCapture'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
        </div>
    ),
});

type InputMode = 'draw' | 'type' | 'upload' | 'air';

interface SignatureCreatorProps {
    onSave: (dataUrl: string) => void;
    onClear?: () => void;
    strokeColor?: string;
    strokeWidth?: number;
    isOverlayMode?: boolean;
}

const signatureFonts = [
    { name: 'Elegant', family: "'Dancing Script', cursive" },
    { name: 'Classic', family: "'Great Vibes', cursive" },
    { name: 'Modern', family: "'Caveat', cursive" },
    { name: 'Script', family: "'Allura', cursive" },
];

export default function SignatureCreator({
    onSave,
    onClear,
    strokeColor = '#1c1917',
    strokeWidth = 3,
}: SignatureCreatorProps) {
    const [mode, setMode] = useState<InputMode>('draw');
    const [typedName, setTypedName] = useState('');
    const [selectedFont, setSelectedFont] = useState(signatureFonts[0]);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);

    const drawCanvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawnContent, setHasDrawnContent] = useState(false);
    const lastPointRef = useRef<{ x: number; y: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (mode === 'draw' && drawCanvasRef.current) {
            const canvas = drawCanvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = strokeWidth;
            }
        }
    }, [mode, strokeColor, strokeWidth]);

    const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = drawCanvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        return {
            x: (clientX - rect.left) * (canvas.width / rect.width),
            y: (clientY - rect.top) * (canvas.height / rect.height),
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const point = getCanvasPoint(e);
        if (point) {
            setIsDrawing(true);
            lastPointRef.current = point;
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !drawCanvasRef.current) return;
        e.preventDefault();
        const point = getCanvasPoint(e);
        if (!point || !lastPointRef.current) return;

        const ctx = drawCanvasRef.current.getContext('2d');
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
            lastPointRef.current = point;
            setHasDrawnContent(true);
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        lastPointRef.current = null;
    };

    const clearDrawCanvas = () => {
        if (drawCanvasRef.current) {
            const ctx = drawCanvasRef.current.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, drawCanvasRef.current.width, drawCanvasRef.current.height);
                setHasDrawnContent(false);
            }
        }
    };

    const saveDrawnSignature = () => {
        if (drawCanvasRef.current && hasDrawnContent) {
            onSave(drawCanvasRef.current.toDataURL('image/png'));
        }
    };

    const saveTypedSignature = () => {
        if (!typedName.trim()) return;
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 180;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.font = `72px ${selectedFont.family}`;
            ctx.fillStyle = strokeColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);
            onSave(canvas.toDataURL('image/png'));
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleClear = () => {
        if (mode === 'draw') clearDrawCanvas();
        if (mode === 'type') setTypedName('');
        if (mode === 'upload') setUploadedImage(null);
        onClear?.();
    };

    const canSave =
        (mode === 'draw' && hasDrawnContent) ||
        (mode === 'type' && typedName.trim()) ||
        (mode === 'upload' && uploadedImage);

    const handleSave = () => {
        if (mode === 'draw') saveDrawnSignature();
        if (mode === 'type') saveTypedSignature();
        if (mode === 'upload' && uploadedImage) onSave(uploadedImage);
    };

    const modes: { id: InputMode; label: string; icon: React.ReactNode }[] = [
        { id: 'air', label: 'Air Draw', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" /></svg> },
        { id: 'draw', label: 'Draw', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg> },
        { id: 'type', label: 'Type', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> },
        { id: 'upload', label: 'Upload', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg> },
    ];

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-5 md:px-8 pt-5 md:pt-6 pb-4">
                <div>
                    <h2 className="text-lg md:text-xl font-bold text-stone-900 tracking-tight">Create Your Signature</h2>
                    <p className="text-xs md:text-sm text-stone-400 mt-0.5">Choose a method below to get started</p>
                </div>
                {/* Action buttons - icon-first, clean design */}
                {mode !== 'air' && (
                    <div className="flex gap-2">
                        <button
                            onClick={handleClear}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 text-stone-500 text-xs font-semibold hover:bg-stone-200 hover:text-stone-700 transition-all cursor-pointer"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="hidden sm:inline uppercase tracking-wide">Clear</span>
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!canSave}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${canSave
                                ? 'bg-stone-900 text-white hover:bg-stone-800 shadow-md shadow-stone-900/20 cursor-pointer hover:shadow-lg'
                                : 'bg-stone-100 text-stone-300 cursor-not-allowed'}`}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="uppercase tracking-wide">Save</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Mode Tabs */}
            <div className="px-5 md:px-8 mb-5 md:mb-6">
                <div className="grid grid-cols-4 gap-1 p-1.5 bg-stone-100/80 rounded-2xl">
                    {modes.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => setMode(m.id)}
                            className={`relative flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-2.5 md:py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${mode === m.id
                                ? 'bg-white text-stone-900 shadow-sm ring-1 ring-stone-200/50'
                                : 'text-stone-400 hover:text-stone-600'
                                }`}
                        >
                            <span className={mode === m.id ? 'text-stone-700' : ''}>{m.icon}</span>
                            <span className="text-[10px] md:text-sm leading-tight">{m.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col px-5 md:px-8 pb-5 md:pb-8 min-h-0 overflow-hidden">
                <AnimatePresence mode="wait">
                {/* flex wrapper for stretching */}
                    {/* DRAW MODE */}
                    {mode === 'draw' && (
                        <motion.div
                            key="draw"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1 flex flex-col min-h-0"
                        >
                            <div
                                ref={containerRef}
                                className="relative flex-1 min-h-[200px] bg-gradient-to-b from-stone-50 to-white rounded-2xl border border-stone-200 overflow-hidden"
                            >
                                <canvas
                                    ref={drawCanvasRef}
                                    width={1600}
                                    height={500}
                                    className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    onTouchStart={startDrawing}
                                    onTouchMove={draw}
                                    onTouchEnd={stopDrawing}
                                />
                                {!hasDrawnContent && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-2">
                                        <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </div>
                                        <p className="text-stone-300 text-sm font-medium">Draw your signature here</p>
                                    </div>
                                )}
                                {/* Signature line */}
                                <div className="absolute bottom-14 left-8 right-8 border-b border-dashed border-stone-200" />
                                <div className="absolute bottom-7 left-8 flex items-center gap-1.5 text-xs text-stone-300">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    Sign above the line
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* TYPE MODE */}
                    {mode === 'type' && (
                        <motion.div
                            key="type"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1 flex flex-col gap-4 min-h-0"
                        >
                            <input
                                type="text"
                                value={typedName}
                                onChange={(e) => setTypedName(e.target.value)}
                                placeholder="Enter your full name"
                                className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 text-stone-900 text-base transition-all"
                                autoFocus
                            />

                            {/* Font Selection */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {signatureFonts.map((font) => (
                                    <button
                                        key={font.name}
                                        onClick={() => setSelectedFont(font)}
                                        className={`py-3 px-3 rounded-2xl border-2 transition-all text-center cursor-pointer ${selectedFont.name === font.name
                                            ? 'border-stone-900 bg-stone-900 text-white shadow-lg shadow-stone-900/15'
                                            : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:shadow-sm'
                                            }`}
                                    >
                                        <span className="text-lg block" style={{ fontFamily: font.family }}>Aa</span>
                                        <span className="text-[10px] md:text-xs opacity-70 block mt-1">{font.name}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Preview */}
                            <div
                                className="flex-1 min-h-[80px] flex items-center justify-center bg-gradient-to-b from-stone-50 to-white rounded-2xl border border-stone-200 px-6"
                                style={{ fontFamily: selectedFont.family }}
                            >
                                <span className="text-3xl md:text-5xl text-stone-900 truncate max-w-full">
                                    {typedName || 'Your Signature'}
                                </span>
                            </div>
                        </motion.div>
                    )}

                    {/* UPLOAD MODE */}
                    {mode === 'upload' && (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1 flex flex-col min-h-0"
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            {uploadedImage ? (
                                <div className="flex-1 min-h-[200px] bg-gradient-to-b from-stone-50 to-white rounded-2xl border border-stone-200 flex items-center justify-center relative group overflow-hidden">
                                    <Image
                                        src={uploadedImage}
                                        alt="Uploaded"
                                        fill
                                        className="object-contain p-6"
                                        unoptimized
                                    />
                                    <button
                                        onClick={() => setUploadedImage(null)}
                                        className="absolute top-3 right-3 w-8 h-8 bg-stone-900/80 backdrop-blur-sm text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-stone-900 cursor-pointer"
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full flex-1 min-h-[200px] bg-gradient-to-b from-stone-50 to-white rounded-2xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center gap-4 text-stone-400 hover:border-stone-400 hover:text-stone-500 transition-all cursor-pointer group"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center group-hover:bg-stone-200 transition-colors">
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-semibold text-stone-600 mb-1">Click to upload</p>
                                        <p className="text-sm text-stone-400">PNG, JPG, or SVG</p>
                                    </div>
                                </button>
                            )}
                        </motion.div>
                    )}

                    {/* AIR DRAW MODE */}
                    {mode === 'air' && (
                        <motion.div
                            key="air"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1 min-h-[200px] rounded-2xl overflow-hidden border border-stone-200"
                        >
                            <SignatureCapture
                                onSave={onSave}
                                onClear={onClear}
                                strokeColor={strokeColor}
                                strokeWidth={strokeWidth}
                                isOverlayMode={false}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Google Fonts */}
            <link
                href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Great+Vibes&family=Caveat:wght@600&family=Allura&display=swap"
                rel="stylesheet"
            />
        </div>
    );
}
