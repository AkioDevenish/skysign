'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

type SigningMode = 'draw' | 'type' | 'upload';

export default function SignerPage() {
    const params = useParams();
    const token = params.token as string;
    
    const request = useQuery(api.signatureRequests.getByToken, { accessToken: token });
    const markViewed = useMutation(api.signatureRequests.markViewed);
    const submitSignature = useMutation(api.signatureRequests.submitSignature);
    const declineRequest = useMutation(api.signatureRequests.decline);
    const generateUploadUrl = useMutation(api.signatures.generateUploadUrl);

    const [mode, setMode] = useState<SigningMode>('draw');
    const [isDrawing, setIsDrawing] = useState(false);
    const [typedName, setTypedName] = useState('');
    const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [declined, setDeclined] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const lastPosRef = useRef({ x: 0, y: 0 });

    // Mark as viewed when page loads
    useEffect(() => {
        if (request && request.status === 'pending') {
            markViewed({ accessToken: token });
        }
    }, [request, token, markViewed]);

    // Canvas drawing logic
    const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        setIsDrawing(true);
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        lastPosRef.current = {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }, []);

    const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = '#1c1917';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        lastPosRef.current = { x, y };
    }, [isDrawing]);

    const stopDrawing = useCallback(() => {
        setIsDrawing(false);
        if (canvasRef.current) {
            setSignatureDataUrl(canvasRef.current.toDataURL('image/png'));
        }
    }, []);

    const clearCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignatureDataUrl(null);
    }, []);

    // Generate typed signature preview
    const getTypedSignatureDataUrl = useCallback(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 150;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'italic 48px "Dancing Script", cursive, serif';
        ctx.fillStyle = '#1c1917';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);
        
        return canvas.toDataURL('image/png');
    }, [typedName]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            let finalSignatureDataUrl = signatureDataUrl;
            
            if (mode === 'type' && typedName) {
                finalSignatureDataUrl = getTypedSignatureDataUrl();
            }

            if (!finalSignatureDataUrl) {
                throw new Error('Please create a signature first');
            }

            // Upload signature image
            const uploadUrl = await generateUploadUrl();
            const blob = await (await fetch(finalSignatureDataUrl)).blob();
            const uploadResponse = await fetch(uploadUrl, {
                method: 'POST',
                body: blob,
                headers: { 'Content-Type': 'image/png' }
            });
            const { storageId: signatureStorageId } = await uploadResponse.json();

            // For now, we'll use the signature storage ID as the signed document
            // In a full implementation, we'd overlay the signature on the PDF
            await submitSignature({
                accessToken: token,
                signedStorageId: signatureStorageId,
                signatureStorageId,
                signerName: typedName || request?.recipientName,
            });

            setSubmitted(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit signature');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDecline = async () => {
        try {
            await declineRequest({ accessToken: token });
            setDeclined(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to decline request');
        } finally {
            setShowDeclineConfirm(false);
        }
    };

    // Loading state
    if (request === undefined) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-stone-900 border-t-transparent rounded-full" />
            </div>
        );
    }

    // Not found
    if (request === null) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-semibold text-stone-900 mb-2">Request Not Found</h1>
                    <p className="text-stone-600">This signing link is invalid or has been removed.</p>
                </div>
            </div>
        );
    }

    // Expired
    if (request.status === 'expired') {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-semibold text-stone-900 mb-2">Request Expired</h1>
                    <p className="text-stone-600">This signature request has expired. Please contact the sender for a new link.</p>
                </div>
            </div>
        );
    }

    // Already signed
    if (request.status === 'signed' || submitted) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-semibold text-stone-900 mb-2">Signature Complete!</h1>
                    <p className="text-stone-600 mb-6">Thank you for signing &quot;{request.documentName}&quot;</p>
                    <Link 
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors"
                    >
                        Learn about SkySign
                    </Link>
                </motion.div>
            </div>
        );
    }

    // Declined
    if (request.status === 'declined' || declined) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-semibold text-stone-900 mb-2">Request Declined</h1>
                    <p className="text-stone-600">You have declined this signature request.</p>
                </div>
            </div>
        );
    }

    // Main signing interface
    return (
        <div className="min-h-screen bg-gradient-to-b from-stone-100 to-stone-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-lg border-b border-stone-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-stone-900 to-stone-700 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">S</span>
                        </div>
                        <span className="font-semibold text-stone-900">SkySign</span>
                    </div>
                    <div className="text-sm text-stone-500">
                        Secure Document Signing
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Document Info Card */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white rounded-2xl border border-stone-200 p-6 mb-6"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h1 className="text-xl font-semibold text-stone-900 mb-1">{request.documentName}</h1>
                            <p className="text-stone-500 text-sm">
                                You&apos;ve been asked to sign this document
                            </p>
                            {request.message && (
                                <div className="mt-3 p-3 bg-stone-50 rounded-xl text-sm text-stone-600">
                                    &quot;{request.message}&quot;
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Document Preview */}
                    {request.documentUrl && (
                        <div className="mt-4 border border-stone-200 rounded-xl overflow-hidden">
                            <iframe 
                                src={request.documentUrl} 
                                className="w-full h-64 bg-white"
                                title="Document Preview"
                            />
                        </div>
                    )}
                </motion.div>

                {/* Signature Area */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl border border-stone-200 p-6"
                >
                    <h2 className="text-lg font-semibold text-stone-900 mb-4">Your Signature</h2>

                    {/* Mode Tabs */}
                    <div className="flex gap-2 mb-6">
                        {(['draw', 'type'] as SigningMode[]).map((m) => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                                    mode === m
                                        ? 'bg-stone-900 text-white'
                                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                }`}
                            >
                                {m === 'draw' ? (
                                    <span className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        Draw
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" /></svg>
                                        Type
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Draw Mode */}
                    <AnimatePresence mode="wait">
                        {mode === 'draw' && (
                            <motion.div
                                key="draw"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="relative border-2 border-dashed border-stone-300 rounded-xl overflow-hidden bg-white">
                                    <canvas
                                        ref={canvasRef}
                                        width={600}
                                        height={200}
                                        className="w-full touch-none cursor-crosshair"
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                        onTouchStart={startDrawing}
                                        onTouchMove={draw}
                                        onTouchEnd={stopDrawing}
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 h-px bg-stone-300 mx-8" />
                                </div>
                                <button
                                    onClick={clearCanvas}
                                    className="mt-3 text-sm text-stone-500 hover:text-stone-700 transition-colors"
                                >
                                    Clear signature
                                </button>
                            </motion.div>
                        )}

                        {mode === 'type' && (
                            <motion.div
                                key="type"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <input
                                    type="text"
                                    value={typedName}
                                    onChange={(e) => setTypedName(e.target.value)}
                                    placeholder="Type your name..."
                                    className="w-full px-4 py-3 border border-stone-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-stone-900/20"
                                />
                                {typedName && (
                                    <div className="mt-4 p-6 bg-stone-50 rounded-xl border border-stone-200">
                                        <p 
                                            className="text-3xl text-stone-900 text-center"
                                            style={{ fontFamily: '"Dancing Script", cursive, serif', fontStyle: 'italic' }}
                                        >
                                            {typedName}
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || (!signatureDataUrl && mode === 'draw') || (!typedName && mode === 'type')}
                            className="flex-1 py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Submitting...' : 'Sign Document'}
                        </button>
                        <button
                            onClick={() => setShowDeclineConfirm(true)}
                            disabled={isSubmitting}
                            className="px-6 py-3 border border-stone-200 text-stone-600 rounded-xl font-medium hover:bg-stone-50 transition-colors disabled:opacity-50"
                        >
                            Decline
                        </button>
                    </div>
                </motion.div>

                {/* Security Note */}
                <div className="mt-6 text-center text-sm text-stone-500">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Secured with AES-256 encryption
                    </div>
                    Your signature is legally binding
                </div>
            </main>

            {/* Load Dancing Script font for typed signatures */}
            <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap" rel="stylesheet" />

            {/* Decline Confirmation Dialog */}
            <AnimatePresence>
                {showDeclineConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
                    >
                        <div
                            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                            onClick={() => setShowDeclineConfirm(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white rounded-2xl border border-stone-200 shadow-2xl p-6 max-w-sm w-full"
                        >
                            <h3 className="text-lg font-semibold text-stone-900 mb-2">Decline Signature Request</h3>
                            <p className="text-sm text-stone-500 mb-6 leading-relaxed">
                                Are you sure you want to decline this signature request? The sender will be notified.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowDeclineConfirm(false)}
                                    className="px-4 py-2 text-sm font-medium text-stone-600 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDecline}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
                                >
                                    Decline
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
