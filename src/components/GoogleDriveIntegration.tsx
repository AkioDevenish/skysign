'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { motion } from 'framer-motion';
import { useState } from 'react';

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
    const googleStatus = useQuery(api.settings.getGoogleStatus);
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    const loadFiles = async (query: string = '') => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/google/drive/upload?query=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            setFiles(data.files || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load files');
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = () => {
        window.location.href = '/api/google/auth';
    };

    // Load files when connected
    if (googleStatus?.connected && files.length === 0 && !loading && !error) {
        loadFiles();
    }

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
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-stone-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7.71 3.5L1.15 15l3.43 5.5h6.54l-3.41-5.5L14.14 3.5H7.71z"/>
                                <path d="M14.43 3.5l-6.48 11 3.43 5.5h7.14l3.43-5.5-7.52-11z" opacity="0.8"/>
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-stone-900">Google Drive</h3>
                            {googleStatus?.connected && (
                                <p className="text-xs text-stone-500">{googleStatus.email}</p>
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
                    {!googleStatus?.connected ? (
                        /* Not connected state */
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-stone-400" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7.71 3.5L1.15 15l3.43 5.5h6.54l-3.41-5.5L14.14 3.5H7.71z"/>
                                    <path d="M14.43 3.5l-6.48 11 3.43 5.5h7.14l3.43-5.5-7.52-11z" opacity="0.5"/>
                                </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-stone-900 mb-2">
                                Connect Google Drive
                            </h4>
                            <p className="text-stone-500 text-sm mb-6 max-w-sm mx-auto">
                                Import PDF documents directly from your Google Drive to sign them with SkySign.
                            </p>
                            <button
                                onClick={handleConnect}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-medium transition-colors"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                                </svg>
                                Connect with Google
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
                                            onClick={() => onFileSelect(file)}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-stone-50 rounded-xl transition-colors text-left group"
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
                                            <svg className="w-5 h-5 text-stone-300 group-hover:text-stone-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
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
    const googleStatus = useQuery(api.settings.getGoogleStatus);
    const [showPicker, setShowPicker] = useState(false);
    const disconnectGoogle = useMutation(api.settings.disconnectGoogle);

    const handleClick = () => {
        if (googleStatus?.connected) {
            setShowPicker(true);
        } else {
            window.location.href = '/api/google/auth';
        }
    };

    return (
        <>
            <button
                onClick={handleClick}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 hover:border-stone-300 rounded-xl text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors"
            >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.71 3.5L1.15 15l3.43 5.5h6.54l-3.41-5.5L14.14 3.5H7.71z" fill="#4285f4"/>
                    <path d="M14.43 3.5l-6.48 11 3.43 5.5h7.14l3.43-5.5-7.52-11z" fill="#34a853"/>
                </svg>
                {googleStatus?.connected ? 'Import from Drive' : 'Connect Drive'}
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
    const googleStatus = useQuery(api.settings.getGoogleStatus);
    const disconnectGoogle = useMutation(api.settings.disconnectGoogle);
    const [disconnecting, setDisconnecting] = useState(false);

    const handleDisconnect = async () => {
        setDisconnecting(true);
        try {
            await disconnectGoogle();
        } finally {
            setDisconnecting(false);
        }
    };

    return (
        <div className="p-6 bg-white border border-stone-200 rounded-2xl">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.71 3.5L1.15 15l3.43 5.5h6.54l-3.41-5.5L14.14 3.5H7.71z"/>
                        <path d="M14.43 3.5l-6.48 11 3.43 5.5h7.14l3.43-5.5-7.52-11z" opacity="0.8"/>
                    </svg>
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-stone-900">Google Drive</h3>
                    <p className="text-sm text-stone-500 mt-1">
                        Import documents from Drive and save signed files back automatically.
                    </p>

                    {googleStatus?.connected ? (
                        <div className="mt-4">
                            <div className="flex items-center gap-2 text-sm text-emerald-600 mb-3">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Connected as {googleStatus.email}
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
                            onClick={() => window.location.href = '/api/google/auth'}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-medium transition-colors"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                            </svg>
                            Connect Google Drive
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
