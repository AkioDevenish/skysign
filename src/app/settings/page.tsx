'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, UserButton } from '@clerk/nextjs';
import { getApiKeys, createApiKey, deleteApiKey, revokeApiKey, ApiKey } from '@/lib/apiKeyUtils';
import { getSignatureCount } from '@/lib/signatureStorage';
import { getTeamCount } from '@/lib/teamStorage';

type TabId = 'profile' | 'preferences' | 'subscription' | 'export' | 'api';

const tabs = [
    { id: 'profile' as TabId, label: 'Profile', icon: '👤' },
    { id: 'preferences' as TabId, label: 'Preferences', icon: '⚙️' },
    { id: 'subscription' as TabId, label: 'Subscription', icon: '💳' },
    { id: 'export' as TabId, label: 'Export & Backup', icon: '📦' },
    { id: 'api' as TabId, label: 'API Access', icon: '🔑' },
];

export default function SettingsPage() {
    const { user, isLoaded } = useUser();
    const [activeTab, setActiveTab] = useState<TabId>('profile');
    const [cloudBackup, setCloudBackup] = useState(false);
    const [autoSave, setAutoSave] = useState(true);
    const [defaultFormat, setDefaultFormat] = useState('png');
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [newKeyName, setNewKeyName] = useState('');
    const [showKey, setShowKey] = useState<string | null>(null);
    const [sigCount, setSigCount] = useState(0);

    const plan = (user?.publicMetadata?.plan as string) || 'free';
    const isPro = plan === 'pro' || plan === 'proplus';
    const isProPlus = plan === 'proplus';

    useEffect(() => {
        setApiKeys(getApiKeys());
        setSigCount(getSignatureCount());
    }, []);

    const handleCreateKey = (e: React.FormEvent) => {
        e.preventDefault();
        const key = createApiKey(newKeyName);
        setApiKeys(getApiKeys());
        setNewKeyName('');
        setShowKey(key.key);
    };

    const handleDeleteKey = (id: string) => {
        if (confirm('Are you sure you want to delete this API key?')) {
            deleteApiKey(id);
            setApiKeys(getApiKeys());
        }
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-stone-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-stone-200">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/create" className="p-2 rounded-lg hover:bg-stone-100 transition-colors">
                            <svg className="w-5 h-5 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <h1 className="text-xl font-semibold text-stone-900">Settings</h1>
                    </div>
                    <UserButton afterSignOutUrl="/" />
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Tabs */}
                    <nav className="lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl border border-stone-200 p-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${activeTab === tab.id
                                        ? 'bg-stone-900 text-white'
                                        : 'text-stone-600 hover:bg-stone-50'
                                        }`}
                                >
                                    <span className="text-lg">{tab.icon}</span>
                                    <span className="font-medium">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </nav>

                    {/* Content */}
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'profile' && (
                                    <div className="bg-white rounded-2xl border border-stone-200 p-8">
                                        <h2 className="text-xl font-semibold text-stone-900 mb-6">Profile</h2>

                                        <div className="flex items-center gap-6 mb-8">
                                            <div className="w-20 h-20 bg-stone-100 rounded-2xl flex items-center justify-center text-3xl">
                                                {user?.firstName?.[0] || '👤'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-stone-900">{user?.fullName || 'User'}</p>
                                                <p className="text-sm text-stone-500">{user?.primaryEmailAddress?.emailAddress}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-stone-700 mb-2">Full Name</label>
                                                <input
                                                    type="text"
                                                    defaultValue={user?.fullName || ''}
                                                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                                                    placeholder="Your name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-stone-700 mb-2">Email</label>
                                                <input
                                                    type="email"
                                                    value={user?.primaryEmailAddress?.emailAddress || ''}
                                                    disabled
                                                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-500 cursor-not-allowed"
                                                />
                                                <p className="text-xs text-stone-400 mt-1">Email is managed by your authentication provider</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'preferences' && (
                                    <div className="bg-white rounded-2xl border border-stone-200 p-8">
                                        <h2 className="text-xl font-semibold text-stone-900 mb-6">Preferences</h2>

                                        <div className="space-y-6">
                                            {/* Auto Save */}
                                            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                                                <div>
                                                    <p className="font-medium text-stone-900">Auto-save signatures</p>
                                                    <p className="text-sm text-stone-500">Automatically save after creating</p>
                                                </div>
                                                <button
                                                    onClick={() => setAutoSave(!autoSave)}
                                                    className={`w-12 h-7 rounded-full transition-colors ${autoSave ? 'bg-emerald-500' : 'bg-stone-300'
                                                        }`}
                                                >
                                                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${autoSave ? 'translate-x-6' : 'translate-x-1'
                                                        }`} />
                                                </button>
                                            </div>

                                            {/* Default Format */}
                                            <div className="p-4 bg-stone-50 rounded-xl">
                                                <p className="font-medium text-stone-900 mb-3">Default export format</p>
                                                <div className="flex gap-2">
                                                    {['png', 'svg', 'pdf'].map((fmt) => (
                                                        <button
                                                            key={fmt}
                                                            onClick={() => setDefaultFormat(fmt)}
                                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${defaultFormat === fmt
                                                                ? 'bg-stone-900 text-white'
                                                                : 'bg-white text-stone-600 border border-stone-200'
                                                                }`}
                                                        >
                                                            {fmt.toUpperCase()}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Cloud Backup */}
                                            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                                                <div>
                                                    <p className="font-medium text-stone-900">Cloud Backup</p>
                                                    <p className="text-sm text-stone-500">Sync signatures across devices</p>
                                                </div>
                                                <button
                                                    onClick={() => setCloudBackup(!cloudBackup)}
                                                    className={`w-12 h-7 rounded-full transition-colors ${cloudBackup ? 'bg-emerald-500' : 'bg-stone-300'
                                                        }`}
                                                >
                                                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${cloudBackup ? 'translate-x-6' : 'translate-x-1'
                                                        }`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'subscription' && (
                                    <div className="bg-white rounded-2xl border border-stone-200 p-8">
                                        <h2 className="text-xl font-semibold text-stone-900 mb-6">Subscription</h2>

                                        {/* Usage */}
                                        <div className="space-y-4">
                                            <div className="p-4 bg-stone-50 rounded-xl">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="font-medium text-stone-900">Signatures</p>
                                                    <p className="text-sm text-stone-500">{sigCount} / {isPro ? '∞' : '5'}</p>
                                                </div>
                                                <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (sigCount / 5) * 100)}%` }} />
                                                </div>
                                            </div>
                                            {isProPlus && (
                                                <div className="p-4 bg-stone-50 rounded-xl">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <p className="font-medium text-stone-900">Team Members</p>
                                                        <p className="text-sm text-stone-500">{getTeamCount()} / 10</p>
                                                    </div>
                                                    <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (getTeamCount() / 10) * 100)}%` }} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'export' && (
                                    <div className="bg-white rounded-2xl border border-stone-200 p-8">
                                        <h2 className="text-xl font-semibold text-stone-900 mb-6">Export & Backup</h2>

                                        <div className="space-y-4">
                                            {/* Export Formats */}
                                            <div className="p-6 border border-stone-200 rounded-xl">
                                                <h3 className="font-medium text-stone-900 mb-4">Export Formats</h3>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {[
                                                        { format: 'PNG', desc: 'Transparent background', icon: '🖼️' },
                                                        { format: 'SVG', desc: 'Vector scalable', icon: '📐' },
                                                        { format: 'PDF', desc: 'Document ready', icon: '📄' },
                                                        { format: 'JSON', desc: 'Backup data', icon: '💾' },
                                                    ].map((item) => (
                                                        <button
                                                            key={item.format}
                                                            className="p-4 bg-stone-50 rounded-xl text-left hover:bg-stone-100 transition-colors"
                                                        >
                                                            <span className="text-2xl mb-2 block">{item.icon}</span>
                                                            <p className="font-medium text-stone-900">{item.format}</p>
                                                            <p className="text-xs text-stone-500">{item.desc}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Cloud Backup */}
                                            <div className="p-6 border border-stone-200 rounded-xl">
                                                <h3 className="font-medium text-stone-900 mb-2">Cloud Backup</h3>
                                                <p className="text-sm text-stone-500 mb-4">Your signatures are stored locally. Enable cloud backup to sync across devices.</p>
                                                <button className="px-5 py-2.5 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors">
                                                    Enable Cloud Backup
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'api' && (
                                    <div className="bg-white rounded-2xl border border-stone-200 p-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-semibold text-stone-900">API Access</h2>
                                            {!isProPlus && (
                                                <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider rounded-md border border-amber-100">
                                                    Pro Plus Feature
                                                </span>
                                            )}
                                        </div>

                                        {!isProPlus ? (
                                            <div className="text-center py-12 bg-stone-50/50 rounded-2xl border border-dashed border-stone-200">
                                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                    <svg className="w-8 h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                                    </svg>
                                                </div>
                                                <h3 className="text-stone-900 font-semibold mb-1">API Access & Webhooks</h3>
                                                <p className="text-sm text-stone-500 mb-6 max-w-xs mx-auto">
                                                    Integrate SkySign into your own applications with our robust API. Requires Pro Plus.
                                                </p>
                                                <Link
                                                    href="/#pricing"
                                                    className="px-6 py-2 bg-stone-900 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-stone-900/10 transition-all"
                                                >
                                                    Upgrade Now
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="space-y-8">
                                                {/* API Key Form */}
                                                <div className="p-6 bg-stone-50 rounded-2xl">
                                                    <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4">Create New API Key</h3>
                                                    <form onSubmit={handleCreateKey} className="flex gap-3">
                                                        <input
                                                            type="text"
                                                            required
                                                            placeholder="Key name (e.g. Production)"
                                                            className="flex-1 px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900/5 outline-none text-sm"
                                                            value={newKeyName}
                                                            onChange={e => setNewKeyName(e.target.value)}
                                                        />
                                                        <button
                                                            type="submit"
                                                            className="px-6 py-2 bg-stone-900 text-white text-sm font-bold rounded-xl hover:bg-stone-800 transition-all"
                                                        >
                                                            Generate Key
                                                        </button>
                                                    </form>
                                                </div>

                                                {/* New Key Alert */}
                                                {showKey && (
                                                    <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl">
                                                        <p className="text-sm font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Copy your key now. You won&apos;t be able to see it again!
                                                        </p>
                                                        <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-emerald-200 font-mono text-xs">
                                                            <span className="flex-1 overflow-hidden truncate">{showKey}</span>
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(showKey);
                                                                    alert('Key copied to clipboard!');
                                                                }}
                                                                className="p-1.5 hover:bg-stone-50 rounded-lg transition-colors border border-stone-100"
                                                            >
                                                                <svg className="w-4 h-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                        <button
                                                            onClick={() => setShowKey(null)}
                                                            className="mt-4 text-xs font-bold text-emerald-700 hover:text-emerald-900 uppercase tracking-widest"
                                                        >
                                                            Done
                                                        </button>
                                                    </div>
                                                )}

                                                {/* API Keys List */}
                                                <div className="space-y-4">
                                                    <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider ml-1">Active Keys</h3>
                                                    {apiKeys.length > 0 ? (
                                                        apiKeys.map((k) => (
                                                            <div key={k.id} className="flex items-center justify-between p-4 border border-stone-200 rounded-2xl hover:bg-stone-50/50 transition-all">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 bg-white border border-stone-100 rounded-xl flex items-center justify-center shadow-sm">
                                                                        <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                                        </svg>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-semibold text-stone-900">{k.name}</p>
                                                                        <p className="text-xs text-stone-400">Created {new Date(k.createdAt).toLocaleDateString()}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${k.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                                                                        }`}>
                                                                        {k.status}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => handleDeleteKey(k.id)}
                                                                        className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-center py-8 text-stone-400 italic text-sm border border-dashed border-stone-200 rounded-2xl">
                                                            No API keys generated yet.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </main>
    );
}
