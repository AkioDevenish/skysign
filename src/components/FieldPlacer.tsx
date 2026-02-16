'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export type FieldType = 'date' | 'initials' | 'text' | 'signature';

export interface Field {
    id: string;
    type: FieldType;
    x: number;
    y: number;
    width: number;
    height: number;
    value: string;
    label: string;
    signerId?: string;
}

interface FieldPlacerProps {
    containerWidth: number;
    containerHeight: number;
    onFieldsChange?: (fields: Field[]) => void;
    userName?: string;
}

const fieldDefaults: Record<FieldType, { width: number; height: number; label: string }> = {
    date: { width: 120, height: 32, label: 'Date' },
    initials: { width: 60, height: 40, label: 'Initials' },
    text: { width: 200, height: 32, label: 'Text' },
    signature: { width: 150, height: 50, label: 'Signature' },
};

export default function FieldPlacer({
    containerWidth,
    containerHeight,
    onFieldsChange,
    userName = '',
}: FieldPlacerProps) {
    const [fields, setFields] = useState<Field[]>([]);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 3);
    };

    useEffect(() => {
        if (onFieldsChange) {
            onFieldsChange(fields);
        }
    }, [fields, onFieldsChange]);

    const addField = (type: FieldType) => {
        const defaults = fieldDefaults[type];
        const id = `field_${crypto.randomUUID().slice(0, 9)}`;

        let value = '';
        if (type === 'date') {
            value = new Date().toLocaleDateString();
        } else if (type === 'initials') {
            value = getInitials(userName);
        } else if (type === 'signature') {
            value = 'Signature';
        }

        const newField: Field = {
            id,
            type,
            x: 50 + (fields.length % 3) * 30,
            y: 100 + Math.floor(fields.length / 3) * 50,
            width: defaults.width,
            height: defaults.height,
            value,
            label: defaults.label,
        };

        setFields(prev => [...prev, newField]);
    };

    const removeField = (id: string) => {
        setFields(prev => prev.filter(f => f.id !== id));
    };

    const updateFieldValue = (id: string, value: string) => {
        setFields(prev => prev.map(f => f.id === id ? { ...f, value } : f));
    };

    const handleDragStart = (e: React.MouseEvent, fieldId: string) => {
        e.preventDefault();
        const field = fields.find(f => f.id === fieldId);
        if (!field) return;

        setDraggingId(fieldId);
        dragOffset.current = {
            x: e.clientX - field.x,
            y: e.clientY - field.y
        };
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!draggingId) return;

        const newX = Math.max(0, Math.min(containerWidth - 100, e.clientX - dragOffset.current.x));
        const newY = Math.max(0, Math.min(containerHeight - 40, e.clientY - dragOffset.current.y));

        setFields(prev => prev.map(f =>
            f.id === draggingId ? { ...f, x: newX, y: newY } : f
        ));
    }, [draggingId, containerWidth, containerHeight]);

    const handleMouseUp = useCallback(() => {
        setDraggingId(null);
    }, []);

    useEffect(() => {
        if (draggingId) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [draggingId, handleMouseMove, handleMouseUp]);

    const fieldButtons = [
        {
            type: 'date' as FieldType,
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            label: 'Date',
            color: 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200/60'
        },
        {
            type: 'initials' as FieldType,
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
            ),
            label: 'Initials',
            color: 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200/60'
        },
        {
            type: 'signature' as FieldType,
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2 20c2-1 4-3 6-3s3 2 5 2 3-2 5-2" />
                </svg>
            ),
            label: 'Signature',
            color: 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200/60'
        },
    ];

    return (
        <div className="absolute inset-0 pointer-events-none">
            {/* Toolbar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-white rounded-xl shadow-lg border border-stone-200 px-3 py-2 pointer-events-auto">
                {fieldButtons.map(btn => (
                    <button
                        key={btn.type}
                        onClick={() => addField(btn.type)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${btn.color}`}
                    >
                        {btn.icon}
                        {btn.label}
                    </button>
                ))}
            </div>

            {/* Fields */}
            {fields.map(field => (
                <div
                    key={field.id}
                    style={{
                        position: 'absolute',
                        left: field.x,
                        top: field.y,
                        width: field.width,
                        height: field.height,
                        zIndex: draggingId === field.id ? 200 : 110,
                        pointerEvents: 'auto',
                        cursor: draggingId === field.id ? 'grabbing' : 'grab'
                    }}
                    className="group"
                >
                    {/* Drag handle - a vertical bar on the left */}
                    <div
                        className={`absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing border-r border-stone-200 z-20 ${draggingId === field.id
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-stone-50 text-stone-400 hover:bg-stone-100 hover:text-stone-600'
                            }`}
                        onMouseDown={(e) => handleDragStart(e, field.id)}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                    </div>

                    {/* Content area */}
                    <div className={`absolute inset-0 pl-8 border-2 rounded transition-all ${draggingId === field.id
                        ? 'border-blue-500 bg-white shadow-lg'
                        : 'border-dashed border-stone-300 bg-white/80 group-hover:border-stone-400'
                        }`}>
                        <input
                            type="text"
                            value={field.value}
                            onChange={(e) => updateFieldValue(field.id, e.target.value)}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="w-full h-full px-2 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded text-center font-medium text-stone-800"
                            placeholder={field.label}
                        />
                    </div>

                    {/* Remove button */}
                    <button
                        onClick={() => removeField(field.id)}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-sm hover:bg-red-600"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}
