'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Id } from '../../convex/_generated/dataModel';
import { useToast } from './ToastProvider';

const statusConfig = {
    pending: { 
        color: 'bg-gradient-to-r from-amber-400 to-orange-400',
        lightBg: 'bg-amber-50/80',
        text: 'text-amber-700',
        border: 'border-amber-200/60',
        label: 'Awaiting Signature',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    viewed: { 
        color: 'bg-gradient-to-r from-blue-400 to-indigo-400',
        lightBg: 'bg-blue-50/80',
        text: 'text-blue-700',
        border: 'border-blue-200/60',
        label: 'Viewed',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
        ),
    },
    signed: { 
        color: 'bg-gradient-to-r from-emerald-400 to-green-400',
        lightBg: 'bg-emerald-50/80',
        text: 'text-emerald-700',
        border: 'border-emerald-200/60',
        label: 'Completed',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    declined: { 
        color: 'bg-gradient-to-r from-red-400 to-rose-400',
        lightBg: 'bg-red-50/80',
        text: 'text-red-700',
        border: 'border-red-200/60',
        label: 'Declined',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    expired: { 
        color: 'bg-gradient-to-r from-stone-400 to-stone-500',
        lightBg: 'bg-stone-100/80',
        text: 'text-stone-500',
        border: 'border-stone-200/60',
        label: 'Expired',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
};

export default function SignatureRequestsDashboard() {
    const requests = useQuery(api.signatureRequests.getMySent);
    const stats = useQuery(api.signatureRequests.getStats);
    const removeRequest = useMutation(api.signatureRequests.remove);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const { confirm: confirmDialog } = useToast();

    const copyLink = async (token: string, id: string) => {
        const link = `${window.location.origin}/sign/${token}`;
        await navigator.clipboard.writeText(link);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDelete = async (id: Id<"signatureRequests">) => {
        const confirmed = await confirmDialog({
            title: 'Delete request',
            message: 'Are you sure you want to delete this signature request? This cannot be undone.',
            confirmLabel: 'Delete',
            destructive: true,
        });
        if (!confirmed) return;
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
            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
                    {[
                        { value: stats.total, label: 'Total Sent', accent: 'stone' },
                        { value: stats.pending, label: 'Pending', accent: 'amber' },
                        { value: stats.signed, label: 'Signed', accent: 'emerald' },
                        { value: stats.declined, label: 'Declined', accent: 'stone' },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="relative overflow-hidden bg-gradient-to-b from-stone-50 to-white rounded-2xl border border-stone-200/80 p-5"
                        >
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-stone-100/60 to-transparent rounded-bl-[2rem]" />
                            <p className="text-3xl font-bold text-stone-900 relative">{stat.value}</p>
                            <p className="text-[11px] text-stone-400 uppercase tracking-wider mt-1.5 font-semibold relative">{stat.label}</p>
                        </motion.div>
                    ))}
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
                        Create a signature and use the <span className="font-medium text-stone-700">&quot;Send for Signature&quot;</span> button to send documents for signing.
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
                <div className="space-y-3">
                    {requests.map((request, index: number) => {
                        const config = statusConfig[request.status as keyof typeof statusConfig] || statusConfig.pending;
                        return (
                            <motion.div
                                key={request._id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.04, duration: 0.3 }}
                                className="group bg-gradient-to-b from-stone-50/50 to-white border border-stone-200/80 rounded-2xl p-5 hover:shadow-md hover:border-stone-300/80 transition-all duration-300"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Status indicator — SVG icon instead of emoji */}
                                    <div className={`w-11 h-11 rounded-xl ${config.lightBg} ${config.text} flex items-center justify-center flex-shrink-0 border ${config.border}`}>
                                        {config.icon}
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-1.5">
                                            <div>
                                                <h4 className="font-semibold text-stone-900 text-base truncate">
                                                    {request.documentName}
                                                </h4>
                                                <p className="text-stone-400 text-sm">
                                                    To: <span className="font-medium text-stone-600">{request.recipientName || request.recipientEmail}</span>
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${config.lightBg} ${config.text} border ${config.border} whitespace-nowrap`}>
                                                {config.label}
                                            </span>
                                        </div>
                                        
                                        {/* Timeline */}
                                        <div className="flex items-center gap-4 text-xs text-stone-400 mt-2">
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
                                                className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer"
                                            >
                                                {copiedId === request._id ? (
                                                    <>
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                                                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                Download
                                            </a>
                                        )}
                                        {request.auditCertificateUrl && (
                                            <a
                                                href={request.auditCertificateUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3.5 py-2 bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md"
                                                title="Download Certificate of Completion"
                                            >
                                                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Certificate
                                            </a>
                                        )}
                                        <button
                                            onClick={() => handleDelete(request._id)}
                                            className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                                            title="Delete request"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
