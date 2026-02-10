'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Id } from '../../convex/_generated/dataModel';

const statusConfig = {
    pending: { 
        color: 'bg-gradient-to-r from-amber-400 to-orange-400',
        lightBg: 'bg-amber-50',
        text: 'text-amber-700',
        icon: '⏳',
        label: 'Awaiting Signature'
    },
    viewed: { 
        color: 'bg-gradient-to-r from-blue-400 to-indigo-400',
        lightBg: 'bg-blue-50',
        text: 'text-blue-700',
        icon: '👀',
        label: 'Viewed'
    },
    signed: { 
        color: 'bg-gradient-to-r from-emerald-400 to-green-400',
        lightBg: 'bg-emerald-50',
        text: 'text-emerald-700',
        icon: '✅',
        label: 'Completed'
    },
    declined: { 
        color: 'bg-gradient-to-r from-red-400 to-rose-400',
        lightBg: 'bg-red-50',
        text: 'text-red-700',
        icon: '❌',
        label: 'Declined'
    },
    expired: { 
        color: 'bg-gradient-to-r from-stone-400 to-stone-500',
        lightBg: 'bg-stone-50',
        text: 'text-stone-500',
        icon: '⏰',
        label: 'Expired'
    },
};

export default function SignatureRequestsDashboard() {
    const requests = useQuery(api.signatureRequests.getMySent);
    const stats = useQuery(api.signatureRequests.getStats);
    const removeRequest = useMutation(api.signatureRequests.remove);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const copyLink = async (token: string, id: string) => {
        const link = `${window.location.origin}/sign/${token}`;
        await navigator.clipboard.writeText(link);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDelete = async (id: Id<"signatureRequests">) => {
        if (!confirm('Are you sure you want to delete this request?')) return;
        await removeRequest({ id });
    };

    if (requests === undefined) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-3 border-stone-200 border-t-stone-800 rounded-full animate-spin" />
                    <p className="text-stone-500 text-sm">Loading requests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
                        <span className="text-2xl">📤</span>
                        Sent Requests
                    </h2>
                    <p className="text-stone-500 text-sm mt-1">Track documents you've sent for signature</p>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative overflow-hidden bg-white rounded-2xl border border-stone-200 p-5 shadow-sm"
                    >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-stone-100 to-transparent rounded-bl-full" />
                        <p className="text-3xl font-bold text-stone-900">{stats.total}</p>
                        <p className="text-xs text-stone-500 uppercase tracking-wider mt-1 font-medium">Total Sent</p>
                    </motion.div>
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50 p-5 shadow-sm"
                    >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-100/50 to-transparent rounded-bl-full" />
                        <p className="text-3xl font-bold text-amber-700">{stats.pending}</p>
                        <p className="text-xs text-amber-600 uppercase tracking-wider mt-1 font-medium">Pending</p>
                    </motion.div>
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200/50 p-5 shadow-sm"
                    >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-100/50 to-transparent rounded-bl-full" />
                        <p className="text-3xl font-bold text-emerald-700">{stats.signed}</p>
                        <p className="text-xs text-emerald-600 uppercase tracking-wider mt-1 font-medium">Signed</p>
                    </motion.div>
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="relative overflow-hidden bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl border border-red-200/50 p-5 shadow-sm"
                    >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-100/50 to-transparent rounded-bl-full" />
                        <p className="text-3xl font-bold text-red-700">{stats.declined}</p>
                        <p className="text-xs text-red-600 uppercase tracking-wider mt-1 font-medium">Declined</p>
                    </motion.div>
                </div>
            )}

            {/* Request List */}
            {requests.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16 bg-gradient-to-b from-stone-50 to-white rounded-2xl border border-stone-200"
                >
                    <div className="w-20 h-20 bg-gradient-to-br from-stone-100 to-stone-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <svg className="w-10 h-10 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">No Requests Yet</h3>
                    <p className="text-stone-500 max-w-sm mx-auto">
                        Create a signature and use the <span className="font-medium text-stone-700">"Send for Signature"</span> button to send documents for signing.
                    </p>
                    <div className="mt-8 flex justify-center">
                        <div className="flex items-center gap-2 text-sm text-stone-400">
                            <span className="w-8 h-[1px] bg-stone-200"></span>
                            <span>or</span>
                            <span className="w-8 h-[1px] bg-stone-200"></span>
                        </div>
                    </div>
                    <p className="mt-4 text-stone-400 text-sm">
                        Go to <span className="text-stone-600 font-medium">Create Signature</span> to get started
                    </p>
                </motion.div>
            ) : (
                <div className="space-y-4">
                    {requests.map((request, index: number) => {
                        const config = statusConfig[request.status as keyof typeof statusConfig] || statusConfig.pending;
                        return (
                            <motion.div
                                key={request._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group bg-white border border-stone-200 rounded-2xl p-5 hover:shadow-lg hover:border-stone-300 transition-all duration-300"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Status indicator */}
                                    <div className={`w-12 h-12 rounded-xl ${config.lightBg} flex items-center justify-center text-xl flex-shrink-0`}>
                                        {config.icon}
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <div>
                                                <h4 className="font-semibold text-stone-900 text-lg truncate">
                                                    {request.documentName}
                                                </h4>
                                                <p className="text-stone-500 text-sm">
                                                    To: <span className="font-medium text-stone-700">{request.recipientName || request.recipientEmail}</span>
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.lightBg} ${config.text} whitespace-nowrap`}>
                                                {config.label}
                                            </span>
                                        </div>
                                        
                                        {/* Timeline */}
                                        <div className="flex items-center gap-4 text-xs text-stone-400 mt-3">
                                            <span className="flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                Sent {new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            {request.signedAt && (
                                                <span className="flex items-center gap-1.5 text-emerald-600">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Signed {new Date(request.signedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Actions */}
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {request.status !== 'signed' && request.status !== 'declined' && (
                                            <button
                                                onClick={() => copyLink(request.accessToken, request._id)}
                                                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                                            >
                                                {copiedId === request._id ? (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                                        </svg>
                                                        Copy Link
                                                    </>
                                                )}
                                            </button>
                                        )}
                                        {request.signedDocumentUrl && (
                                            <a
                                                href={request.signedDocumentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                Download
                                            </a>
                                        )}
                                        <button
                                            onClick={() => handleDelete(request._id)}
                                            className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            title="Delete request"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
