/**
 * Export utilities for signatures
 * Supports PNG, SVG, PDF, and JSON formats
 */

import { SavedSignature, getSignatures } from './signatureStorage';

/**
 * Export a single signature as PNG
 */
export function exportAsPng(signature: SavedSignature): void {
    const link = document.createElement('a');
    link.href = signature.dataUrl;
    link.download = `${sanitizeFilename(signature.name)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Export a single signature as SVG
 */
export function exportAsSvg(signature: SavedSignature): void {
    // Extract dimensions from data URL or use defaults
    const img = new Image();
    img.onload = () => {
        const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     width="${img.width}" height="${img.height}" viewBox="0 0 ${img.width} ${img.height}">
  <image width="${img.width}" height="${img.height}" xlink:href="${signature.dataUrl}" />
</svg>`;
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        downloadBlob(blob, `${sanitizeFilename(signature.name)}.svg`);
    };
    img.src = signature.dataUrl;
}

/**
 * Export a single signature as PDF
 */
export async function exportAsPdf(signature: SavedSignature): Promise<void> {
    // Dynamic import to reduce bundle size
    const { PDFDocument } = await import('pdf-lib');

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([400, 200]);

    // Convert data URL to bytes
    const imageData = signature.dataUrl.split(',')[1];
    const imageBytes = Uint8Array.from(atob(imageData), c => c.charCodeAt(0));

    const pngImage = await pdfDoc.embedPng(imageBytes);
    const { width, height } = pngImage.scale(0.5);

    page.drawImage(pngImage, {
        x: (page.getWidth() - width) / 2,
        y: (page.getHeight() - height) / 2,
        width,
        height,
    });

    const pdfBytes = await pdfDoc.save();
    downloadBlob(new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' }), `${sanitizeFilename(signature.name)}.pdf`);
}

/**
 * Export all signatures as JSON backup
 */
export function exportAsJson(): void {
    const signatures = getSignatures();
    const data = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        signatures,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `skysign_backup_${formatDate(new Date())}.json`);
}

/**
 * Export multiple signatures as a ZIP file
 */
export async function exportAllAsZip(format: 'png' | 'svg' = 'png'): Promise<void> {
    const signatures = getSignatures();
    if (signatures.length === 0) {
        alert('No signatures to export');
        return;
    }

    // For simplicity, export as individual files
    // A full implementation would use JSZip
    for (const sig of signatures) {
        if (format === 'png') {
            exportAsPng(sig);
        } else {
            exportAsSvg(sig);
        }
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 200));
    }
}

/**
 * Import signatures from JSON backup
 */
export function importFromJson(file: File): Promise<{ success: number; failed: number }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                const imported = data.signatures || data;

                // Import logic would go here
                // For now, just count
                resolve({ success: imported.length, failed: 0 });
            } catch {
                reject(new Error('Invalid backup file'));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

// Helper functions
function sanitizeFilename(name: string): string {
    return name.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 50);
}

function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}
