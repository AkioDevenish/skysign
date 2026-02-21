'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { GoogleDrivePicker, DropboxPicker } from './GoogleDriveIntegration';

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
    onPdfUpload?: (file: File) => void;
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
    onPdfUpload,
}: SignatureCreatorProps) {
    const [mode, setMode] = useState<InputMode>('draw');
    const [typedName, setTypedName] = useState('');
    const [selectedFont, setSelectedFont] = useState(signatureFonts[0]);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);

    const [showDrive, setShowDrive] = useState(false);
    const [showDropbox, setShowDropbox] = useState(false);
    const [downloadingCloudFile, setDownloadingCloudFile] = useState(false);

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

    const handleFile = (file: File) => {
        if (file.type === 'application/pdf') {
            if (onPdfUpload) {
                onPdfUpload(file);
            } else {
                alert('PDF upload not handled here.');
            }
        } else if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
            reader.readAsDataURL(file);
        } else {
            alert('Please upload an image or PDF file.');
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    const handleCloudAction = (provider: string) => {
        if (provider === 'drive') setShowDrive(true);
        else if (provider === 'dropbox') setShowDropbox(true);
        else {
            if (fileInputRef.current) fileInputRef.current.click();
        }
    };

    const handleClear = () => {
        if (mode === 'draw') clearDrawCanvas();
        if (mode === 'type') setTypedName('');
        if (mode === 'upload') setUploadedImage(null);
        onClear?.();
    };

    const canSave =
        uploadedImage ||
        (mode === 'draw' && hasDrawnContent) ||
        (mode === 'type' && typedName.trim());

    const handleSave = () => {
        if (uploadedImage) {
            onSave(uploadedImage);
            return;
        }
        if (mode === 'draw') saveDrawnSignature();
        if (mode === 'type') saveTypedSignature();
    };

    const modes: { id: InputMode; label: string; icon: React.ReactNode }[] = [
        { id: 'air', label: 'Air Draw', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" /></svg> },
        { id: 'draw', label: 'Draw', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg> },
        { id: 'type', label: 'Type', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> },
    ];

    return (
        <div className="flex flex-col h-full gap-6">
            {/* Card 1: Signature Creator */}
            <div className="flex-1 flex flex-col bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden min-h-0">
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
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/20 cursor-pointer hover:shadow-blue-500/30'
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
                    <div className="grid grid-cols-3 gap-1 p-1.5 bg-stone-100/80 rounded-2xl">
                        {modes.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setMode(m.id)}
                                className={`relative flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-2.5 md:py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${mode === m.id
                                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-blue-100'
                                    : 'text-stone-400 hover:text-stone-600'
                                    }`}
                            >
                                <span className={mode === m.id ? 'text-blue-600' : ''}>{m.icon}</span>
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
                                    className="relative flex-1 min-h-[200px] bg-gradient-to-b from-stone-50 to-white rounded-2xl border border-stone-200 overflow-hidden shadow-inner"
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
                                    className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-stone-900 text-base transition-all"
                                    autoFocus
                                />

                                {/* Font Selection */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {signatureFonts.map((font) => (
                                        <button
                                            key={font.name}
                                            onClick={() => setSelectedFont(font)}
                                            className={`py-3 px-3 rounded-2xl border-2 transition-all text-center cursor-pointer ${selectedFont.name === font.name
                                                ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20'
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
            </div>

            {/* Card 2: Persistent Upload Section */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 md:p-8">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                />

                {uploadedImage ? (
                     <div className="w-full flex-1 min-h-[160px] bg-gradient-to-b from-stone-50 to-white rounded-2xl border border-stone-200 flex items-center justify-center relative group overflow-hidden">
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
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Left: Direct Upload */}
                        <div className="flex-1 flex flex-col">
                            <h3 className="font-semibold text-stone-700 mb-3 text-sm">File Uploader</h3>
                            <div 
                                className="bg-stone-50/50 rounded-2xl border-2 border-dashed border-stone-200 hover:border-blue-400 transition-colors flex flex-col items-center justify-center p-6 cursor-pointer group min-h-[160px]"
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                            >
                                <p className="font-medium text-stone-700 mb-3 group-hover:text-blue-600">Drop files here</p>
                                <p className="text-stone-400 text-sm mb-4">Or</p>
                                <button
                                    className="px-6 py-2.5 rounded-full border border-blue-400 text-blue-500 font-semibold hover:bg-blue-50 transition-colors pointer-events-none"
                                >
                                    Upload File
                                </button>
                            </div>
                        </div>

                        {/* Right: Cloud Import */}
                        <div className="flex-1 flex flex-col">
                            <h3 className="font-semibold text-stone-700 mb-3 text-sm">Import files from:</h3>
                            <div className="grid grid-cols-2 gap-3 flex-1">
                                {/* Google Drive */}
                                <button onClick={() => handleCloudAction('drive')} className="flex flex-col items-center justify-center p-3 bg-white border border-stone-200 rounded-xl hover:shadow-md hover:border-blue-200 transition-all gap-2 group cursor-pointer h-full max-h-[75px]" type="button">
                                    <img src="https://www.vectorlogo.zone/logos/google_drive/google_drive-icon.svg" alt="Google Drive" className="w-6 h-6 object-contain" />
                                    <span className="text-xs font-medium text-stone-600 group-hover:text-stone-800">Google Drive</span>
                                </button>
                                
                                {/* OneDrive */}
                                <button onClick={() => handleCloudAction('onedrive')} className="flex flex-col items-center justify-center p-3 bg-white border border-stone-200 rounded-xl hover:shadow-md hover:border-blue-200 transition-all gap-2 group cursor-pointer h-full max-h-[75px]" type="button">
                                    <img src="https://www.vectorlogo.zone/logos/microsoft_onedrive/microsoft_onedrive-icon.svg" alt="OneDrive" className="w-6 h-6 object-contain" />
                                    <span className="text-xs font-medium text-stone-600 group-hover:text-stone-800">One Drive</span>
                                </button>

                                {/* Dropbox */}
                                <button onClick={() => handleCloudAction('dropbox')} className="flex flex-col items-center justify-center p-3 bg-white border border-stone-200 rounded-xl hover:shadow-md hover:border-blue-200 transition-all gap-2 group cursor-pointer h-full max-h-[75px]" type="button">
                                    <img src="https://www.vectorlogo.zone/logos/dropbox/dropbox-tile.svg" alt="Dropbox" className="w-6 h-6 object-contain" />
                                    <span className="text-xs font-medium text-stone-600 group-hover:text-stone-800">Dropbox</span>
                                </button>

                                {/* Box */}
                                <button onClick={() => handleCloudAction('box')} className="flex flex-col items-center justify-center p-3 bg-white border border-stone-200 rounded-xl hover:shadow-md hover:border-blue-200 transition-all gap-2 group cursor-pointer h-full max-h-[75px]" type="button">
                                    <img src="https://www.vectorlogo.zone/logos/box/box-icon.svg" alt="Box" className="w-6 h-6 object-contain" />
                                    <span className="text-xs font-medium text-stone-600 group-hover:text-stone-800">Box</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Google Fonts */}
            <link
                href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Great+Vibes&family=Caveat:wght@600&family=Allura&display=swap"
                rel="stylesheet"
            />

            {showDrive && (
                <GoogleDrivePicker
                    onClose={() => setShowDrive(false)}
                    onFileSelect={async (f) => {
                        setShowDrive(false);
                        try {
                            const res = await fetch(`/api/google/drive/download/${f.id}`);
                            if (!res.ok) throw new Error('Download failed');
                            const blob = await res.blob();
                            const file = new File([blob], f.name, { type: 'application/pdf' });
                            handleFile(file);
                        } catch (err) {
                            alert('Failed to load file from Google Drive.');
                        }
                    }}
                />
            )}

            {showDropbox && (
                <DropboxPicker
                    onClose={() => setShowDropbox(false)}
                    onFileSelect={async (f) => {
                        setShowDropbox(false);
                        // Mock downloading a file for Dropbox
                        const blob = new Blob(['Mock PDF content for DropBox'], { type: 'application/pdf' });
                        const file = new File([blob], f.name, { type: 'application/pdf' });
                        handleFile(file);
                    }}
                />
            )}
        </div>
    );
}
