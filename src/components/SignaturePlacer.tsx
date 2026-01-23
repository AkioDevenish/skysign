'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SignaturePlacerProps {
    signatureDataUrl: string;
    containerWidth: number;
    containerHeight: number;
    onPositionChange?: (position: { x: number; y: number; width: number; height: number }) => void;
    initialPosition?: { x: number; y: number; width: number; height: number };
}

export default function SignaturePlacer({
    signatureDataUrl,
    containerWidth,
    containerHeight,
    onPositionChange,
    initialPosition,
}: SignaturePlacerProps) {
    const [position, setPosition] = useState({
        x: initialPosition?.x ?? containerWidth * 0.1,
        y: initialPosition?.y ?? containerHeight * 0.7,
        width: initialPosition?.width ?? 200,
        height: initialPosition?.height ?? 80,
    });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
    const resizeRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);

    useEffect(() => {
        if (onPositionChange) {
            onPositionChange(position);
        }
    }, [position, onPositionChange]);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startPosX: position.x,
            startPosY: position.y,
        };
    };

    const handleResizeMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        resizeRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startWidth: position.width,
            startHeight: position.height,
        };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging && dragRef.current) {
                const deltaX = e.clientX - dragRef.current.startX;
                const deltaY = e.clientY - dragRef.current.startY;

                const newX = Math.max(0, Math.min(containerWidth - position.width, dragRef.current.startPosX + deltaX));
                const newY = Math.max(0, Math.min(containerHeight - position.height, dragRef.current.startPosY + deltaY));

                setPosition(prev => ({ ...prev, x: newX, y: newY }));
            }

            if (isResizing && resizeRef.current) {
                const deltaX = e.clientX - resizeRef.current.startX;
                const deltaY = e.clientY - resizeRef.current.startY;

                const newWidth = Math.max(80, Math.min(containerWidth * 0.5, resizeRef.current.startWidth + deltaX));
                const aspectRatio = resizeRef.current.startHeight / resizeRef.current.startWidth;
                const newHeight = newWidth * aspectRatio;

                setPosition(prev => ({ ...prev, width: newWidth, height: newHeight }));
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
            dragRef.current = null;
            resizeRef.current = null;
        };

        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, containerWidth, containerHeight, position.width, position.height]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
                position: 'absolute',
                left: position.x,
                top: position.y,
                width: position.width,
                height: position.height,
                cursor: isDragging ? 'grabbing' : 'grab',
                zIndex: 100,
            }}
            onMouseDown={handleMouseDown}
            className={`group ${isDragging || isResizing ? 'ring-2 ring-blue-500' : ''}`}
        >
            <img
                src={signatureDataUrl}
                alt="Signature"
                className="w-full h-full object-contain pointer-events-none"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
            />

            <div className={`absolute inset-0 border-2 border-dashed transition-opacity ${isDragging || isResizing ? 'border-blue-500 opacity-100' : 'border-stone-400 opacity-0 group-hover:opacity-100'
                }`} />

            <div
                onMouseDown={handleResizeMouseDown}
                className={`absolute -right-2 -bottom-2 w-4 h-4 bg-white border-2 border-stone-400 rounded-full cursor-se-resize transition-opacity ${isDragging || isResizing ? 'opacity-100 border-blue-500' : 'opacity-0 group-hover:opacity-100'
                    }`}
            />
        </motion.div>
    );
}
