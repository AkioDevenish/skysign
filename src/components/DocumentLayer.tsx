'use client';

import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentLayerProps {
    file: File;
    onLoad?: (dims: { width: number; height: number }) => void;
    onPageChange?: (page: number, total: number) => void;
    initialPage?: number;
}

export default function DocumentLayer({
    file,
    onLoad,
    onPageChange,
    initialPage = 1
}: DocumentLayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(initialPage);

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

    // Notify parent of page changes
    useEffect(() => {
        if (onPageChange && numPages > 0) {
            onPageChange(currentPage, numPages);
        }
    }, [currentPage, numPages, onPageChange]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    function onPageLoadSuccess(page: { height: number; width: number }) {
        if (onLoad && containerWidth) {
            const ratio = page.height / page.width;
            onLoad({
                width: containerWidth,
                height: containerWidth * ratio
            });
        }
    }

    const goToPage = (page: number) => {
        if (page >= 1 && page <= numPages) {
            setCurrentPage(page);
        }
    };

    const prevPage = () => goToPage(currentPage - 1);
    const nextPage = () => goToPage(currentPage + 1);

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                position: 'relative',
                zIndex: 0
            }}
        >
            {/* PDF Content */}
            <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                    <div className="flex items-center justify-center h-64 text-stone-400">
                        <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin mr-3" />
                        Loading PDF...
                    </div>
                }
                error={
                    <div className="text-red-500 p-4">Failed to load PDF.</div>
                }
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentPage}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Page
                            pageNumber={currentPage}
                            width={containerWidth ? containerWidth : undefined}
                            height={containerWidth ? undefined : 500}
                            onLoadSuccess={onPageLoadSuccess}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                        />
                    </motion.div>
                </AnimatePresence>
            </Document>

            {/* Page Navigation Controls */}
            {numPages > 1 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-white rounded-full shadow-lg border border-stone-200 px-2 py-1.5"
                >
                    <button
                        onClick={prevPage}
                        disabled={currentPage <= 1}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${currentPage <= 1
                            ? 'text-stone-300 cursor-not-allowed'
                            : 'text-stone-600 hover:bg-stone-100'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div className="flex items-center gap-1.5 px-2">
                        <input
                            type="number"
                            value={currentPage}
                            onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                            min={1}
                            max={numPages}
                            className="w-10 text-center text-sm font-medium text-stone-900 border border-stone-200 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-stone-900"
                        />
                        <span className="text-stone-400 text-sm">/</span>
                        <span className="text-sm font-medium text-stone-600">{numPages}</span>
                    </div>

                    <button
                        onClick={nextPage}
                        disabled={currentPage >= numPages}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${currentPage >= numPages
                            ? 'text-stone-300 cursor-not-allowed'
                            : 'text-stone-600 hover:bg-stone-100'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </motion.div>
            )}
        </div>
    );
}
