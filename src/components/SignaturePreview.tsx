'use client';

import { motion } from 'framer-motion';
import { downloadSignature, createTrimmedCanvas } from '@/lib/signatureUtils';
import { useRef, useEffect, useState } from 'react';

interface SignaturePreviewProps {
    signatureDataUrl: string | null;
    onClose: () => void;
    onRetry: () => void;
}

export default function SignaturePreview({
    signatureDataUrl,
    onClose,
    onRetry,
}: SignaturePreviewProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [processedDataUrl, setProcessedDataUrl] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState('#ffffff');
    const [selectedStyle, setSelectedStyle] = useState<'normal' | 'bold' | 'elegant'>('normal');

    const colors = [
        { name: 'White', value: '#ffffff' },
        { name: 'Blue', value: '#0066ff' },
        { name: 'Black', value: '#000000' },
        { name: 'Gold', value: '#ffd700' },
        { name: 'Cyan', value: '#00f5ff' },
    ];

    // Process image when loaded or color/data changes
    useEffect(() => {
        if (!signatureDataUrl || !canvasRef.current) return;

        const img = new Image();
        img.onload = () => {
            const canvas = canvasRef.current!;
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0);

            // Get image data to recolor
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Parse selected color
            let r = 0, g = 0, b = 0;
            if (selectedColor.startsWith('#')) {
                const hex = selectedColor.substring(1);
                r = parseInt(hex.substring(0, 2), 16);
                g = parseInt(hex.substring(2, 4), 16);
                b = parseInt(hex.substring(4, 6), 16);
            }

            // Recolor non-transparent pixels
            for (let i = 0; i < data.length; i += 4) {
                // If alpha > 0, recolor
                if (data[i + 3] > 0) {
                    data[i] = r;     // Red
                    data[i + 1] = g; // Green
                    data[i + 2] = b; // Blue
                    // Keep alpha as is
                }
            }

            // Put image data back
            ctx.putImageData(imageData, 0, 0);

            // Create trimmed version
            const trimmed = createTrimmedCanvas(canvas, 30);
            if (trimmed) {
                setProcessedDataUrl(trimmed.toDataURL('image/png'));
            } else {
                setProcessedDataUrl(canvas.toDataURL('image/png'));
            }
        };
        img.src = signatureDataUrl;
    }, [signatureDataUrl, selectedColor]);

    const handleDownload = (format: 'png' | 'svg') => {
        if (!processedDataUrl) return;

        const timestamp = new Date().toISOString().slice(0, 10);
        downloadSignature(processedDataUrl, `skysign-signature-${timestamp}.${format}`);
    };

    if (!signatureDataUrl) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/20 backdrop-blur-sm p-4"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                className="w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl shadow-stone-900/10 border border-white/50 overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">✨</span>
                        <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                            Your Signature
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Signature preview */}
                <div className="p-8">
                    <div
                        className="relative flex items-center justify-center rounded-2xl min-h-[240px] border border-stone-200 transition-colors duration-300"
                        style={{
                            background: selectedColor === '#ffffff' ? '#1c1917' : '#ffffff', // Invert bg for white signature
                            backgroundImage: selectedColor === '#ffffff'
                                ? 'radial-gradient(circle at 1px 1px, #292524 1px, transparent 0)'
                                : 'radial-gradient(circle at 1px 1px, #e7e5e4 1px, transparent 0)',
                            backgroundSize: '20px 20px'
                        }}
                    >
                        {processedDataUrl ? (
                            <img
                                src={processedDataUrl}
                                alt="Your signature"
                                className="max-w-full max-h-[180px] object-contain transition-all duration-300"
                                style={{
                                    filter: selectedStyle === 'bold'
                                        ? 'contrast(1.5) drop-shadow(0 0 1px rgba(0,0,0,0.1))'
                                        : selectedStyle === 'elegant'
                                            ? 'blur(0.5px) contrast(1.2)'
                                            : 'none',
                                }}
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-3 text-stone-400">
                                <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-900 rounded-full animate-spin" />
                                <span className="text-sm font-medium">Processing signature...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Hidden canvas for processing */}
                <canvas ref={canvasRef} className="hidden" />

                <div className="px-8 pb-8 space-y-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Background Options */}
                        <div className="flex-1">
                            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
                                Color
                            </p>
                            <div className="flex gap-3">
                                {colors.map((color) => (
                                    <button
                                        key={color.value}
                                        onClick={() => setSelectedColor(color.value)}
                                        className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${selectedColor === color.value
                                            ? 'border-stone-900 scale-110 shadow-lg'
                                            : 'border-stone-200 hover:border-stone-300 hover:scale-105'
                                            }`}
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Style Options */}
                        <div className="flex-1">
                            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
                                Style
                            </p>
                            <div className="flex gap-2">
                                {(['normal', 'bold', 'elegant'] as const).map((style) => (
                                    <button
                                        key={style}
                                        onClick={() => setSelectedStyle(style)}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${selectedStyle === style
                                            ? 'bg-stone-900 border-stone-900 text-white shadow-lg shadow-stone-900/10'
                                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300'
                                            }`}
                                    >
                                        {style.charAt(0).toUpperCase() + style.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-8 border-t border-stone-100">
                        <button
                            onClick={onRetry}
                            className="px-6 py-3 rounded-full border border-stone-200 text-stone-600 font-medium hover:bg-stone-50 hover:text-stone-900 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Try Again
                        </button>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleDownload('png')}
                                className="px-8 py-3 rounded-full bg-stone-900 text-white font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20 flex items-center gap-2 hover:-translate-y-0.5"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download PNG
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
