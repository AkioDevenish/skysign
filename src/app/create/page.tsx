'use client';

import { useState, useRef, useCallback } from 'react';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { UserButton, useUser } from '@clerk/nextjs';
import SignaturePreview from '@/components/SignaturePreview';
import SignatureGallery from '@/components/SignatureGallery';
import TemplateGallery from '@/components/TemplateGallery';
import { signPdf } from '@/utils/pdfUtils';
import { saveSignature, canSaveMore } from '@/lib/signatureStorage';
import { logAuditEntry } from '@/lib/auditTrail';
import SignaturePlacer from '@/components/SignaturePlacer';
import FieldPlacer, { Field } from '@/components/FieldPlacer';
import SignerManager, { Signer } from '@/components/SignerManager';
import SharingDialog from '@/components/SharingDialog';

// Dynamic import for DocumentLayer (SSR false)
const DocumentLayer = dynamic<any>(() => import('@/components/DocumentLayer'), {
    ssr: false,
    loading: () => (
        <div className="absolute inset-0 flex items-center justify-center text-stone-400">
            Loading Viewer...
        </div>
    )
});

// Dynamic import for SignatureCreator to avoid SSR issues
const SignatureCreator = dynamic(
    () => import('@/components/SignatureCreator'),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-[400px] flex items-center justify-center rounded-2xl bg-stone-100 border border-stone-200">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-stone-500">Loading signature tools...</p>
                </div>
            </div>
        )
    }
);

// Sidebar menu items
const sidebarItems = [
    {
        id: 'create',
        label: 'Create Signature',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
        ),
        tier: 'free',
    },
    {
        id: 'signatures',
        label: 'My Signatures',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
        ),
        tier: 'pro',
    },
    {
        id: 'templates',
        label: 'Templates',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
        ),
        tier: 'pro',
    },
    {
        id: 'export',
        label: 'Export Options',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
        ),
        tier: 'pro',
    },
    {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        tier: 'free',
    },
];

const tierBadgeColors = {
    free: 'bg-stone-100 text-stone-600',
    pro: 'bg-amber-100 text-amber-700',
    team: 'bg-purple-100 text-purple-700',
};

export default function CreatePage() {
    const { user } = useUser();
    const [savedSignature, setSavedSignature] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [documentFile, setDocumentFile] = useState<File | null>(null);
    const [docDims, setDocDims] = useState<{ width: number; height: number } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('create');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [galleryKey, setGalleryKey] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [signers, setSigners] = useState<Signer[]>([]);
    const [fields, setFields] = useState<Field[]>([]);
    const [placementMode, setPlacementMode] = useState(false);
    const [showSharing, setShowSharing] = useState(false);
    const [signedBlob, setSignedBlob] = useState<Blob | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // For now, defaulting to 'free' tier - would come from user metadata in real implementation
    const plan = (user?.publicMetadata?.plan as string) || 'free';

    // Refresh gallery after saving
    const refreshGallery = useCallback(() => {
        setGalleryKey(prev => prev + 1);
    }, []);

    const handleSave = async (dataUrl: string) => {
        setSavedSignature(dataUrl);
        if (documentFile) {
            setPlacementMode(true);
        } else {
            // Save to storage first
            if (canSaveMore(plan)) {
                const result = saveSignature(dataUrl, undefined, undefined, plan);
                if (result && 'error' in result) {
                    alert(result.error);
                } else {
                    refreshGallery();
                }
            } else {
                alert('Free plan limit reached (5 signatures). Upgrade to Pro for unlimited!');
            }
            setShowPreview(true);
        }
    };

    const handleFinalize = async () => {
        if (!documentFile || !savedSignature || !containerRef.current) return;

        try {
            setIsSaving(true);
            const { clientWidth, clientHeight, scrollTop } = containerRef.current;

            const auditEntry = logAuditEntry('signed', undefined, documentFile.name);

            const signedPdfBytes = await signPdf(
                documentFile,
                savedSignature,
                { width: clientWidth, height: clientHeight },
                currentPage,
                -scrollTop,
                user?.fullName || 'Anonymous Signer',
                auditEntry.id
            );

            const blob = new Blob([signedPdfBytes as BlobPart], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `signed_${documentFile.name}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setPlacementMode(false);
            setSavedSignature(null);
            setIsSaving(false);
            setSignedBlob(blob);
            setShowSharing(true);
        } catch (error) {
            console.error("Error signing PDF:", error);
            alert("Failed to sign PDF");
            setIsSaving(false);
        }
    };

    const handleClear = () => {
        setSavedSignature(null);
    };

    const handleRetry = () => {
        setShowPreview(false);
        setSavedSignature(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setDocumentFile(e.target.files[0]);
        }
    };

    const handleSectionClick = (sectionId: string, tier: string, href?: string) => {
        // If item has href, navigate to that page
        if (href) {
            window.open(href, '_self');
            return;
        }

        if (tier !== 'free' && plan === 'free') {
            // Show upgrade prompt for premium features
            alert(`This feature requires a ${tier.charAt(0).toUpperCase() + tier.slice(1)} plan. Upgrade to access it!`);
            return;
        }
        setActiveSection(sectionId);
    };

    return (
        <main className="min-h-screen bg-stone-50 flex">
            {/* Hidden File Input */}
            <input
                type="file"
                accept="application/pdf"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Mobile Menu Toggle */}
            <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="fixed top-4 left-4 z-50 md:hidden p-3 bg-white rounded-xl shadow-lg border border-stone-200"
            >
                <svg className="w-6 h-6 text-stone-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {mobileMenuOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button>

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full bg-white border-r border-stone-200 z-40 transition-all duration-300 
                    ${sidebarCollapsed ? 'w-16' : 'w-64'}
                    ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
            >
                {/* Sidebar Header */}
                <div className={`h-20 flex items-center border-b border-stone-200 ${sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg
                                className="w-5 h-5 text-stone-50"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
                                />
                            </svg>
                        </div>
                        {!sidebarCollapsed && (
                            <span className="text-xl font-semibold tracking-tight text-stone-900">Sky Sign</span>
                        )}
                    </Link>
                    {!sidebarCollapsed && (
                        <button
                            onClick={() => setSidebarCollapsed(true)}
                            className="p-2 rounded-lg hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-600"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Sidebar Navigation */}
                <nav className="p-3 space-y-1">
                    {sidebarItems.map((item) => {
                        const isLocked = item.tier !== 'free' && plan === 'free';
                        const isActive = activeSection === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleSectionClick(item.id, item.tier, (item as { href?: string }).href)}
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-stone-900 text-white'
                                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                                    } ${sidebarCollapsed ? 'justify-center' : ''}`}
                            >
                                <span className={isLocked ? 'opacity-50' : ''}>{item.icon}</span>
                                {!sidebarCollapsed && (
                                    <>
                                        <span className={`font-medium flex-1 text-left ${isLocked ? 'opacity-50' : ''}`}>
                                            {item.label}
                                        </span>
                                        {item.tier !== 'free' && (
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${tierBadgeColors[item.tier as keyof typeof tierBadgeColors]}`}>
                                                {item.tier.toUpperCase()}
                                            </span>
                                        )}
                                        {isLocked && (
                                            <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        )}
                                    </>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Expand button when collapsed */}
                {sidebarCollapsed && (
                    <div className="p-3">
                        <button
                            onClick={() => setSidebarCollapsed(false)}
                            className="w-full p-2 rounded-lg hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-600 flex justify-center"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}

                {!sidebarCollapsed && (
                    <div className="px-3 py-4">
                        <SignerManager
                            signers={signers}
                            onSignersChange={setSigners}
                            currentUserId={user?.id}
                        />
                    </div>
                )}

                {/* Import PDF Button */}
                <div className="absolute bottom-24 left-0 right-0 px-3">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border border-dashed border-stone-300 text-stone-600 hover:bg-stone-50 hover:border-stone-400 transition-all ${sidebarCollapsed ? 'justify-center' : ''
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {!sidebarCollapsed && (
                            <span className="font-medium">
                                {documentFile ? 'Change PDF' : 'Import PDF'}
                            </span>
                        )}
                    </button>
                </div>

                {/* User Section */}
                <div className={`absolute bottom-0 left-0 right-0 p-3 border-t border-stone-200 bg-white flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <UserButton
                        appearance={{
                            elements: {
                                avatarBox: {
                                    width: '36px',
                                    height: '36px',
                                },
                            },
                        }}
                    />
                    {!sidebarCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-stone-900 truncate">
                                {user?.firstName || 'User'}
                            </p>
                            <p className="text-xs text-stone-500 truncate">
                                {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
                            </p>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 md:${sidebarCollapsed ? 'ml-16' : 'ml-64'} ml-0`}>
                {/* Top Navigation */}
                <nav className="fixed top-0 right-0 bg-stone-50/90 backdrop-blur-md z-30 border-b border-stone-200/60 transition-all duration-300"
                    style={{ left: sidebarCollapsed ? '64px' : '256px' }}
                >
                    <div className="px-8 py-5 flex items-center justify-between w-full">
                        <div>
                            <h1 className="text-xl font-semibold text-stone-900">
                                {documentFile ? 'Sign Your Document' : 'Create Your Signature'}
                            </h1>
                            <p className="text-sm text-stone-500">
                                {documentFile
                                    ? (placementMode ? 'Drag signature to desired position' : 'Draw your signature over the document')
                                    : 'Point your index finger at the camera and draw in the air'}
                            </p>
                        </div>
                        {placementMode && (
                            <button
                                onClick={handleFinalize}
                                disabled={isSaving}
                                className="px-6 py-2 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center gap-2"
                            >
                                {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                                Finalize & Download
                            </button>
                        )}
                    </div>
                </nav>

                {/* Main content area */}
                <div className={`pt-28 pb-16 px-8 ${activeSection === 'create' && !documentFile ? 'min-h-screen flex items-center justify-center' : ''}`}>
                    {/* My Signatures Gallery View */}
                    {activeSection === 'signatures' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden"
                        >
                            <SignatureGallery
                                key={galleryKey}
                                onRefresh={refreshGallery}
                                onSelect={(sig) => {
                                    // Could be used to apply a saved signature
                                    console.log('Selected signature:', sig.name);
                                }}
                            />
                        </motion.div>
                    )}

                    {/* Templates Gallery View */}
                    {activeSection === 'templates' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden"
                        >
                            <TemplateGallery
                                plan={plan as 'free' | 'pro' | 'team'}
                                onSelect={(template) => {
                                    console.log('Selected template:', template.name);
                                    // Switch to create section to apply template
                                    setActiveSection('create');
                                }}
                            />
                        </motion.div>
                    )}

                    {/* Signature capture area - show when on create section */}
                    {activeSection === 'create' && !documentFile && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl border border-stone-200 shadow-lg overflow-hidden w-full max-w-2xl"
                        >
                            <SignatureCreator
                                onSave={handleSave}
                                onClear={handleClear}
                                strokeColor="#1c1917"
                                strokeWidth={3}
                                isOverlayMode={false}
                            />
                        </motion.div>
                    )}

                    {/* Document signing mode */}
                    {activeSection === 'create' && documentFile && (
                        <motion.div
                            ref={containerRef}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative bg-white rounded-3xl border border-stone-200 shadow-lg overflow-y-auto overflow-x-hidden"
                            style={{ height: '600px' }}
                        >
                            <div
                                className="relative w-full"
                                style={{ minHeight: '100%' }}
                            >
                                <div className="w-full">
                                    <DocumentLayer
                                        file={documentFile}
                                        onLoad={setDocDims}
                                        onPageChange={(p: number, t: number) => {
                                            setCurrentPage(p);
                                            setTotalPages(t);
                                        }}
                                        initialPage={currentPage}
                                    />
                                </div>

                                {docDims && (
                                    <div className="absolute inset-0 z-20 pointer-events-none">
                                        <FieldPlacer
                                            containerWidth={docDims.width}
                                            containerHeight={docDims.height}
                                            onFieldsChange={setFields}
                                            userName={user?.fullName || ''}
                                        />

                                        {savedSignature && placementMode && (
                                            <div className="pointer-events-auto">
                                                <SignaturePlacer
                                                    signatureDataUrl={savedSignature}
                                                    containerWidth={docDims.width}
                                                    containerHeight={docDims.height}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}



                    {/* Document indicator */}
                    {documentFile && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 flex items-center justify-center gap-3 text-sm text-stone-500"
                        >
                            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Document loaded: <strong className="text-stone-700">{documentFile.name}</strong></span>
                            <button
                                onClick={() => setDocumentFile(null)}
                                className="text-stone-400 hover:text-stone-600 transition-colors"
                            >
                                Remove
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Signature preview modal */}
            <AnimatePresence>
                {showPreview && (
                    <SignaturePreview
                        signatureDataUrl={savedSignature}
                        onClose={() => setShowPreview(false)}
                        onRetry={handleRetry}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showSharing && (
                    <SharingDialog
                        pdfBlob={signedBlob}
                        documentName={documentFile?.name || 'signed_document.pdf'}
                        onClose={() => setShowSharing(false)}
                    />
                )}
            </AnimatePresence>
        </main>
    );
}

