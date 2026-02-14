'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { signatureTemplates, SignatureTemplate } from '@/lib/templateData';

interface TemplateGalleryProps {
    onSelect?: (template: SignatureTemplate) => void;
    plan?: 'free' | 'pro' | 'team';
}

const categoryLabels = {
    professional: 'Professional',
    casual: 'Casual',
    artistic: 'Artistic',
    minimal: 'Minimal',
};

export default function TemplateGallery({ onSelect, plan = 'free' }: TemplateGalleryProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>('all');
    const [shakeId, setShakeId] = useState<string | null>(null);
    const upgradeCTARef = useRef<HTMLDivElement>(null);

    const filteredTemplates = filter === 'all'
        ? signatureTemplates
        : signatureTemplates.filter(t => t.category === filter);

    const handleSelect = (template: SignatureTemplate) => {
        if (template.isPro && plan === 'free') {
            setShakeId(template.id);
            setTimeout(() => setShakeId(null), 600);
            upgradeCTARef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        setSelectedId(template.id);
        onSelect?.(template);
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-semibold text-stone-900">Signature Templates</h3>
                    <p className="text-sm text-stone-500">Choose a style to get started</p>
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filter === 'all'
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                >
                    All
                </button>
                {Object.entries(categoryLabels).map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filter === key
                            ? 'bg-stone-900 text-white'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-2 gap-4">
                {filteredTemplates.map((template, idx) => {
                    const isLocked = template.isPro && plan === 'free';
                    const isSelected = selectedId === template.id;

                    return (
                        <motion.button
                            key={template.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => handleSelect(template)}
                            className={`relative p-4 rounded-2xl border text-left transition-all ${isSelected
                                ? 'border-stone-900 bg-stone-50 shadow-md'
                                : isLocked
                                    ? 'border-stone-200 bg-stone-50 opacity-75 hover:opacity-90 cursor-pointer'
                                    : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'
                                }`}
                        >
                            {/* Pro Badge */}
                            {template.isPro && (
                                <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                                    PRO
                                </span>
                            )}

                            {/* Preview */}
                            <div className="bg-stone-100 rounded-xl p-4 mb-3 aspect-[3/1] flex items-center justify-center">
                                <svg viewBox="0 0 280 80" className="w-full h-full" fill="none">
                                    <path
                                        d={template.previewPath}
                                        stroke={isLocked ? '#a8a29e' : '#1c1917'}
                                        strokeWidth={template.strokeWidth}
                                        strokeLinecap={template.style.strokeLinecap}
                                        strokeLinejoin={template.style.strokeLinejoin}
                                        fill="none"
                                    />
                                </svg>
                            </div>

                            {/* Info */}
                            <h4 className="font-medium text-stone-900 mb-1">{template.name}</h4>
                            <p className="text-xs text-stone-500">{template.description}</p>

                            {/* Lock Overlay */}
                            {isLocked && (
                                <motion.div
                                    animate={shakeId === template.id ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                                    transition={{ duration: 0.4 }}
                                    className="absolute inset-0 rounded-2xl flex items-center justify-center bg-white/60 backdrop-blur-[1px]"
                                >
                                    <div className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-full text-sm font-medium">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Upgrade to Pro
                                    </div>
                                </motion.div>
                            )}

                            {/* Selected Indicator */}
                            {isSelected && (
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-stone-900 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Upgrade CTA */}
            {plan === 'free' && (
                <div ref={upgradeCTARef}>
                <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                            <span className="text-lg">
                                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                            </span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-stone-900">Unlock all templates</p>
                            <p className="text-xs text-stone-500">Get 4 more premium styles with Pro</p>
                        </div>
                        <Link href="/#pricing" className="px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-full hover:bg-stone-800 transition-colors">
                            View Plans
                        </Link>
                    </div>
                </div>
                </div>
            )}
        </div>
    );
}
