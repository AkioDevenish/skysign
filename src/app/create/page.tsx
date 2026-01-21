'use client';

import { useState, useRef } from 'react';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { UserButton } from '@clerk/nextjs';
import SignaturePreview from '@/components/SignaturePreview';
import { signPdf } from '@/utils/pdfUtils';

// Dynamic import for DocumentLayer (SSR false) - MUST be at module scope
const DocumentLayer = dynamic(() => import('@/components/DocumentLayer'), {
    ssr: false,
    loading: () => (
        <div className="absolute inset-0 flex items-center justify-center text-stone-400">
            Loading Viewer...
        </div>
    )
});

// Dynamic import to avoid SSR issues with MediaPipe
const SignatureCapture = dynamic(
    () => import('@/components/SignatureCapture'),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-[500px] flex items-center justify-center rounded-2xl bg-stone-100 border border-stone-200">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-stone-500">Loading signature capture...</p>
                </div>
            </div>
        )
    }
);

export default function CreatePage() {
    const [savedSignature, setSavedSignature] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [documentFile, setDocumentFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [docDims, setDocDims] = useState<{ width: number; height: number } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleSave = async (dataUrl: string) => {
        console.log("Handle Save triggered. Document:", !!documentFile, "Container:", !!containerRef.current);
        if (documentFile && containerRef.current) {
            try {
                setIsSaving(true);
                const { clientWidth, clientHeight, scrollTop } = containerRef.current;

                const signedPdfBytes = await signPdf(
                    documentFile,
                    dataUrl,
                    { width: clientWidth, height: clientHeight },
                    1,
                    -scrollTop
                );

                const blob = new Blob([signedPdfBytes as any], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);

                const confirmDownload = window.confirm('Download signed PDF?');
                if (!confirmDownload) {
                    URL.revokeObjectURL(url);
                    setIsSaving(false);
                    return;
                }

                const a = document.createElement('a');
                a.href = url;
                a.download = `signed_${documentFile.name}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                setIsSaving(false);
            } catch (error) {
                console.error("Error signing PDF:", error);
                setIsSaving(false);
                alert("Failed to sign PDF");
            }
        } else {
            setSavedSignature(dataUrl);
            setShowPreview(true);
        }
    };

    const handleClear = () => {
        setSavedSignature(null);
    };

    const handleRetry = () => {
        setShowPreview(false);
        setSavedSignature(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setDocumentFile(e.target.files[0]);
        }
    };

    return (
        <main className="min-h-screen bg-stone-50">
            {/* Hidden File Input */}
            <input
                type="file"
                accept="application/pdf"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 bg-stone-50/90 backdrop-blur-md z-50 border-b border-stone-200/60">
                <div className="max-w-6xl mx-auto px-8 lg:px-12 py-5 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center">
                            <svg
                                className="w-5 h-5 text-stone-50"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
                                />
                            </svg>
                        </div>
                        <span className="text-xl font-semibold tracking-tight text-stone-900">Sky Sign</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 rounded-full bg-white border border-stone-200 text-stone-700 text-sm font-medium hover:bg-stone-50 hover:border-stone-300 transition-all flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {documentFile ? 'Change PDF' : 'Import PDF'}
                        </button>
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: {
                                        width: '36px',
                                        height: '36px',
                                    },
                                },
                            }}
                        />
                    </div>
                </div>
            </nav>

            {/* Main content */}
            <div className="pt-28 pb-16 px-8 lg:px-12 max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mb-3">
                        {documentFile ? 'Sign Your Document' : 'Create Your Signature'}
                    </h1>
                    <p className="text-stone-500 text-lg">
                        {documentFile
                            ? 'Draw your signature over the document'
                            : 'Point your index finger at the camera and draw in the air'}
                    </p>
                </motion.div>

                {/* Signature capture area */}
                <motion.div
                    ref={containerRef}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8 relative h-[500px] rounded-2xl overflow-hidden bg-white border border-stone-200 shadow-xl"
                    style={{
                        overflowY: documentFile ? 'auto' : 'hidden',
                        overflowX: 'hidden',
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgba(120, 113, 108, 0.3) transparent'
                    }}
                >
                    <div
                        className="relative min-h-full"
                        style={{ height: documentFile && docDims ? docDims.height : '100%' }}
                    >
                        {documentFile && (
                            <div className="absolute inset-0 z-0">
                                <DocumentLayer
                                    file={documentFile}
                                    onLoad={setDocDims}
                                />
                            </div>
                        )}

                        <div className="absolute inset-0 z-10">
                            <SignatureCapture
                                onSave={handleSave}
                                onClear={handleClear}
                                strokeColor="#1c1917"
                                strokeWidth={3}
                                isOverlayMode={!!documentFile}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Instructions */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-3 gap-4"
                >
                    {[
                        { icon: '☝️', label: 'Point', desc: 'Hold index finger up for 1s to draw' },
                        { icon: '👍', label: 'Save', desc: 'Thumbs up for 1s to save' },
                        { icon: '🖐️', label: 'Clear', desc: 'Open palm for 1s to restart' },
                    ].map((item, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl p-6 border border-stone-200/80 text-center shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="text-3xl mb-3">{item.icon}</div>
                            <div className="font-semibold text-stone-900 mb-1">{item.label}</div>
                            <div className="text-stone-500 text-sm leading-snug">
                                {item.desc}
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Document indicator */}
                {documentFile && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 flex items-center justify-center gap-3 text-sm text-stone-500"
                    >
                        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Document loaded: <strong className="text-stone-700">{documentFile.name}</strong></span>
                        <button
                            onClick={() => setDocumentFile(null)}
                            className="text-stone-400 hover:text-stone-600 transition-colors"
                        >
                            Remove
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Signature preview modal */}
            <AnimatePresence>
                {showPreview && (
                    <SignaturePreview
                        signatureDataUrl={savedSignature}
                        onClose={() => setShowPreview(false)}
                        onRetry={handleRetry}
                    />
                )}
            </AnimatePresence>
        </main>
    );
}
