'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useHandTracking } from '@/hooks/useHandTracking';

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
    const [mode, setMode] = useState<InputMode>('air');
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
        <div className="p-6 relative">
            {/* Gesture Indicators Overlay for non-air modes */}
            {mode !== 'air' && (
                <div className="absolute top-8 right-8 flex gap-3 pointer-events-none z-20">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-stone-200 shadow-sm"
                    >
                        <span className="text-xl">👍</span>
                        <span className="text-[10px] font-bold text-stone-900 uppercase tracking-wider">Save</span>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-stone-200 shadow-sm"
                    >
                        <span className="text-xl">✋</span>
                        <span className="text-[10px] font-bold text-stone-900 uppercase tracking-wider">Clear</span>
                    </motion.div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-stone-900">Create Your Signature</h2>
                    <p className="text-sm text-stone-500">Choose how you&apos;d like to create your signature</p>
                </div>
            </div>

            {/* Mode Tabs */}
            <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl mb-6">
                {modes.map((m) => (
                    <button
                        key={m.id}
                        onClick={() => setMode(m.id)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${mode === m.id
                            ? 'bg-white text-stone-900 shadow-sm'
                            : 'text-stone-500 hover:text-stone-700'
                            }`}
                    >
                        {m.icon}
                        <span className="text-xs md:text-sm">{m.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                {/* DRAW MODE */}
                {mode === 'draw' && (
                    <motion.div
                        key="draw"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div
                            ref={containerRef}
                            className="relative h-[200px] md:h-[250px] bg-stone-50 rounded-xl border border-stone-200 overflow-hidden"
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
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <p className="text-stone-300 text-lg">Draw your signature here</p>
                                </div>
                            )}
                            {/* Signature line */}
                            <div className="absolute bottom-12 left-8 right-8 border-b border-stone-300" />
                            <div className="absolute bottom-6 left-8 text-xs text-stone-400">Sign above the line</div>
                        </div>
                    </motion.div>
                )}

                {/* TYPE MODE */}
                {mode === 'type' && (
                    <motion.div
                        key="type"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                    >
                        <input
                            type="text"
                            value={typedName}
                            onChange={(e) => setTypedName(e.target.value)}
                            placeholder="Enter your full name"
                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400 text-stone-900"
                            autoFocus
                        />

                        {/* Font Selection */}
                        <div className="grid grid-cols-4 gap-2">
                            {signatureFonts.map((font) => (
                                <button
                                    key={font.name}
                                    onClick={() => setSelectedFont(font)}
                                    className={`py-3 px-3 rounded-xl border-2 transition-all text-center cursor-pointer ${selectedFont.name === font.name
                                        ? 'border-stone-900 bg-stone-900 text-white'
                                        : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                                        }`}
                                >
                                    <span className="text-lg block" style={{ fontFamily: font.family }}>Aa</span>
                                    <span className="text-xs opacity-70 block mt-1">{font.name}</span>
                                </button>
                            ))}
                        </div>

                        {/* Preview */}
                        <div
                            className="h-[120px] flex items-center justify-center bg-stone-50 rounded-xl border border-stone-200"
                            style={{ fontFamily: selectedFont.family }}
                        >
                            <span className="text-4xl text-stone-900">
                                {typedName || 'Your Signature'}
                            </span>
                        </div>
                    </motion.div>
                )}

                {/* UPLOAD MODE */}
                {mode === 'upload' && (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        {uploadedImage ? (
                            <div className="h-[250px] bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-center relative group overflow-hidden">
                                <Image
                                    src={uploadedImage}
                                    alt="Uploaded"
                                    fill
                                    className="object-contain p-4"
                                    unoptimized
                                />
                                <button
                                    onClick={() => setUploadedImage(null)}
                                    className="absolute top-3 right-3 w-8 h-8 bg-stone-900 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-lg hover:bg-stone-800 cursor-pointer"
                                >
                                    ×
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-[250px] bg-stone-50 rounded-xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center gap-3 text-stone-400 hover:border-stone-400 hover:text-stone-500 hover:bg-stone-100 transition-all cursor-pointer"
                            >
                                <div className="w-14 h-14 rounded-full bg-stone-200 flex items-center justify-center">
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="text-center">
                                    <p className="font-medium text-stone-600">Click to upload</p>
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
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-[300px] md:h-[500px] min-h-[300px] rounded-xl overflow-hidden border border-stone-200"
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



            {/* Google Fonts */}
            <link
                href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Great+Vibes&family=Caveat:wght@600&family=Allura&display=swap"
                rel="stylesheet"
            />

            {/* Gesture Listener for non-air modes */}
            {mode !== 'air' && (
                <GestureListener
                    onGesture={(gesture) => {
                        if (gesture === 'save') handleSave();
                        if (gesture === 'clear') handleClear();
                    }}
                />
            )}
        </div>
    );
}

function GestureListener({ onGesture }: { onGesture: (g: 'save' | 'clear') => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    useHandTracking(videoRef, {
        onGesture,
    });

    return (
        <video
            ref={videoRef}
            className="fixed top-0 left-0 w-1 h-1 opacity-0 pointer-events-none"
            autoPlay
            playsInline
            muted
        />
    );
}
