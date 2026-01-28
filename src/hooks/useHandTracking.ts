'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface HandTrackingState {
    isLoading: boolean;
    isTracking: boolean;
    error: string | null;
    fingerPosition: { x: number; y: number } | null;
    handPosition: { x: number; y: number } | null;
    isDrawing: boolean;
    gesture: 'drawing' | 'idle' | 'save' | 'clear' | 'stop' | null;
    loadingStatus: string;
}

interface UseHandTrackingOptions {
    onPositionUpdate?: (x: number, y: number, isDrawing: boolean) => void;
    onGesture?: (gesture: 'save' | 'clear') => void;
}

// MediaPipe types
interface Landmark {
    x: number;
    y: number;
    z: number;
}

interface HandResults {
    multiHandLandmarks?: Landmark[][];
}

type HandsInstance = {
    setOptions: (options: Record<string, unknown>) => void;
    onResults: (callback: (results: HandResults) => void) => void;
    send: (input: { image: HTMLVideoElement }) => Promise<void>;
    close: () => void;
};

type CameraInstance = {
    start: () => Promise<void>;
    stop: () => void;
};

// Declare global types for MediaPipe loaded via CDN
declare global {
    interface Window {
        Hands: new (config: { locateFile: (file: string) => string }) => HandsInstance;
        Camera: new (
            video: HTMLVideoElement,
            config: { onFrame: () => Promise<void>; width: number; height: number }
        ) => CameraInstance;
    }
}

export function useHandTracking(
    videoRef: React.RefObject<HTMLVideoElement | null>,
    options: UseHandTrackingOptions = {}
) {
    const [state, setState] = useState<HandTrackingState>({
        isLoading: true,
        isTracking: false,
        error: null,
        fingerPosition: null,
        handPosition: null,
        isDrawing: false,
        gesture: null,
        loadingStatus: 'Initializing MediaPipe...',
    });

    const handsRef = useRef<HandsInstance | null>(null);
    const cameraRef = useRef<CameraInstance | null>(null);
    const optionsRef = useRef(options);

    // State Machine Refs
    const activeGestureRef = useRef<string>('idle');
    const pendingGestureRef = useRef<string>('idle');
    const pendingGestureStartTimeRef = useRef<number>(0);
    const lastActionTimeRef = useRef<number>(0);

    // Adaptive smoothing
    const smoothedPositionRef = useRef<{ x: number; y: number } | null>(null);
    const MIN_SMOOTHING = 0.1; // Very smooth for slow movements/jitter
    const MAX_SMOOTHING = 0.6; // Responsive for fast movements
    const VELOCITY_SCALE = 15; // Scaling factor for velocity-based smoothing

    // Keep options ref updated
    useEffect(() => {
        optionsRef.current = options;
    }, [options]);

    // Smooth position with adaptive factor
    const smoothPosition = (newX: number, newY: number): { x: number; y: number } => {
        if (!smoothedPositionRef.current) {
            smoothedPositionRef.current = { x: newX, y: newY };
            return { x: newX, y: newY };
        }

        // Calculate distance (velocity proxy since we process per frame)
        const dx = newX - smoothedPositionRef.current.x;
        const dy = newY - smoothedPositionRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Adaptive smoothing factor
        // If distance is small (jitter), use MIN_SMOOTHING
        // If distance is large (fast stroke), blend towards MAX_SMOOTHING
        const factor = Math.min(
            MAX_SMOOTHING,
            Math.max(MIN_SMOOTHING, distance * VELOCITY_SCALE)
        );

        const smoothedX = smoothedPositionRef.current.x + factor * dx;
        const smoothedY = smoothedPositionRef.current.y + factor * dy;

        smoothedPositionRef.current = { x: smoothedX, y: smoothedY };
        return { x: smoothedX, y: smoothedY };
    };

    // Helper to calculate distance
    const getDistance = (p1: Landmark, p2: Landmark) => {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    };

    // Detect gesture from hand landmarks
    const detectGesture = useCallback((landmarks: Landmark[]): string => {
        const indexTip = landmarks[8];

        // Edge safeguards: if near edge, force stop drawing to prevent wild jitter
        const EDGE_MARGIN = 0.02;
        if (indexTip.x < EDGE_MARGIN || indexTip.x > 1 - EDGE_MARGIN ||
            indexTip.y < EDGE_MARGIN || indexTip.y > 1 - EDGE_MARGIN) {
            return 'idle';
        }

        const wrist = landmarks[0];
        const thumbTip = landmarks[4];
        const thumbIp = landmarks[3];
        // ... (rest of function relies on variables defined above, skipping re-definition for brevity in replacement if possible, but replace tool needs contiguous block)
        // Actually, I need to include the rest of detectGesture to close the function properly or use multi-replace to target specific blocks. 
        // I'll rewrite the whole detectGesture start to handle edge cases.
        const thumbToIndexMcp = getDistance(thumbTip, landmarks[5]); // Using inline indexMcp lookup

        // Re-declaring needed landmarks for the existing logic
        const indexPip = landmarks[6];
        const indexMcp = landmarks[5];
        const middleTip = landmarks[12];
        const middlePip = landmarks[10];
        const middleMcp = landmarks[9];
        const ringTip = landmarks[16];
        const ringPip = landmarks[14];
        const ringMcp = landmarks[13];
        const pinkyTip = landmarks[20];
        const pinkyPip = landmarks[18];
        const pinkyMcp = landmarks[17];

        const isExtended = (tip: Landmark, pip: Landmark, mcp: Landmark) => {
            const tipDist = getDistance(tip, wrist);
            const pipDist = getDistance(pip, wrist);
            return tipDist > pipDist * 1.05;
        };

        const indexExtended = isExtended(indexTip, indexPip, indexMcp);
        const middleExtended = isExtended(middleTip, middlePip, middleMcp);
        const ringExtended = isExtended(ringTip, ringPip, ringMcp);
        const pinkyExtended = isExtended(pinkyTip, pinkyPip, pinkyMcp);

        // const thumbToIndexMcp = getDistance(thumbTip, indexMcp); // Already calc above
        const thumbIpToIndexMcp = getDistance(thumbIp, indexMcp);
        const thumbExtended = thumbToIndexMcp > thumbIpToIndexMcp * 1.2;

        const extendedFingerCount = [indexExtended, middleExtended, ringExtended, pinkyExtended].filter(Boolean).length;

        if (extendedFingerCount >= 4) return 'clear';
        if (thumbExtended && !indexExtended && !middleExtended && !ringExtended) return 'save';
        if (indexExtended && !middleExtended && !ringExtended) return 'drawing';

        return 'idle';
    }, []);

    // Load MediaPipe logic
    useEffect(() => {
        let isActive = true;

        const loadScript = (src: string): Promise<void> => {
            return new Promise((resolve, reject) => {
                const existing = document.querySelector(`script[src="${src}"]`);
                if (existing) {
                    if ((existing as HTMLScriptElement).dataset.loaded === 'true') {
                        resolve();
                        return;
                    }
                    existing.addEventListener('load', () => resolve());
                    existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
                    return;
                }
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                script.crossOrigin = 'anonymous';
                script.onload = () => {
                    script.dataset.loaded = 'true';
                    resolve();
                };
                script.onerror = () => reject(new Error(`Failed to load ${src}`));
                document.head.appendChild(script);
            });
        };

        const waitForGlobal = (name: string, timeout = 5000): Promise<void> => {
            return new Promise((resolve, reject) => {
                if ((window as unknown as Record<string, unknown>)[name]) {
                    resolve();
                    return;
                }
                const start = Date.now();
                const interval = setInterval(() => {
                    if ((window as unknown as Record<string, unknown>)[name]) {
                        clearInterval(interval);
                        resolve();
                    } else if (Date.now() - start > timeout) {
                        clearInterval(interval);
                        reject(new Error(`Timeout waiting for ${name}`));
                    }
                }, 100);
            });
        };

        const initMediaPipe = async () => {
            try {
                if (!isActive) return;
                setState(prev => ({ ...prev, loadingStatus: 'Loading hand tracking AI...' }));

                await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/hands.js');
                await waitForGlobal('Hands');

                if (!isActive) return;
                setState(prev => ({ ...prev, loadingStatus: 'Loading camera utilities...' }));

                await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1675466862/camera_utils.js');
                await waitForGlobal('Camera');

                if (!isActive) return;
                if (!videoRef.current) throw new Error('Video element not ready');

                setState(prev => ({ ...prev, loadingStatus: 'Initializing hand tracking model...' }));

                const hands = new window.Hands({
                    locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`,
                });

                hands.setOptions({
                    maxNumHands: 1,
                    modelComplexity: 1,
                    minDetectionConfidence: 0.7, // Increased from 0.6
                    minTrackingConfidence: 0.7, // Increased from 0.5
                });

                hands.onResults((results: HandResults) => {
                    if (!isActive) return;

                    // ALWAYS clear loading status if we get results (even empty ones)
                    // This prevents 'Requesting camera access...' from getting stuck

                    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                        const landmarks = results.multiHandLandmarks[0];
                        const indexFingerTip = landmarks[8];
                        const indexFingerMcp = landmarks[5];
                        const smoothedFinger = smoothPosition(indexFingerTip.x, indexFingerTip.y);

                        const rawGesture = detectGesture(landmarks);
                        const now = Date.now();

                        let effectiveGesture = activeGestureRef.current;

                        if (rawGesture !== pendingGestureRef.current) {
                            pendingGestureRef.current = rawGesture;
                            pendingGestureStartTimeRef.current = now;
                        } else {
                            if (rawGesture !== activeGestureRef.current) {
                                // Fast transition for drawing/idle, slower for actions to prevent accidental triggers
                                const isActionGesture = rawGesture === 'save' || rawGesture === 'clear';
                                const requiredDelay = isActionGesture ? 1000 : 50;
                                
                                if (now - pendingGestureStartTimeRef.current > requiredDelay) {
                                    activeGestureRef.current = rawGesture;
                                    effectiveGesture = rawGesture;

                                    if (rawGesture === 'save' || rawGesture === 'clear') {
                                        if (now - lastActionTimeRef.current > 2000) {
                                            if (optionsRef.current.onGesture) {
                                                optionsRef.current.onGesture(rawGesture as 'save' | 'clear');
                                            }
                                            lastActionTimeRef.current = now;
                                        }
                                    }
                                } else {
                                    effectiveGesture = 'idle';
                                }
                            }
                        }

                        setState(prev => ({
                            ...prev,
                            isLoading: false,
                            isTracking: true,
                            loadingStatus: 'Active',
                            fingerPosition: smoothedFinger,
                            handPosition: { x: indexFingerMcp.x, y: indexFingerMcp.y },
                            isDrawing: effectiveGesture === 'drawing',
                            gesture: effectiveGesture as HandTrackingState['gesture'],
                        }));

                        if (optionsRef.current.onPositionUpdate) {
                            optionsRef.current.onPositionUpdate(
                                smoothedFinger.x,
                                smoothedFinger.y,
                                effectiveGesture === 'drawing'
                            );
                        }

                    } else {
                        setState(prev => ({
                            ...prev,
                            isLoading: false, // Ensure we exit loading state
                            isTracking: false,
                            fingerPosition: null,
                            isDrawing: false,
                            gesture: null,
                            loadingStatus: 'Ready',
                        }));
                        activeGestureRef.current = 'idle';
                        pendingGestureRef.current = 'idle';
                    }
                });

                handsRef.current = hands;

                if (!isActive) {
                    hands.close();
                    return;
                }

                setState(prev => ({ ...prev, loadingStatus: 'Requesting camera access...' }));

                const camera = new window.Camera(videoRef.current, {
                    onFrame: async () => {
                        // Check isActive inside the frame loop to stop sending if unmounted
                        if (!isActive) return;
                        if (handsRef.current && videoRef.current) {
                            await handsRef.current.send({ image: videoRef.current });
                        }
                    },
                    width: 1280,
                    height: 720,
                });

                await camera.start();
                cameraRef.current = camera;

            } catch (err) {
                console.error(err);
                if (isActive) {
                    setState(prev => ({ ...prev, error: 'Failed to initialize hand tracking', loadingStatus: 'Error' }));
                }
            }
        };

        if (typeof window !== 'undefined') {
            initMediaPipe();
        }

        return () => {
            isActive = false;
            // Clean up immediately using the refs we have
            if (handsRef.current) {
                handsRef.current.close();
                handsRef.current = null;
            }
            if (cameraRef.current) {
                cameraRef.current.stop();
                cameraRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return state;
}
