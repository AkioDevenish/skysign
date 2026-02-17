'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { UserButton, useUser } from '@clerk/nextjs';
import SignaturePreview from '@/components/SignaturePreview';
import SignatureGallery from '@/components/SignatureGallery';
import { ContractTemplatePicker } from '@/components/ContractTemplatePicker';
import { signPdf } from '@/utils/pdfUtils';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { ContractTemplate } from '@/lib/contractTemplates';
// import { saveSignature, canSaveMore } from '@/lib/signatureStorage'; // Deprecated
// import { logAuditEntry } from '@/lib/auditTrail'; // Deprecated
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import SignaturePlacer from '@/components/SignaturePlacer';
import FieldPlacer, { Field } from '@/components/FieldPlacer';
import SignerManager, { Signer } from '@/components/SignerManager';
import SharingDialog from '@/components/SharingDialog';
import LimitModal from '@/components/LimitModal';
import { useToast } from '@/components/ToastProvider';

import SendForSignatureModal from '@/components/SendForSignatureModal';
import SignatureRequestsDashboard from '@/components/SignatureRequestsDashboard';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import UpgradeButton from '@/components/UpgradeButton';

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
        label: 'Signatures',
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
        id: 'my-templates',
        label: 'My Templates',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
        ),
        tier: 'free',
    },
    {
        id: 'export',
        label: 'Export',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
        ),
        tier: 'pro',
    },
    {
        id: 'requests',
        label: 'Requests',
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
    pro: 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100',
    team: 'bg-gradient-to-r from-purple-50 to-fuchsia-50 text-purple-700 border border-purple-100',
};

export default function CreatePage() {
    const { user } = useUser();
    const [savedSignature, setSavedSignature] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [documentFile, setDocumentFile] = useState<File | null>(null);
    const [docDims, setDocDims] = useState<{ width: number; height: number } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('create');
    const [showSigners, setShowSigners] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [galleryKey, setGalleryKey] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [_totalPages, setTotalPages] = useState(1);
    const [signers, setSigners] = useState<Signer[]>([]);
    const [templatesExpanded, setTemplatesExpanded] = useState(false);
    const [_fields, setFields] = useState<Field[]>([]);
    const [placementMode, setPlacementMode] = useState(false);
    const [showSharing, setShowSharing] = useState(false);
    const [signedBlob, setSignedBlob] = useState<Blob | null>(null);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [currentSignatureId, setCurrentSignatureId] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [showSendModal, setShowSendModal] = useState(false);
    const [currentStorageId, setCurrentStorageId] = useState<string | null>(null);
    const { toast } = useToast();

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

    const upgradeTarget = plan === 'free' ? 'pro' : plan === 'pro' ? 'proplus' : null;
    const upgradeLabel = plan === 'free' ? 'Upgrade to Pro' : 'Upgrade to Pro Plus';

    // Refresh gallery after saving
    const refreshGallery = useCallback(() => {
        setGalleryKey(prev => prev + 1);
    }, []);

    const generateUploadUrl = useMutation(api.signatures.generateUploadUrl);
    const generateAudit = useAction(api.audit.generate);

    const handleTemplateSelect = async (template: ContractTemplate, content: string) => {
        try {
            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            
            // Minimal PDF generation logic
            const page = pdfDoc.addPage([595, 842]);
            const { height } = page.getSize();
            
            page.drawText(template.name, { x: 50, y: height - 50, size: 20, font });
            
            const fontSize = 12;
            const lineHeight = 15;
            let y = height - 100;
            
            // Very naive HTML stripping and line splitting
            const lines = content
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<[^>]+>/g, '')
                .split('\n');
                
            for (const line of lines) {
                if (y < 50) {
                     // In a real implementation, add new page
                     break;
                }
                const trimmed = line.trim();
                // Simple wrapping logic could go here
                if (trimmed) {
                    page.drawText(trimmed.substring(0, 90), { x: 50, y, size: fontSize, font });
                    y -= lineHeight;
                }
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
            const file = new File([blob], `${template.name.replace(/\s+/g, '_')}.pdf`, { type: 'application/pdf' });
            
            setDocumentFile(file);
            setActiveSection('create');
        } catch (e) {
            console.error(e);
            toast('Failed to load template', 'error');
        }
    };

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
                    toast(`Failed to save signature: ${msg}`, 'error');
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
            toast('Failed to sign PDF. Please try again.', 'error');
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
            toast(`${tier.charAt(0).toUpperCase() + tier.slice(1)} features require a Pro plan.`, 'info');
            return;
        }

        // Toggle templates expansion logic
        if (sectionId === 'templates') {
            if (activeSection !== 'templates') {
                setActiveSection(sectionId);
                setTemplatesExpanded(true);
            } else {
                setTemplatesExpanded(prev => !prev);
            }
            return;
        }

        if (sectionId === 'my-templates') {
             setTemplatesExpanded(true);
        }

        setActiveSection(sectionId);
    };

    return (
        <div className="flex flex-col min-h-screen bg-stone-50 font-sans text-stone-900">
            <Navbar hideCreateButton={true} />
            {/* Hidden File Input */}
            <input
                type="file"
                accept="application/pdf"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Main Layout Wrapper */}
            <div className="flex flex-1 w-full pt-16">
            <div className="flex w-full">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 flex-col bg-stone-50 flex-shrink-0 z-30 min-h-[calc(100vh-4rem)] relative">
                <nav className="px-3 py-6 space-y-1 pb-48">
                    {sidebarItems.map((item) => {
                         const isLocked = item.tier !== 'free' && plan === 'free';
                         const isActive = activeSection === item.id;
                         
                         // Hide sub-items if not expanded
                         if (item.id === 'my-templates' && !templatesExpanded) return null;

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleSectionClick(item.id, item.tier, (item as { href?: string }).href)}
                                className={`w-full flex items-center gap-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer group relative outline-none ${item.id === 'my-templates' ? 'pl-10 pr-3' : 'px-3'} ${isActive
                                    ? 'text-stone-900'
                                    : 'text-stone-500 hover:text-stone-900'
                                    } ${isLocked ? 'opacity-50' : ''}`}
                            >
                                <span className={isActive ? 'text-stone-900' : 'text-stone-400 group-hover:text-stone-600 transition-colors'}>
                                    {item.icon}
                                </span>
                                <span className={`flex-1 text-left ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
                                {item.tier !== 'free' && (
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${tierBadgeColors[item.tier as keyof typeof tierBadgeColors]}`}>
                                        {item.tier}
                                    </span>
                                )}
                                {item.id === 'templates' && (
                                    <svg className={`w-4 h-4 ml-auto text-stone-400 transition-transform duration-200 ${templatesExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                )}
                            </button>
                        );
                    })}
                </nav>



                {upgradeTarget && (
                    <div className="fixed bottom-0 left-0 w-64 p-4 bg-stone-50 z-40">
                        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
                            <h3 className="font-bold text-sm text-stone-900 mb-1">{upgradeLabel}</h3>
                            <p className="text-xs text-stone-500 mb-3 leading-relaxed">
                                {upgradeTarget === 'pro'
                                    ? 'Get unlimited signatures & more.'
                                    : 'Unlock team access & API.'}
                            </p>
                            <UpgradeButton
                                planId={upgradeTarget}
                                label={upgradeLabel}
                                className="w-full py-2 bg-stone-900 text-white rounded-lg text-xs font-bold hover:bg-stone-700 transition-colors shadow-sm"
                            />
                        </div>
                    </div>
                )}
            </aside>

            {/* Content Wrapper */}
            <main className="flex-1 flex flex-col min-w-0 bg-stone-50">

            {/* Mobile Header */}
            <header className="md:hidden h-16 bg-white border-b border-stone-200 flex items-center justify-between px-4 z-40 flex-shrink-0">
                 <Link href="/" className="flex items-center gap-2">
                    <span className="text-xl font-semibold tracking-tight text-stone-900">SkySign</span>
                </Link>
                <div className="flex items-center gap-3">
                    <UserButton />
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {mobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </header>

             {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-stone-200 z-50 overflow-hidden shadow-xl"
                    >
                         <nav className="p-4 space-y-2">
                            {sidebarItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        handleSectionClick(item.id, item.tier, (item as { href?: string }).href);
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeSection === item.id
                                        ? 'bg-stone-100 text-stone-900'
                                        : 'text-stone-500 hover:bg-stone-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {item.icon}
                                        {item.label}
                                    </div>
                                    {item.tier !== 'free' && (
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${tierBadgeColors[item.tier as keyof typeof tierBadgeColors]}`}>
                                            {item.tier}
                                        </span>
                                    )}
                                </button>
                            ))}
                            {/* Create/Import Mobile Button */}
                            <button 
                                onClick={() => {
                                    fileInputRef.current?.click();
                                    setMobileMenuOpen(false);
                                }}
                                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-stone-100 text-stone-900 font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                Import PDF
                            </button>

                            {upgradeTarget && (
                                <div className="mt-4 pt-4 border-t border-stone-200">
                                    <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                                        <p className="text-xs text-stone-500 mb-3 font-medium">
                                            {upgradeTarget === 'pro'
                                                ? 'Unlock unlimited signatures.'
                                                : 'Get team access & API features.'}
                                        </p>
                                        <UpgradeButton
                                            planId={upgradeTarget}
                                            label={upgradeLabel}
                                            className="w-full py-3 bg-stone-900 text-white rounded-xl font-medium shadow-sm"
                                        />
                                    </div>
                                </div>
                            )}
                         </nav>
                    </motion.div>
                )}
            </AnimatePresence>



            {/* Inner Content Wrapper */}
            <div className="flex-1 flex relative">
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-h-[calc(100vh-4rem)]">
                     <div className="max-w-7xl mx-auto flex flex-col w-full h-full p-4 md:p-8">
                    {/* Section Header (Optional/Contextual) */}
                    {(documentFile || activeSection !== 'create') && (
                        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-stone-900">
                                    {activeSection === 'signatures' ? 'Signatures'
                                        : (activeSection === 'templates' || activeSection === 'my-templates') ? 'Templates'
                                        : activeSection === 'export' ? 'Export'
                                        : activeSection === 'requests' ? 'Requests'
                                        : documentFile ? 'Sign Your Document' : 'Create Your Signature'}
                                </h1>
                                <p className="text-stone-500 mt-1">
                                    {documentFile
                                        ? (placementMode ? 'Drag signature to desired position' : 'Draw your signature over the document')
                                        : activeSection === 'signatures' ? 'View and manage your saved signatures'
                                        : (activeSection === 'templates' || activeSection === 'my-templates') ? 'Choose from pre-built contract templates'
                                        : activeSection === 'requests' ? 'Track documents sent for signature'
                                        : activeSection === 'create' ? 'Create a new signature from scratch' : ''}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                 {/* Import Button moved here for desktop */}
                                 {activeSection === 'create' && !documentFile && (
                                     <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-5 py-2.5 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-stone-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                        Import PDF
                                    </button>
                                 )}

                                {/* Primary Action Button (Finalize) */}
                                {placementMode && documentFile && (
                                <button
                                    onClick={handleFinalize}
                                    disabled={isSaving}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full font-medium hover:from-blue-700 hover:to-blue-600 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20"
                                >
                                    {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                                    Finalize & Download
                                </button>
                            )}
                        </div>
                        </div>
                    )}

                    {/* Content Views */}
                    <div className="flex-1 flex flex-col min-h-0">
                        {/* My Signatures */}
                        {activeSection === 'signatures' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden"
                            >
                                <SignatureGallery
                                    key={galleryKey}
                                    onRefresh={refreshGallery}
                                    onSelect={(sig) => {}}
                                />
                            </motion.div>
                        )}

                        {/* Templates */}
                        {(activeSection === 'templates' || activeSection === 'my-templates') && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden h-full flex flex-col"
                            >
                                <ContractTemplatePicker
                                    isPro={isPro}
                                    embedded={true}
                                    onSelect={handleTemplateSelect}
                                    initialCategory={activeSection === 'my-templates' ? 'my-templates' : null}
                                />
                            </motion.div>
                        )}

                        {/* Sent Requests */}
                        {activeSection === 'requests' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden"
                            >
                                <SignatureRequestsDashboard />
                            </motion.div>
                        )}

                        {/* Export Options */}
                        {activeSection === 'export' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.99 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="max-w-4xl mx-auto w-full"
                            >
                                    <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
                                    {/* Export content preserved from original */}
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
                                                            : 'bg-white border-stone-200 hover:border-blue-500 hover:ring-1 hover:ring-blue-500 hover:shadow-md cursor-pointer group'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-bold text-stone-900 group-hover:text-blue-600 transition-colors">{fmt}</span>
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
                                                <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-600 transition-colors shadow-lg shadow-blue-500/20 cursor-pointer w-full max-w-xs">
                                                    Download File
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Signature Creator (Default View) */}
                        {activeSection === 'create' && !documentFile && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="w-full max-w-7xl mx-auto flex flex-col"
                                style={{ minHeight: '600px' }}
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

                        {/* Document Signing View */}
                        {activeSection === 'create' && documentFile && (
                            <motion.div
                                ref={containerRef}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative bg-white rounded-2xl border border-stone-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                                style={{ minHeight: '600px' }}
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

                        {/* Document Info Footer when file loaded */}
                        {documentFile && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-4 flex items-center justify-center gap-3 text-sm text-stone-500"
                            >
                                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Active Document: <strong className="text-stone-700">{documentFile.name}</strong></span>
                                <button
                                    onClick={() => setDocumentFile(null)}
                                    className="text-stone-400 hover:text-red-500 transition-colors cursor-pointer text-xs underline"
                                >
                                    Remove
                                </button>
                            </motion.div>
                        )}
                </div>
                </div>
                {/* Vertical Signers Tab (Visible when sidebar is closed) */}

                </div>

                {/* Vertical Signers Tab (Visible when sidebar is closed) */}
                {!showSigners && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 z-30">
                         <button
                            onClick={() => setShowSigners(true)}
                            className="bg-white border-l border-t border-b border-stone-200 shadow-[0_4px_20px_rgba(0,0,0,0.08)] rounded-l-2xl py-6 px-1.5 flex flex-col items-center gap-4 text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-all cursor-pointer group translate-x-1 hover:translate-x-0"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="text-[10px] font-bold uppercase tracking-widest [writing-mode:vertical-rl] rotate-180 opacity-60 group-hover:opacity-100 transition-opacity">
                                Signers
                            </span>
                        </button>
                    </div>
                )}

                {/* Right Sidebar for Signers */}
                <AnimatePresence>
                    {showSigners && (
                        <motion.aside
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 320, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="bg-white border-l border-stone-200 h-full flex flex-col flex-shrink-0 z-20 shadow-xl md:shadow-none"
                        >
                            <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-stone-50/50">
                                <h3 className="font-semibold text-stone-900">Manage Signers</h3>
                                <button onClick={() => setShowSigners(false)} className="p-1 hover:bg-stone-200 rounded-lg text-stone-500 transition-colors cursor-pointer">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                             <div className="flex-1 overflow-y-auto p-4">
                                 <SignerManager
                                    signers={signers}
                                    onSignersChange={setSigners}
                                    currentUserId={user?.id}
                                />
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            </div>
            </main>
            </div>
            </div>

            <Footer />

            {/* Modals & Dialogs */}
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
        </div>
    );
}
