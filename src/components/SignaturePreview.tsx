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

    // Process image when loaded
    useEffect(() => {
        if (!signatureDataUrl || !canvasRef.current) return;

        const img = new Image();
        img.onload = () => {
            const canvas = canvasRef.current!;
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0);

            // Create trimmed version
            const trimmed = createTrimmedCanvas(canvas, 30);
            if (trimmed) {
                setProcessedDataUrl(trimmed.toDataURL('image/png'));
            } else {
                setProcessedDataUrl(signatureDataUrl);
            }
        };
        img.src = signatureDataUrl;
    }, [signatureDataUrl]);

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
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.9)',
                backdropFilter: 'blur(20px)',
                padding: '20px',
            }}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                style={{
                    width: '100%',
                    maxWidth: '700px',
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    overflow: 'hidden',
                }}
            >
                {/* Header */}
                <div
                    style={{
                        padding: '24px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '600' }}>
                        ✨ Your Signature
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#666',
                            fontSize: '24px',
                            cursor: 'pointer',
                            padding: '4px',
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Signature preview */}
                <div
                    style={{
                        padding: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: selectedColor === '#ffffff' ? '#1a1a1a' : '#ffffff',
                        margin: '20px',
                        borderRadius: '16px',
                        minHeight: '200px',
                    }}
                >
                    {processedDataUrl ? (
                        <img
                            src={processedDataUrl}
                            alt="Your signature"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '180px',
                                objectFit: 'contain',
                                filter: selectedStyle === 'bold'
                                    ? 'contrast(1.5)'
                                    : selectedStyle === 'elegant'
                                        ? 'blur(0.5px) contrast(1.2)'
                                        : 'none',
                            }}
                        />
                    ) : (
                        <div style={{ color: '#666' }}>Processing...</div>
                    )}
                </div>

                {/* Hidden canvas for processing */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {/* Style options */}
                <div style={{ padding: '0 24px 20px' }}>
                    <p style={{ color: '#888', fontSize: '12px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Background
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {colors.map((color) => (
                            <button
                                key={color.value}
                                onClick={() => setSelectedColor(color.value)}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    background: color.value,
                                    border: selectedColor === color.value
                                        ? '3px solid #00f5ff'
                                        : '2px solid rgba(255, 255, 255, 0.2)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                                title={color.name}
                            />
                        ))}
                    </div>
                </div>

                {/* Style presets */}
                <div style={{ padding: '0 24px 20px' }}>
                    <p style={{ color: '#888', fontSize: '12px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Style
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {(['normal', 'bold', 'elegant'] as const).map((style) => (
                            <button
                                key={style}
                                onClick={() => setSelectedStyle(style)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    background: selectedStyle === style
                                        ? 'rgba(0, 245, 255, 0.2)'
                                        : 'rgba(255, 255, 255, 0.05)',
                                    border: selectedStyle === style
                                        ? '1px solid #00f5ff'
                                        : '1px solid rgba(255, 255, 255, 0.1)',
                                    color: selectedStyle === style ? '#00f5ff' : '#888',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    textTransform: 'capitalize',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {style}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div
                    style={{
                        padding: '24px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        gap: '12px',
                        justifyContent: 'flex-end',
                    }}
                >
                    <button
                        onClick={onRetry}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            background: 'transparent',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        ↺ Retry
                    </button>
                    <button
                        onClick={() => handleDownload('png')}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '12px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #00f5ff 0%, #00a8ff 100%)',
                            color: '#000',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        ⬇ Download PNG
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
