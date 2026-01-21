'use client';

import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentLayerProps {
    file: File;
    onLoad?: (dims: { width: number; height: number }) => void;
}

export default function DocumentLayer({ file, onLoad }: DocumentLayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const [numPages, setNumPages] = useState<number>(0);

    // Initial width and resize listener
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.clientWidth);
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    function onPageLoadSuccess(page: any) {
        if (onLoad && containerWidth) {
            const ratio = page.height / page.width;
            onLoad({
                width: containerWidth,
                height: containerWidth * ratio
            });
        }
    }

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                // Remove fixed height - let the PDF page determine height
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                // Remove overflow:hidden - scrolling is handled by parent transform
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 0 // Behind signature
            }}
        >
            <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                    <div style={{ color: '#888' }}>Loading PDF...</div>
                }
                error={
                    <div style={{ color: '#ff6b6b' }}>Failed to load PDF.</div>
                }
            >
                {/* Render first page only for MVP */}
                <Page
                    pageNumber={1}
                    width={containerWidth ? containerWidth : undefined}
                    height={containerWidth ? undefined : 500} // Fallback
                    onLoadSuccess={onPageLoadSuccess}
                    renderTextLayer={false} // Performance optimization for signing
                    renderAnnotationLayer={false}
                />
            </Document>
        </div>
    );
}
