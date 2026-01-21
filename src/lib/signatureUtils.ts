/**
 * Signature utility functions for path smoothing, cleanup, and export
 */

interface Point {
    x: number;
    y: number;
}

/**
 * Apply Bezier curve smoothing to a set of points
 */
export function smoothPath(points: Point[], tension: number = 0.5): Point[] {
    if (points.length < 3) return points;

    const smoothed: Point[] = [points[0]];

    for (let i = 1; i < points.length - 1; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const next = points[i + 1];

        // Calculate control points
        const smoothedX = curr.x + (next.x - prev.x) * tension * 0.25;
        const smoothedY = curr.y + (next.y - prev.y) * tension * 0.25;

        smoothed.push({ x: smoothedX, y: smoothedY });
    }

    smoothed.push(points[points.length - 1]);
    return smoothed;
}

/**
 * Remove duplicate/very close points from a path
 */
export function simplifyPath(points: Point[], minDistance: number = 2): Point[] {
    if (points.length < 2) return points;

    const simplified: Point[] = [points[0]];

    for (let i = 1; i < points.length; i++) {
        const last = simplified[simplified.length - 1];
        const curr = points[i];
        const distance = Math.sqrt(Math.pow(curr.x - last.x, 2) + Math.pow(curr.y - last.y, 2));

        if (distance >= minDistance) {
            simplified.push(curr);
        }
    }

    return simplified;
}

/**
 * Calculate the bounding box of a signature
 */
export function getSignatureBounds(strokes: { points: Point[] }[]): {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
} | null {
    const allPoints = strokes.flatMap(s => s.points);
    if (allPoints.length === 0) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    allPoints.forEach(p => {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
    });

    return {
        minX,
        minY,
        maxX,
        maxY,
        width: maxX - minX,
        height: maxY - minY,
    };
}

/**
 * Create a trimmed signature canvas (removes whitespace)
 */
export function createTrimmedCanvas(
    originalCanvas: HTMLCanvasElement,
    padding: number = 20
): HTMLCanvasElement | null {
    const ctx = originalCanvas.getContext('2d');
    if (!ctx) return null;

    const imageData = ctx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
    const { data, width, height } = imageData;

    let minX = width, minY = height, maxX = 0, maxY = 0;
    let hasContent = false;

    // Find bounds of non-transparent pixels
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const alpha = data[(y * width + x) * 4 + 3];
            if (alpha > 0) {
                hasContent = true;
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }
        }
    }

    if (!hasContent) return null;

    // Create trimmed canvas
    const trimmedWidth = maxX - minX + padding * 2;
    const trimmedHeight = maxY - minY + padding * 2;

    const trimmedCanvas = document.createElement('canvas');
    trimmedCanvas.width = trimmedWidth;
    trimmedCanvas.height = trimmedHeight;

    const trimmedCtx = trimmedCanvas.getContext('2d');
    if (!trimmedCtx) return null;

    trimmedCtx.drawImage(
        originalCanvas,
        minX - padding,
        minY - padding,
        trimmedWidth,
        trimmedHeight,
        0,
        0,
        trimmedWidth,
        trimmedHeight
    );

    return trimmedCanvas;
}

/**
 * Download a data URL as a file
 */
export function downloadSignature(dataUrl: string, filename: string): void {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Generate a unique signature ID
 */
export function generateSignatureId(): string {
    return `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
