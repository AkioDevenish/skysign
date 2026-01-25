'use client';

import { useRef, useCallback, useState } from 'react';

interface Point {
    x: number;
    y: number;
}

interface Stroke {
    points: Point[];
}

export interface SignatureCanvasState {
    strokes: Stroke[];
    currentStroke: Point[];
    isDrawing: boolean;
}

interface UseSignatureCanvasOptions {
    strokeColor?: string;
    strokeWidth?: number;
    smoothing?: number;
}

export function useSignatureCanvas(
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    options: UseSignatureCanvasOptions = {}
) {
    const {
        strokeColor = '#ffffff',
        strokeWidth = 3,
        smoothing = 0.3,
    } = options;

    const [state, setState] = useState<SignatureCanvasState>({
        strokes: [],
        currentStroke: [],
        isDrawing: false,
    });

    const lastPointsRef = useRef<Point[]>([]);
    const isDrawingRef = useRef(false);

    // Smooth point using exponential moving average
    const smoothPoint = useCallback((newPoint: Point, lastPoint: Point | null): Point => {
        if (!lastPoint) return newPoint;
        return {
            x: lastPoint.x + (newPoint.x - lastPoint.x) * smoothing,
            y: lastPoint.y + (newPoint.y - lastPoint.y) * smoothing,
        };
    }, [smoothing]);

    // Add point to current stroke
    const addPoint = useCallback((x: number, y: number, isDrawing: boolean) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Convert normalized coordinates (0-1) to canvas coordinates
        const canvasX = x * canvas.width;
        const canvasY = y * canvas.height;

        const rawPoint = { x: canvasX, y: canvasY };

        // Use the last point from our buffer for smoothing if available
        const lastSmoothedPoint = lastPointsRef.current.length > 0
            ? lastPointsRef.current[lastPointsRef.current.length - 1]
            : null;

        const smoothedPoint = smoothPoint(rawPoint, lastSmoothedPoint);

        if (isDrawing) {
            if (!isDrawingRef.current) {
                // Start new stroke
                isDrawingRef.current = true;
                lastPointsRef.current = [smoothedPoint];
                setState(prev => ({
                    ...prev,
                    isDrawing: true,
                    currentStroke: [smoothedPoint],
                }));
                return;
            }

            // Continue stroke - draw curve
            const points = lastPointsRef.current;
            points.push(smoothedPoint);

            // We need at least 3 points to draw a quadratic curve segment properly
            // But for the very beginning (2 points), we can draw a line or start a curve

            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();

            if (points.length === 2) {
                // First segment: simple line or curve to midpoint
                const p0 = points[0];
                const p1 = points[1];

                ctx.moveTo(p0.x, p0.y);
                // Draw to midpoint to set up the pattern for subsequent curves
                const midX = (p0.x + p1.x) / 2;
                const midY = (p0.y + p1.y) / 2;
                ctx.lineTo(midX, midY);
                ctx.stroke();
            } else {
                // Subsequent segments: Quadratic curves between midpoints
                // points has [..., p_prev2, p_prev1, p_curr]
                const p0 = points[points.length - 3];
                const p1 = points[points.length - 2];
                const p2 = points[points.length - 1];

                const mid1 = {
                    x: (p0.x + p1.x) / 2,
                    y: (p0.y + p1.y) / 2
                };

                const mid2 = {
                    x: (p1.x + p2.x) / 2,
                    y: (p1.y + p2.y) / 2
                };

                ctx.moveTo(mid1.x, mid1.y);
                ctx.quadraticCurveTo(p1.x, p1.y, mid2.x, mid2.y);
                ctx.stroke();
            }

            setState(prev => ({
                ...prev,
                currentStroke: [...prev.currentStroke, smoothedPoint],
            }));
        } else {
            if (isDrawingRef.current) {
                // End stroke
                // Draw the final segment from the last midpoint to the actual last point
                if (lastPointsRef.current.length >= 2) {
                    const points = lastPointsRef.current;
                    const pSecondLast = points[points.length - 2];
                    const pLast = points[points.length - 1];
                    const mid = {
                        x: (pSecondLast.x + pLast.x) / 2,
                        y: (pSecondLast.y + pLast.y) / 2
                    };

                    ctx.beginPath();
                    ctx.strokeStyle = strokeColor;
                    ctx.lineWidth = strokeWidth;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.moveTo(mid.x, mid.y);
                    ctx.lineTo(pLast.x, pLast.y);
                    ctx.stroke();
                }

                isDrawingRef.current = false;
                setState(prev => ({
                    ...prev,
                    isDrawing: false,
                    strokes: [...prev.strokes, { points: prev.currentStroke }],
                    currentStroke: [],
                }));
            }
            // Reset points buffer but keep tracking for smooth resume if needed (optional, but cleaner to reset on lift)
            lastPointsRef.current = [];
        }
    }, [canvasRef, smoothPoint, strokeColor, strokeWidth]);

    // Clear canvas
    const clear = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setState({
            strokes: [],
            currentStroke: [],
            isDrawing: false,
        });
        lastPointsRef.current = [];
        isDrawingRef.current = false;
    }, [canvasRef]);

    // Redraw all strokes (useful after resize or style change)
    const redraw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        state.strokes.forEach(stroke => {
            if (stroke.points.length < 2) return;

            ctx.beginPath();
            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

            if (stroke.points.length === 2) {
                ctx.lineTo(stroke.points[1].x, stroke.points[1].y);
            } else {
                // Draw quadratic curves
                for (let i = 1; i < stroke.points.length - 1; i++) {
                    const p1 = stroke.points[i];
                    const p2 = stroke.points[i + 1];
                    const mid = {
                        x: (p1.x + p2.x) / 2,
                        y: (p1.y + p2.y) / 2,
                    };
                    // For the first segment, we just draw a line to the first midpoint? 
                    // Or we assume the start is p0.
                    // Actually, from p0 to mid(p0, p1) is a line.
                    // But here we are iterating.
                    // Let's use the midpoint loop logic.
                    // We start at p0.
                    // Loop from i=1.
                    // Curve from current pos to mid(p_i, p_i+1) using p_i as control.

                    // Actually, simpler loop for full redraw:
                    const midPoint = {
                        x: (stroke.points[i].x + stroke.points[i + 1].x) / 2,
                        y: (stroke.points[i].y + stroke.points[i + 1].y) / 2
                    };
                    ctx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, midPoint.x, midPoint.y);
                }
                // Last segment
                ctx.lineTo(stroke.points[stroke.points.length - 1].x, stroke.points[stroke.points.length - 1].y);
            }
            ctx.stroke();
        });
    }, [canvasRef, state.strokes, strokeColor, strokeWidth]);

    // Export as data URL
    const exportAsDataURL = useCallback((format: 'png' | 'svg' = 'png'): string | null => {
        const canvas = canvasRef.current;
        if (!canvas) return null;

        if (format === 'png') {
            return canvas.toDataURL('image/png');
        }

        // SVG export
        const paths = state.strokes.map(stroke => {
            if (stroke.points.length < 2) return '';

            let d = `M ${stroke.points[0].x} ${stroke.points[0].y}`;

            if (stroke.points.length === 2) {
                d += ` L ${stroke.points[1].x} ${stroke.points[1].y}`;
            } else {
                for (let i = 1; i < stroke.points.length - 1; i++) {
                    const midX = (stroke.points[i].x + stroke.points[i + 1].x) / 2;
                    const midY = (stroke.points[i].y + stroke.points[i + 1].y) / 2;
                    d += ` Q ${stroke.points[i].x} ${stroke.points[i].y} ${midX} ${midY}`;
                }
                d += ` L ${stroke.points[stroke.points.length - 1].x} ${stroke.points[stroke.points.length - 1].y}`;
            }

            return `<path d="${d}" stroke="${strokeColor}" stroke-width="${strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
        }).join('\n');

        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">\n${paths}\n</svg>`;
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }, [canvasRef, state.strokes, strokeColor, strokeWidth]);

    // Check if canvas has content
    const hasContent = state.strokes.length > 0 || state.currentStroke.length > 0;

    return {
        ...state,
        hasContent,
        addPoint,
        clear,
        redraw,
        exportAsDataURL,
    };
}
