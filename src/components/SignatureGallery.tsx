
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useQuery, useMutation, usePaginatedQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { exportSignature, SavedSignature } from '@/lib/signatureStorage';
import { Id } from "../../convex/_generated/dataModel";

interface SignatureGalleryProps {
    onSelect?: (signature: SavedSignature) => void;
    onRefresh?: () => void;
}

export default function SignatureGallery({ onSelect }: SignatureGalleryProps) {
    // Convex hooks
    const { results: signatures, status, loadMore } = usePaginatedQuery(api.signatures.get, {}, { initialNumItems: 10 });
    const deleteSig = useMutation(api.signatures.remove);

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const handleDelete = async (id: string, convexId: Id<"signatures">) => {
        if (deleteConfirm === id) {
            await deleteSig({ id: convexId });
            setDeleteConfirm(null);
        } else {
            setDeleteConfirm(id);
            setTimeout(() => setDeleteConfirm(null), 3000);
        }
    };

    const handleExport = (signature: SavedSignature, format: 'png' | 'svg') => {
        exportSignature(signature, format);
    };

    const handleSelect = (signature: SavedSignature) => {
        setSelectedId(signature.id);
        onSelect?.(signature);
    };

    // Derived state
    const loading = signatures === undefined;
    const count = signatures?.length || 0;
    const remainingSlots = Math.max(0, 5 - count);

    // Map Convex docs to SavedSignature interface for compatibility
    const mappedSignatures: SavedSignature[] = signatures?.map(sig => ({
        id: sig._id, // Use Convex ID
        name: sig.name,
        dataUrl: sig.dataUrl,
        createdAt: sig.createdAt,
        updatedAt: sig.updatedAt,
        style: sig.style,
        thumbnail: sig.thumbnail,
    })) || [];

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (mappedSignatures.length === 0) {
        return (
            <div className="p-8 text-center">
                <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
                <h3 className="font-semibold text-stone-900 mb-2">No signatures yet</h3>
                <p className="text-sm text-stone-500 mb-4">
                    Create your first signature by drawing in the air!
                </p>
                <p className="text-xs text-stone-400">
                    {remainingSlots} of 5 free slots remaining
                </p>
            </div>
        );
    }

    return (
        <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stone-900">My Signatures</h3>
                <span className="text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded-full">
                    {mappedSignatures.length}/5 used
                </span>
            </div>

            {/* Signature Grid */}
            <div className="space-y-3">
                <AnimatePresence>
                    {mappedSignatures.map((sig) => (
                        <motion.div
                            key={sig.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className={`relative bg-white rounded-xl border transition-all cursor-pointer group ${selectedId === sig.id
                                ? 'border-blue-500 ring-1 ring-blue-500 shadow-md'
                                : 'border-stone-200 hover:border-stone-300 hover:shadow-sm'
                                }`}
                            onClick={() => handleSelect(sig)}
                        >
                            {/* Signature Preview */}
                            <div className="p-3">
                                <div className="bg-stone-50 rounded-lg p-3 mb-2 aspect-[3/1] flex items-center justify-center overflow-hidden">
                                    <Image
                                        src={sig.dataUrl}
                                        alt={sig.name}
                                        fill
                                        className="object-contain"
                                        unoptimized
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-stone-900 truncate max-w-[120px]">
                                            {sig.name}
                                        </p>
                                        <p className="text-xs text-stone-400">
                                            {new Date(sig.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleExport(sig, 'png');
                                            }}
                                            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-700 transition-colors"
                                            title="Export PNG"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(sig.id, sig.id as Id<"signatures">);
                                            }}
                                            className={`p-1.5 rounded-lg transition-colors ${deleteConfirm === sig.id
                                                ? 'bg-red-100 text-red-600'
                                                : 'hover:bg-red-50 text-stone-500 hover:text-red-600'
                                                }`}
                                            title={deleteConfirm === sig.id ? 'Click again to confirm' : 'Delete'}
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Selected indicator */}
                            {selectedId === sig.id && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Load More */}
            {status === "CanLoadMore" && (
                <div className="mt-4 text-center">
                    <button
                        onClick={() => loadMore(10)}
                        className="px-4 py-2 text-sm text-stone-500 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                    >
                        Load More
                    </button>
                </div>
            )}

            {/* Remaining slots indicator */}
            {remainingSlots > 0 && remainingSlots < 3 && (
                <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <p className="text-xs text-amber-700">
                        <strong>{remainingSlots}</strong> free {remainingSlots === 1 ? 'slot' : 'slots'} remaining.{' '}
                        <span className="font-semibold">Unlimited signatures coming soon with Pro!</span>
                    </p>
                </div>
            )}
        </div>
    );
}
