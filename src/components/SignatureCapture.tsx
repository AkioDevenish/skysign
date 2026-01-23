'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useHandTracking } from '@/hooks/useHandTracking';
import { useSignatureCanvas } from '@/hooks/useSignatureCanvas';
import { motion, AnimatePresence } from 'framer-motion';

interface SignatureCaptureProps {
    onSave?: (dataUrl: string) => void;
    onClear?: () => void;
    onScroll?: (dy: number) => void;
    strokeColor?: string;
    strokeWidth?: number;
    isOverlayMode?: boolean;
}

export default function SignatureCapture({
    onSave,
    onClear,
    onScroll,
    strokeColor = '#00f5ff',
    strokeWidth = 4,
    isOverlayMode = false,
}: SignatureCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastGrabYRef = useRef<number | null>(null);

    const [dimensions, setDimensions] = useState({ width: 1280, height: 720 });
    const [showInstructions, setShowInstructions] = useState(true);

    // Signature canvas hook
    const {
        hasContent,
        addPoint,
        clear,
        exportAsDataURL,
    } = useSignatureCanvas(canvasRef, {
        strokeColor,
        strokeWidth,
        smoothing: 0.4,
    });

    const handleSave = useCallback(() => {
        const dataUrl = exportAsDataURL('png');
        if (dataUrl && onSave) {
            onSave(dataUrl);
        }
    }, [exportAsDataURL, onSave]);

    const handleClear = useCallback(() => {
        clear();
        if (onClear) {
            onClear();
        }
    }, [clear, onClear]);

    // Hand tracking hook
    const {
        isLoading,
        isTracking,
        error,
        fingerPosition,
        handPosition,
        gesture,
        loadingStatus,
    } = useHandTracking(videoRef, {
        onPositionUpdate: (x, y, isDrawing) => {
            // Drawing logic
            addPoint(x, y, isDrawing);
            // We can't access `gesture` state reliably in the callback loop if it's running high frequency.

            // Actually, we can use a ref for `gesture` in THIS component if we sync it?
            // Wait, `useHandTracking` returns `fingerPosition` and `gesture`.
            // We can use a `useEffect` on `fingerPosition` change?
            // If `gesture === 'grabbing'`, calculate delta.
        },
        onGesture: (g) => {
            if (g === 'save' && hasContent) {
                handleSave();
            } else if (g === 'clear') {
                handleClear();
            }
        },
    });

    // Handle Scrolling via Effect (easier than callback injection)
    // Removed scrolling logic as per user request

    // Update canvas dimensions on resize
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: rect.width,
                    height: rect.height,
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Hide instructions after first tracking
    useEffect(() => {
        if (isTracking && showInstructions) {
            const timer = setTimeout(() => setShowInstructions(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isTracking, showInstructions]);

    // Gesture indicator styles
    const gestureColors: Record<string, string> = {
        drawing: '#00f5ff',
        idle: '#666666',
        save: '#00ff88',
        clear: '#ff6b6b',
        grabbing: '#ffaa00', // Orange for fist/stop
    };

    return (
        <div
            ref={containerRef}
            className="signature-capture"
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                minHeight: '500px',
                borderRadius: '20px',
                overflow: 'hidden',
                background: 'transparent',
                border: 'none',
            }}
        >
            {/* Video feed (hidden but active for tracking) */}
            <video
                ref={videoRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)',
                    opacity: 0, // completely hidden
                    pointerEvents: 'none',
                }}
                autoPlay
                playsInline
                muted
            />

            {/* Signature canvas overlay */}
            <canvas
                ref={canvasRef}
                width={dimensions.width}
                height={dimensions.height}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    transform: 'scaleX(-1)',
                }}
            />

            {/* Finger tracking cursor */}
            <AnimatePresence>
                {isTracking && fingerPosition && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        style={{
                            position: 'absolute',
                            left: `${(1 - fingerPosition.x) * 100}%`,
                            top: `${fingerPosition.y * 100}%`,
                            transform: 'translate(-50%, -50%)',
                            pointerEvents: 'none',
                            zIndex: 50,
                        }}
                    >
                        {/* Cursor ring */}
                        <div
                            style={{
                                width: gesture === 'drawing' ? '32px' : '24px',
                                height: gesture === 'drawing' ? '32px' : '24px',
                                borderRadius: '50%',
                                border: `2px solid ${gesture === 'drawing' ? '#1c1917' : '#a8a29e'}`,
                                backgroundColor: gesture === 'drawing' ? '#1c1917' : 'transparent',
                                transition: 'all 0.2s ease',
                                opacity: 0.5,
                            }}
                        />
                        {/* Center dot */}
                        <div
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#1c1917',
                                transition: 'all 0.2s ease',
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading overlay */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-50"
                    >
                        <div className="w-10 h-10 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin" />
                        <p className="mt-4 text-stone-600 font-medium text-sm">
                            {loadingStatus}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error overlay */}
            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-50 p-8 text-center">
                    <div className="text-4xl mb-4">📷</div>
                    <h3 className="text-stone-900 font-semibold mb-2">Camera Access Required</h3>
                    <p className="text-stone-500 max-w-sm">{error}</p>
                </div>
            )}

            {/* Instructions overlay */}
            <AnimatePresence>
                {showInstructions && !isLoading && !error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm z-40 p-6 text-center"
                    >
                        <h3 className="text-stone-900 text-xl font-bold mb-6">
                            ✋ Show your hand to begin
                        </h3>
                        <div className="flex gap-8 text-stone-600 text-sm">
                            <div>
                                <div className="text-2xl mb-2">☝️</div>
                                <p className="font-medium">Point to draw</p>
                            </div>
                            <div>
                                <div className="text-2xl mb-2">✊</div>
                                <p className="font-medium">Stop</p>
                            </div>
                            <div>
                                <div className="text-2xl mb-2">👍</div>
                                <p className="font-medium">Save</p>
                            </div>
                            <div>
                                <div className="text-2xl mb-2">🖐️</div>
                                <p className="font-medium">Clear</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Gesture indicator */}
            {!isLoading && !error && gesture && gesture !== 'idle' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-stone-900 text-white text-sm font-medium shadow-lg z-30"
                >
                    {gesture === 'drawing' && '✍️ Drawing'}
                    {gesture === 'save' && '💾 Saving...'}
                    {gesture === 'clear' && '🗑️ Clearing...'}
                </motion.div>
            )}

            {/* Control buttons */}
            <div className="absolute top-6 right-6 flex gap-3 z-30">
                <button
                    onClick={handleClear}
                    disabled={!hasContent}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${hasContent
                        ? 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 shadow-sm'
                        : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                        }`}
                >
                    Clear
                </button>
                <button
                    onClick={handleSave}
                    disabled={!hasContent}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${hasContent
                        ? 'bg-stone-900 text-white hover:bg-stone-800 shadow-md'
                        : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        }`}
                >
                    Save Signature
                </button>
            </div>

            <style jsx>{`
        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top-color: #00f5ff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
        </div>
    );
}
