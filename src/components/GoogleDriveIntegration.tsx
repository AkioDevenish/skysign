'use client';

import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { FaGoogleDrive } from 'react-icons/fa';
import { useToast } from '@/components/ToastProvider';

interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    modifiedTime: string;
    webViewLink: string;
    thumbnailLink?: string;
}

interface GoogleDrivePickerProps {
    onFileSelect: (file: DriveFile) => void;
    onClose: () => void;
}

export function GoogleDrivePicker({ onFileSelect, onClose }: GoogleDrivePickerProps) {
    const { user } = useUser();
    const { toast } = useToast();
    const googleAccount = user?.externalAccounts?.find((acc) => acc.provider === 'google');
    const isGoogleConnected = googleAccount && googleAccount.approvedScopes?.includes('https://www.googleapis.com/auth/drive.readonly');
    const googleEmail = googleAccount?.emailAddress;
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [lastQuery, setLastQuery] = useState('');
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const loadFiles = async (query: string = '', isInitial: boolean = false) => {
        if (loading) return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/google/drive/upload?query=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            setFiles(data.files || []);
            setLastQuery(query);
            if (isInitial) setHasLoaded(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load files');
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        if (isConnecting) return;
        setIsConnecting(true);
        setError(null);
        
        // Fallback to reset connecting state after 10s if redirect fails
        const timeout = setTimeout(() => setIsConnecting(false), 10000);

        try {
            const scopes = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.readonly'];
            let account;
            if (googleAccount) {
                account = await googleAccount.reauthorize({
                    additionalScopes: scopes,
                    redirectUrl: window.location.href,
                });
            } else {
                account = await user?.createExternalAccount({
                    strategy: 'oauth_google',
                    additionalScopes: scopes,
                    redirectUrl: window.location.href,
                });
            }
            if (account?.verification?.externalVerificationRedirectURL) {
                window.location.href = account.verification.externalVerificationRedirectURL.href;
            } else {
                clearTimeout(timeout);
                setIsConnecting(false);
            }
        } catch (err: any) {
            clearTimeout(timeout);
            console.error('Failed to connect Google:', err);
            setError(err?.message || 'Failed to connect to Google Drive');
            toast(err?.message || 'Failed to connect Google Drive. Please check your Google Account settings.', 'error');
        } finally {
            clearTimeout(timeout);
            setIsConnecting(false);
        }
    };

    // Load files when connected
    useEffect(() => {
        if (isGoogleConnected && !hasLoaded && !loading && !error) {
            loadFiles('', true);
        }
    }, [isGoogleConnected, hasLoaded, loading, error]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-stone-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-stone-100 border border-stone-200 shadow-sm rounded-xl flex items-center justify-center">
                            <FaGoogleDrive className="w-6 h-6 text-stone-700" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-stone-900">Google Drive</h3>
                            {isGoogleConnected && (
                                <p className="text-xs text-stone-500">{googleEmail}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-5">
                    {!isGoogleConnected ? (
                        /* Not connected state */
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-stone-100 border border-stone-200 shadow-sm outline outline-4 outline-stone-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <FaGoogleDrive className="w-8 h-8 text-stone-400" />
                            </div>
                            <h4 className="text-lg font-semibold text-stone-900 mb-2">
                                Connect Google Drive
                            </h4>
                            <p className="text-stone-500 text-sm mb-6 max-w-sm mx-auto">
                                Import PDF documents directly from your Google Drive to sign them with SkySign.
                            </p>
                            <button
                                onClick={handleConnect}
                                disabled={isConnecting}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-stone-200 hover:border-stone-300 shadow-sm text-stone-700 hover:text-stone-900 rounded-xl font-medium transition-colors disabled:opacity-50"
                            >
                                <FaGoogleDrive className="w-5 h-5" />
                                {isConnecting ? 'Connecting...' : 'Connect Google Drive'}
                            </button>
                        </div>
                    ) : (
                        /* Connected - show files */
                        <>
                            {/* Search */}
                            <div className="relative mb-4">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search PDF files..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && loadFiles(searchQuery)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                                />
                            </div>

                            {/* File list */}
                            <div className="max-h-[400px] overflow-y-auto space-y-2">
                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="w-8 h-8 border-2 border-stone-200 border-t-stone-800 rounded-full animate-spin" />
                                    </div>
                                ) : error ? (
                                    <div className="text-center py-12">
                                        <p className="text-red-500 mb-4">{error}</p>
                                        <button
                                            onClick={() => loadFiles()}
                                            className="text-stone-900 underline"
                                        >
                                            Try again
                                        </button>
                                    </div>
                                ) : files.length === 0 ? (
                                    <div className="text-center py-12 text-stone-500">
                                        No PDF files found in your Drive
                                    </div>
                                ) : (
                                    files.map((file) => (
                                        <button
                                            key={file.id}
                                            disabled={downloadingId !== null}
                                            onClick={async () => {
                                                setDownloadingId(file.id);
                                                try {
                                                    await onFileSelect(file);
                                                } finally {
                                                    setDownloadingId(null);
                                                }
                                            }}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-stone-50 rounded-xl transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                                                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-stone-900 truncate">
                                                    {file.name}
                                                </p>
                                                <p className="text-xs text-stone-500">
                                                    Modified {new Date(file.modifiedTime).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {downloadingId === file.id ? (
                                                <div className="w-5 h-5 border-2 border-stone-200 border-t-stone-800 rounded-full animate-spin" />
                                            ) : (
                                                <svg className="w-5 h-5 text-stone-300 group-hover:text-stone-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

// Small button component for triggering Drive connection/picker
export function GoogleDriveButton({ onFileSelect }: { onFileSelect?: (file: DriveFile) => void }) {
    const { user } = useUser();
    const { toast } = useToast();
    const googleAccount = user?.externalAccounts?.find((acc) => acc.provider === 'google');
    const isGoogleConnected = googleAccount && googleAccount.approvedScopes?.includes('https://www.googleapis.com/auth/drive.readonly');
    const [showPicker, setShowPicker] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    const handleClick = async () => {
        if (isGoogleConnected) {
            setShowPicker(true);
        } else {
            if (isConnecting) return;
            setIsConnecting(true);
            
            const timeout = setTimeout(() => setIsConnecting(false), 10000);

            try {
                const scopes = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.readonly'];
                let account;
                if (googleAccount) {
                    account = await googleAccount.reauthorize({
                        additionalScopes: scopes,
                        redirectUrl: window.location.href,
                    });
                } else {
                    account = await user?.createExternalAccount({
                        strategy: 'oauth_google',
                        additionalScopes: scopes,
                        redirectUrl: window.location.href,
                    });
                }
                if (account?.verification?.externalVerificationRedirectURL) {
                    window.location.href = account.verification.externalVerificationRedirectURL.href;
                } else {
                    clearTimeout(timeout);
                    setIsConnecting(false);
                }
            } catch (err: any) {
                clearTimeout(timeout);
                console.error('Failed to connect Google:', err);
                setIsConnecting(false);
                toast(err?.message || 'Failed to connect Google Drive. Please try again.', 'error');
            }
        }
    };

    return (
        <>
            <button
                onClick={handleClick}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 hover:border-stone-300 rounded-xl text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors"
            >
                <FaGoogleDrive className="w-4 h-4" />
                {isGoogleConnected ? 'Import from Drive' : (isConnecting ? 'Connecting...' : 'Connect Drive')}
            </button>

            {showPicker && onFileSelect && (
                <GoogleDrivePicker
                    onFileSelect={(file) => {
                        onFileSelect(file);
                        setShowPicker(false);
                    }}
                    onClose={() => setShowPicker(false)}
                />
            )}
        </>
    );
}

// Settings section for Google Drive connection
export function GoogleDriveSettings() {
    const { user } = useUser();
    const { toast } = useToast();
    const googleAccount = user?.externalAccounts?.find((acc) => acc.provider === 'google');
    const isGoogleConnected = googleAccount && googleAccount.approvedScopes?.includes('https://www.googleapis.com/auth/drive.readonly');
    const [disconnecting, setDisconnecting] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    const handleDisconnect = async () => {
        if (!googleAccount) return;
        setDisconnecting(true);
        try {
            await googleAccount.destroy();
        } catch (err: any) {
            console.error('Failed to disconnect Google Drive:', err);
            if (err?.errors?.[0]?.code === 'external_account_not_found' || err?.message?.includes('verification')) {
                toast('This Google account is your primary login method. Visit your Google Account Security settings to remove access.', 'info');
            } else {
                toast('Failed to disconnect: ' + err.message, 'error');
            }
        } finally {
            setDisconnecting(false);
        }
    };

    return (
        <div className="p-6 bg-white border border-stone-200 rounded-2xl">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-stone-100 border border-stone-200 shadow-sm rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaGoogleDrive className="w-7 h-7 text-stone-600" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-stone-900">Google Drive</h3>
                    <p className="text-sm text-stone-500 mt-1">
                        Import documents from Drive and save signed files back automatically.
                    </p>

                    {isGoogleConnected ? (
                        <div className="mt-4">
                            <div className="flex items-center gap-2 text-sm text-emerald-600 mb-3">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Connected as {googleAccount.emailAddress}
                            </div>
                            <button
                                onClick={handleDisconnect}
                                disabled={disconnecting}
                                className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={async () => {
                                if (isConnecting) return;
                                setIsConnecting(true);
                                const timeout = setTimeout(() => setIsConnecting(false), 10000);
                                try {
                                    const scopes = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.readonly'];
                                    let account;
                                    if (googleAccount) {
                                        account = await googleAccount.reauthorize({
                                            additionalScopes: scopes,
                                            redirectUrl: window.location.href,
                                        });
                                    } else {
                                        account = await user?.createExternalAccount({
                                            strategy: 'oauth_google',
                                            additionalScopes: scopes,
                                            redirectUrl: window.location.href,
                                        });
                                    }
                                    if (account?.verification?.externalVerificationRedirectURL) {
                                        window.location.href = account.verification.externalVerificationRedirectURL.href;
                                    } else {
                                        clearTimeout(timeout);
                                        setIsConnecting(false);
                                    }
                                } catch (err: any) {
                                    clearTimeout(timeout);
                                    console.error('Failed to connect Google:', err);
                                    setIsConnecting(false);
                                    toast('Connection error: ' + err.message, 'error');
                                } finally {
                                    clearTimeout(timeout);
                                    // Note: If redirect happens, the component resets anyway.
                                }
                            }}
                            disabled={isConnecting}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                            </svg>
                            {isConnecting ? 'Connecting...' : 'Connect Google Drive'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

