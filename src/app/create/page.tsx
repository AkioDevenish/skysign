'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { UserButton, useUser } from '@clerk/nextjs';
import SignaturePreview from '@/components/SignaturePreview';
import SignatureGallery from '@/components/SignatureGallery';
import TemplateGallery from '@/components/TemplateGallery';
import { signPdf } from '@/utils/pdfUtils';
// import { saveSignature, canSaveMore } from '@/lib/signatureStorage'; // Deprecated
// import { logAuditEntry } from '@/lib/auditTrail'; // Deprecated
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import SignaturePlacer from '@/components/SignaturePlacer';
import FieldPlacer, { Field } from '@/components/FieldPlacer';
import SignerManager, { Signer } from '@/components/SignerManager';
import SharingDialog from '@/components/SharingDialog';
import LimitModal from '@/components/LimitModal';

import SendForSignatureModal from '@/components/SendForSignatureModal';
import SignatureRequestsDashboard from '@/components/SignatureRequestsDashboard';

// Dynamic import for DocumentLayer (SSR false)
const DocumentLayer = dynamic(() => import('@/components/DocumentLayer'), {
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
        tier: 'free',
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
        id: 'requests',
        label: 'Sent Requests',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
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
    const [_totalPages, setTotalPages] = useState(1);
    const [signers, setSigners] = useState<Signer[]>([]);
    const [_fields, setFields] = useState<Field[]>([]);
    const [placementMode, setPlacementMode] = useState(false);
    const [showSharing, setShowSharing] = useState(false);
    const [signedBlob, setSignedBlob] = useState<Blob | null>(null);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [currentSignatureId, setCurrentSignatureId] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [showSendModal, setShowSendModal] = useState(false);
    const [currentStorageId, setCurrentStorageId] = useState<string | null>(null);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Convex Mutations
    const createSig = useMutation(api.signatures.create);
    const signatureCount = useQuery(api.signatures.getCount);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // For now, defaulting to 'free' tier - would come from user metadata in real implementation
    const plan = (user?.publicMetadata?.plan as string) || 'free';
    const isPro = plan === 'pro' || plan === 'proplus';

    // Refresh gallery after saving
    const refreshGallery = useCallback(() => {
        setGalleryKey(prev => prev + 1);
    }, []);

    const generateUploadUrl = useMutation(api.signatures.generateUploadUrl);
    const generateAudit = useAction(api.audit.generate);

    const handleSave = async (dataUrl: string) => {
        setSavedSignature(dataUrl);
        if (documentFile) {
            setPlacementMode(true);
        } else {
            // Save to Convex
            try {
                // Check limits
                if (plan === 'free' && (signatureCount ?? 0) >= 5) {
                    setShowLimitModal(true);
                    return;
                }

                // 1. Convert Data URL to Blob
                const res = await fetch(dataUrl);
                const blob = await res.blob();

                // 2. Generate Upload URL
                const postUrl = await generateUploadUrl();

                // 3. Upload File
                const result = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": blob.type },
                    body: blob,
                });
                const { storageId } = await result.json();

                // 4. Save Signature with Storage ID
                const newSignatureId = await createSig({
                    name: `Signature ${new Date().toLocaleString()}`,
                    storageId,
                    plan,
                    userAgent: navigator.userAgent,
                });
                
                // Store IDs for send feature and audit trail
                setCurrentSignatureId(newSignatureId);
                setCurrentStorageId(storageId);

                refreshGallery();
                setShowPreview(true);
            } catch (error: unknown) {
                const msg = error instanceof Error ? error.message : String(error);
                if (msg && msg.includes('Free plan limit reached')) {
                    setShowLimitModal(true);
                } else {
                    console.error("Save error:", msg); // Log full error in console
                    alert(`Failed to save signature: ${msg}`);
                }
            }
        }
    };

    const handleFinalize = async () => {
        if (!documentFile || !savedSignature || !containerRef.current) return;

        try {
            setIsSaving(true);
            const { clientWidth, clientHeight, scrollTop } = containerRef.current;

            // Generate Audit Trail (Server-Side)
            // We use the signature ID created during the 'Save' step
            let auditStorageId = null;
            if (currentSignatureId) {
                 try {
                    auditStorageId = await generateAudit({
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        signatureId: currentSignatureId as unknown as Parameters<typeof generateAudit>[0]['signatureId'],
                        signerName: user?.fullName || 'Authenticated User',
                        signerEmail: user?.primaryEmailAddress?.emailAddress,
                        ipAddress: 'Recorded', // Real IP would be captured by info() in action if accessed via HTTP, or client passes it
                        userAgent: navigator.userAgent,
                        timestamp: new Date().toISOString(),
                    });
                 } catch (e) {
                     console.error("Failed to generate audit trail:", e);
                 }
            }

            const auditId = auditStorageId || `audit_${Date.now()}`;

            const signedPdfBytes = await signPdf(
                documentFile,
                savedSignature,
                { width: clientWidth, height: clientHeight },
                currentPage,
                -scrollTop,
                user?.fullName || 'Anonymous Signer',
                auditId
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
            // We pass the currentSignatureId to the dialog so it can fetch the Audit Trail URL
            // (The auditStorageId is stored on the signature record)
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
            // Show coming soon prompt for premium features
            alert(`The ${tier.charAt(0).toUpperCase() + tier.slice(1)} features are coming soon!`);
            return;
        }
        setActiveSection(sectionId);
    };

    return (
        <main className="min-h-screen bg-stone-50 flex">
            {/* Subtle background pattern for visual depth */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-stone-200/30 via-transparent to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-[30%] w-[500px] h-[500px] bg-gradient-to-tr from-amber-100/20 via-transparent to-transparent rounded-full blur-3xl" />
            </div>
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
                className="fixed top-4 left-4 z-50 md:hidden p-3 bg-white rounded-xl shadow-lg border border-stone-200 cursor-pointer"
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

            {/* Sidebar - always expanded on mobile when open */}
            <aside
                className={`fixed top-0 left-0 h-full bg-white border-r border-stone-200 z-40
                    ${sidebarCollapsed && !mobileMenuOpen ? 'w-16' : 'w-64'}
                    ${mobileMenuOpen ? 'translate-x-0 transition-transform duration-300' : '-translate-x-full md:translate-x-0'}
                `}
            >
                {/* Sidebar Header */}
                <div className={`h-20 flex items-center border-b border-stone-200 ${sidebarCollapsed && !mobileMenuOpen ? 'justify-center px-2' : 'justify-between px-4'}`}>
                    <Link href="/" className="flex items-center gap-3">
                        {(!sidebarCollapsed || mobileMenuOpen) && (
                            <span className="text-xl font-bold tracking-tight text-stone-900">SkySign</span>
                        )}
                    </Link>
                    {(!sidebarCollapsed || mobileMenuOpen) && !isMobile && (
                        <button
                            onClick={() => setSidebarCollapsed(true)}
                            className="p-2 rounded-lg hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-600 cursor-pointer"
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
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer text-sm font-medium ${isActive
                                    ? 'bg-stone-900 text-white shadow-lg shadow-stone-900/10 scale-[1.02]'
                                    : 'text-stone-500 hover:bg-stone-100/80 hover:text-stone-900'
                                    } ${sidebarCollapsed && !mobileMenuOpen ? 'justify-center' : ''}`}
                            >
                                <span className={`${isLocked ? 'opacity-50' : ''} ${isActive ? 'text-stone-200' : 'text-stone-400 group-hover:text-stone-600'}`}>{item.icon}</span>
                                {(!sidebarCollapsed || mobileMenuOpen) && (
                                    <>
                                        <span className={`flex-1 text-left ${isLocked ? 'opacity-50' : ''}`}>
                                            {item.label}
                                        </span>
                                        {item.tier !== 'free' && (
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${tierBadgeColors[item.tier as keyof typeof tierBadgeColors]}`}>
                                                {item.tier}
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
                {sidebarCollapsed && !mobileMenuOpen && (
                    <div className="p-3">
                        <button
                            onClick={() => setSidebarCollapsed(false)}
                            className="w-full p-2 rounded-lg hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-600 flex justify-center cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}

                {(!sidebarCollapsed || mobileMenuOpen) && (
                    <div className="flex-1 overflow-hidden flex flex-col">
                        {/* Scrollable Signer Manager area */}
                        <div className="px-3 py-4 flex-1 overflow-y-auto">
                            <SignerManager
                                signers={signers}
                                onSignersChange={setSigners}
                                currentUserId={user?.id}
                            />
                        </div>
                        
                        {/* Import PDF Button - fixed at bottom of this section */}
                        <div className="px-3 py-3 border-t border-stone-100 bg-white mt-auto">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white border border-stone-200 text-stone-700 font-medium hover:bg-stone-50 hover:border-stone-300 transition-all cursor-pointer shadow-sm"
                            >
                                <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-3.5 h-3.5 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                </div>
                                <span className="text-sm">
                                    {documentFile ? 'Change PDF' : 'Import a PDF'}
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Import PDF Button - only show when sidebar is collapsed */}
                {(sidebarCollapsed && !mobileMenuOpen) && (
                    <div className="absolute bottom-[4.5rem] left-0 right-0 px-3">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex items-center justify-center px-3 py-3.5 rounded-2xl bg-white border border-stone-200 text-stone-700 font-medium hover:bg-stone-50 hover:border-stone-300 transition-all cursor-pointer shadow-sm"
                        >
                            <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                                <svg className="w-3.5 h-3.5 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                            </div>
                        </button>
                    </div>
                )}

                {/* User Section */}
                <div className={`absolute bottom-0 left-0 right-0 p-3 border-t border-stone-200 bg-white flex items-center ${sidebarCollapsed && !mobileMenuOpen ? 'justify-center' : 'gap-3'}`}>
                    <UserButton
                        userProfileMode="navigation"
                        userProfileUrl="/dashboard"
                        appearance={{
                            elements: {
                                avatarBox: {
                                    width: '36px',
                                    height: '36px',
                                },
                            },
                        }}
                    />
                    {(!sidebarCollapsed || mobileMenuOpen) && (
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
            <div
                className="flex-1 transition-all duration-300 w-full"
                style={{ marginLeft: isMobile ? '0px' : (sidebarCollapsed ? '64px' : '256px') }}
            >
                {/* Top Navigation - only show when document is loaded or in placement mode */}
                {(documentFile || activeSection !== 'create') && (
                    <nav className="fixed top-0 right-0 bg-stone-50/95 backdrop-blur-md z-30 border-b border-stone-200/60 transition-all duration-300"
                        style={{ left: isMobile ? '0px' : (sidebarCollapsed ? '64px' : '256px') }}
                    >
                        <div className="pl-16 pr-4 py-4 md:pl-8 md:pr-8 md:py-5 flex items-center justify-between w-full min-h-[60px]">
                            <div>
                                <h1 className="text-lg md:text-xl font-semibold text-stone-900">
                                    {activeSection === 'signatures' ? 'My Signatures'
                                        : activeSection === 'templates' ? 'Templates'
                                        : activeSection === 'export' ? 'Export Options'
                                        : activeSection === 'requests' ? 'Sent Requests'
                                        : documentFile ? 'Sign Your Document' : 'Create Your Signature'}
                                </h1>
                                <p className="text-xs md:text-sm text-stone-500 hidden sm:block">
                                    {documentFile
                                        ? (placementMode ? 'Drag signature to desired position' : 'Draw your signature over the document')
                                        : activeSection === 'signatures' ? 'View and manage your saved signatures'
                                        : activeSection === 'templates' ? 'Choose from pre-built contract templates'
                                        : activeSection === 'requests' ? 'Track documents sent for signature'
                                        : ''}
                                </p>
                            </div>
                            {placementMode && (
                                <button
                                    onClick={handleFinalize}
                                    disabled={isSaving}
                                    className="px-4 py-2 md:px-6 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center gap-2 cursor-pointer text-sm md:text-base"
                                >
                                    {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                                    <span className="hidden sm:inline">Finalize & Download</span>
                                    <span className="sm:hidden">Download</span>
                                </button>
                            )}
                        </div>
                    </nav>
                )}

                {/* Main content area */}
                <div className={`pb-4 px-4 md:pb-4 md:px-8 ${activeSection === 'create' && !documentFile ? 'pt-4 md:pt-4 h-screen flex flex-col items-center' : 'pt-24 md:pt-28'}`}>
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
                                    // Switch to create section to apply template
                                    setActiveSection('create');
                                }}
                            />
                        </motion.div>
                    )}

                    {/* Sent Requests View */}
                    {activeSection === 'requests' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 bg-white rounded-2xl md:rounded-3xl border border-stone-200/80 shadow-xl shadow-stone-200/50 overflow-hidden"
                        >
                            <SignatureRequestsDashboard />
                        </motion.div>
                    )}

                    {/* Signature capture area - show when on create section */}
                    {activeSection === 'create' && !documentFile && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            className="bg-white rounded-2xl md:rounded-3xl border border-stone-200/80 shadow-xl shadow-stone-200/50 overflow-hidden w-full max-w-5xl mx-auto flex flex-col"
                            style={{ height: 'calc(100dvh - 32px)' }}
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
                            className="relative bg-white rounded-3xl border border-stone-200 shadow-lg overflow-auto"
                            style={{ height: 'calc(100vh - 180px)' }}
                        >
                            <div
                                className="relative min-h-full"
                                style={{ height: docDims ? docDims.height : '100%' }}
                            >
                                <div className="absolute inset-0 z-0">
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
                                className="text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                            >
                                Remove
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Export Options Section */}
                {activeSection === 'export' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
                            <h2 className="text-xl font-semibold text-stone-900 mb-6">Export Options</h2>
                            <p className="text-stone-500 mb-8">
                                Choose a format to export your signature or document. Some formats require a Pro plan.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Format Selection */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-2">File Format</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['PNG', 'SVG', 'PDF', 'JSON'].map((fmt) => (
                                            <button
                                                key={fmt}
                                                disabled={!isPro && fmt !== 'PNG'}
                                                className={`p-4 rounded-xl text-left transition-all border ${!isPro && fmt !== 'PNG'
                                                    ? 'bg-stone-50 border-stone-100 opacity-60 cursor-not-allowed'
                                                    : 'bg-white border-stone-200 hover:border-stone-900 hover:shadow-md cursor-pointer group'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-bold text-stone-900 group-hover:text-stone-900">{fmt}</span>
                                                    {!isPro && fmt !== 'PNG' && (
                                                        <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wide">PRO</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-stone-500">
                                                    {fmt === 'PNG' && 'Standard image format (Transparent)'}
                                                    {fmt === 'SVG' && 'Vector format (Infinite scaling)'}
                                                    {fmt === 'PDF' && 'Document format (Print ready)'}
                                                    {fmt === 'JSON' && 'Full data backup (Import/Export)'}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Export Actions */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-2">Actions</h3>
                                    <div className="h-full p-6 bg-stone-50 rounded-2xl border border-stone-200 text-center flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-stone-100">
                                            <svg className="w-6 h-6 text-stone-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                        </div>
                                        <p className="text-sm text-stone-600 mb-6">
                                            Select a format on the left to export current signature.
                                        </p>
                                        <button className="px-8 py-3 bg-stone-900 text-white font-medium rounded-xl hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/10 cursor-pointer w-full max-w-xs">
                                            Download File
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

            </div>

            {/* Signature preview modal */}
            <AnimatePresence>
                            {showPreview && (
                    <SignaturePreview
                        signatureDataUrl={savedSignature}
                        onClose={() => setShowPreview(false)}
                        onRetry={handleRetry}
                        onSendForSignature={() => {
                            setShowPreview(false);
                            setShowSendModal(true);
                        }}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showSharing && (
                    <SharingDialog
                        pdfBlob={signedBlob}
                        documentName={documentFile?.name || 'signed_document.pdf'}
                        onClose={() => setShowSharing(false)}
                        signatureId={currentSignatureId}
                    />
                )}
                {showLimitModal && (
                    <LimitModal
                        isOpen={showLimitModal}
                        onClose={() => setShowLimitModal(false)}
                        plan={plan}
                    />
                )}
                {showSendModal && currentStorageId && (
                    <SendForSignatureModal
                        isOpen={showSendModal}
                        onClose={() => setShowSendModal(false)}
                        documentStorageId={currentStorageId as Parameters<typeof SendForSignatureModal>[0]['documentStorageId']}
                        documentName={`Signature ${new Date().toLocaleString()}`}
                    />
                )}
            </AnimatePresence>
        </main>
    );
}

