'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserButton, useUser, UserProfile } from '@clerk/nextjs';
import Link from 'next/link';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { AuditEntry } from '@/lib/auditTrail'; // Keep type if useful
// import { getAuditTrail, AuditEntry } from '@/lib/auditTrail';
// import { getTeamMembers, TeamMember, addTeamMember, removeTeamMember, getTeamCount } from '@/lib/teamStorage';
// import { getApiKeys, createApiKey, deleteApiKey, ApiKey } from '@/lib/apiKeyUtils';
// import { getSignatureCount } from '@/lib/signatureStorage';
import Modal from '@/components/Modal';

type TabId = 'overview' | 'profile' | 'preferences' | 'subscription' | 'api';

const tabs = [
    { id: 'overview' as TabId, label: 'Overview', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
    { id: 'profile' as TabId, label: 'Profile', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { id: 'preferences' as TabId, label: 'Preferences', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { id: 'subscription' as TabId, label: 'Subscription', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },

    { id: 'api' as TabId, label: 'API Access', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg> },
];

export default function DashboardPage() {
    const { user, isLoaded } = useUser();
    // Convex Queries
    const entries = useQuery(api.audit.get) || [];
    const team = useQuery(api.team.getMembers) || [];
    const apiKeys = useQuery(api.apiKeys.get) || [];
    const sigCount = useQuery(api.signatures.getCount) || 0;
    const settings = useQuery(api.settings.get);

    // Convex Mutations
    const addMember = useMutation(api.team.addMember);
    const removeMember = useMutation(api.team.removeMember);
    const createKey = useMutation(api.apiKeys.create);
    const deleteKey = useMutation(api.apiKeys.remove);
    const updateSettings = useMutation(api.settings.update);

    const [activeTab, setActiveTab] = useState<TabId>('overview');

    // UI State
    const [filter, setFilter] = useState<string>('all'); // Simplified type

    // Team State
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [newMember, setNewMember] = useState({ name: '', email: '' });

    // Settings State (derived from Convex)
    const cloudBackup = false; // Always cloud backed up with Convex
    const autoSave = settings?.autoSave ?? false;
    const defaultFormat = settings?.defaultFormat ?? 'png';
    const newKeyNameState = useState(''); // Need to keep this one
    const newKeyName = newKeyNameState[0];
    const setNewKeyName = newKeyNameState[1];
    // const [newKeyName, setNewKeyName] = useState(''); // Re-declare properly below if replace fails
    const [showKey, setShowKey] = useState<string | null>(null);
    const [isCreatingKey, setIsCreatingKey] = useState(false);
    const [modalState, setModalState] = useState<{ isOpen: boolean; title: string; message: string; type: 'error' | 'success' | 'info' }>({ isOpen: false, title: '', message: '', type: 'error' });

    const openCreateKeyModal = () => {
        setNewKeyName('');
        setShowKey(null);
        setIsCreatingKey(true);
    };

    const plan = (user?.publicMetadata?.plan as string) || 'free';
    // const plan = 'proplus'; // TEMP UNLOCK
    const isPro = plan === 'pro' || plan === 'proplus';
    const isProPlus = plan === 'proplus';

    // Team Handlers
    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addMember({ name: newMember.name, email: newMember.email });
            setNewMember({ name: '', email: '' });
            setIsAddingMember(false);
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : String(err));
        }
    };

    const handleRemoveMember = async (id: string) => {
        if (confirm('Are you sure you want to remove this team member?')) {
            await removeMember({ id: id as Id<"teamMembers"> });
        }
    };

    // API Key Handlers
    const handleCreateKey = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const key = await createKey({ name: newKeyName });
            setNewKeyName('');
            setShowKey(key.key);
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : String(err));
        }
    };

    const handleDeleteKey = async (id: string) => {
        if (confirm('Are you sure you want to delete this API key?')) {
            await deleteKey({ id: id as Id<"apiKeys"> });
        }
    };

    const filteredEntries = filter === 'all'
        ? entries
        : entries.filter(e => e.action === filter);

    const getActionStyle = (action: string) => {
        switch (action) {
            case 'signed': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' };
            case 'exported': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' };
            case 'created': return { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' };
            case 'shared': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' };
            default: return { bg: 'bg-stone-50', text: 'text-stone-600', border: 'border-stone-200' };
        }
    };

    const activityFilters = [
        { id: 'all', label: 'All Activity' },
        { id: 'signed', label: 'Signed' },
        { id: 'created', label: 'Created' },
        { id: 'exported', label: 'Exported' },
        { id: 'shared', label: 'Shared' },
    ];

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50">
            {/* Header */}
            <header className="sticky top-0 bg-white/80 backdrop-blur-xl z-40 border-b border-stone-200/60">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-stone-800 to-stone-900 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                            </svg>
                        </div>
                        <span className="text-lg font-semibold text-stone-900">Dashboard</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <UserButton
                            afterSignOutUrl="/"
                            userProfileMode="navigation"
                            userProfileUrl="/dashboard"
                        />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <nav className="lg:w-64 flex-shrink-0">
                        <div className="sticky top-24 space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 text-left cursor-pointer ${activeTab === tab.id
                                        ? 'bg-stone-900 text-white shadow-lg shadow-stone-900/10 scale-[1.02]'
                                        : 'text-stone-500 hover:bg-stone-200/50 hover:text-stone-900'
                                        }`}
                                >
                                    <span className={`transition-colors ${activeTab === tab.id ? 'text-stone-200' : 'text-stone-400 group-hover:text-stone-600'}`}>
                                        {tab.icon}
                                    </span>
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </nav>

                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* OVERVIEW TAB */}
                                {activeTab === 'overview' && (
                                    <div className="space-y-8">
                                        {/* Welcome Section */}
                                        <div>
                                            <h1 className="text-2xl font-bold text-stone-900 mb-2">
                                                Welcome back, {user?.firstName || 'there'}! 👋
                                            </h1>
                                            <p className="text-stone-500">Here&apos;s an overview of your signature activity.</p>
                                        </div>



                                        {/* Activity Section */}
                                        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden">
                                            <div className="px-6 py-5 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div>
                                                    <h2 className="text-lg font-semibold text-stone-900">Recent Activity</h2>
                                                    <p className="text-sm text-stone-500">Your signature and document history</p>
                                                </div>
                                                <div className="flex items-center gap-1 p-1 bg-stone-100/50 rounded-xl">
                                                    {activityFilters.map((f) => (
                                                        <button
                                                            key={f.id}
                                                            onClick={() => setFilter(f.id)}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${filter === f.id
                                                                ? 'bg-white text-stone-900 shadow-sm border border-stone-200/50'
                                                                : 'text-stone-500 hover:text-stone-700'
                                                                }`}
                                                        >
                                                            {f.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="divide-y divide-stone-100">
                                                {filteredEntries.length > 0 ? (
                                                    filteredEntries.slice(0, 10).map((entry, i) => {
                                                        const style = getActionStyle(entry.action);
                                                        return (
                                                            <div key={entry._id} className="px-6 py-4 flex items-center gap-4 hover:bg-stone-50/50 transition-colors">
                                                                <div className={`w-10 h-10 rounded-xl ${style.bg} ${style.border} border flex items-center justify-center`}>
                                                                    {entry.action === 'signed' && <svg className={`w-5 h-5 ${style.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>}
                                                                    {entry.action === 'created' && <svg className={`w-5 h-5 ${style.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>}
                                                                    {entry.action === 'exported' && <svg className={`w-5 h-5 ${style.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>}
                                                                    {entry.action === 'shared' && <svg className={`w-5 h-5 ${style.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>}
                                                                    {entry.action === 'viewed' && <svg className={`w-5 h-5 ${style.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                                                                    {entry.action === 'deleted' && <svg className={`w-5 h-5 ${style.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-stone-900 truncate">
                                                                        {entry.signatureName || 'Document'}
                                                                    </p>
                                                                    <p className="text-xs text-stone-400">
                                                                        {new Date(entry.timestamp).toLocaleDateString('en-US', {
                                                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                                        })}
                                                                    </p>
                                                                </div>
                                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                                                                    {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}
                                                                </span>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="px-6 py-16 text-center">
                                                        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                            <svg className="w-8 h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </div>
                                                        <p className="text-stone-500 font-medium mb-1">No activity yet</p>
                                                        <p className="text-sm text-stone-400">Start by creating your first signature</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Team Section */}
                                        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden">
                                            <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h2 className="text-lg font-semibold text-stone-900">Team Members</h2>
                                                        {!isProPlus && (
                                                            <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider rounded-md border border-amber-100">Pro Plus</span>
                                                        )}
                                                    </div>
                                                </div>
                                                {isProPlus && (
                                                    <button
                                                        onClick={() => setIsAddingMember(true)}
                                                        className="px-4 py-2 bg-stone-900 text-white text-xs font-medium rounded-xl hover:bg-stone-800 transition-all shadow-md cursor-pointer"
                                                    >
                                                        + Add Member
                                                    </button>
                                                )}
                                            </div>

                                            {!isProPlus ? (
                                                <div className="px-6 py-8 text-center bg-stone-50/50">
                                                    <p className="text-sm text-stone-500 mb-4 max-w-xs mx-auto">
                                                        Upgrade to Pro Plus to manage your team.
                                                    </p>
                                                    <Link
                                                        href="/#pricing"
                                                        className="inline-flex items-center gap-2 px-6 py-2 bg-stone-900 text-white text-sm font-bold rounded-xl"
                                                    >
                                                        Upgrade Now
                                                    </Link>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-stone-100">
                                                    {isAddingMember && (
                                                        <div className="p-6 bg-stone-50/50">
                                                            <form onSubmit={handleAddMember} className="flex flex-col md:flex-row gap-4 items-end">
                                                                <div className="flex-1 space-y-1 w-full">
                                                                    <label className="text-[10px] font-bold text-stone-400 uppercase">Full Name</label>
                                                                    <input
                                                                        type="text"
                                                                        required
                                                                        className="w-full px-4 py-2 rounded-xl border border-stone-200 text-sm"
                                                                        value={newMember.name}
                                                                        onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                                                                    />
                                                                </div>
                                                                <div className="flex-1 space-y-1 w-full">
                                                                    <label className="text-[10px] font-bold text-stone-400 uppercase">Email</label>
                                                                    <input
                                                                        type="email"
                                                                        required
                                                                        className="w-full px-4 py-2 rounded-xl border border-stone-200 text-sm"
                                                                        value={newMember.email}
                                                                        onChange={e => setNewMember({ ...newMember, email: e.target.value })}
                                                                    />
                                                                </div>
                                                                <button type="submit" className="px-6 py-2 bg-stone-900 text-white text-sm font-bold rounded-xl cursor-pointer">Invite</button>
                                                            </form>
                                                        </div>
                                                    )}
                                                    {team.map((member: { _id: Id<"teamMembers">, name: string, email: string }) => (
                                                        <div key={member._id} className="px-6 py-4 flex items-center justify-between hover:bg-stone-50/50">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-500">{member.name.charAt(0)}</div>
                                                                <div>
                                                                    <p className="text-sm font-semibold text-stone-900">{member.name}</p>
                                                                    <p className="text-xs text-stone-400">{member.email}</p>
                                                                </div>
                                                            </div>
                                                            <button onClick={() => handleRemoveMember(member._id)} className="text-stone-400 hover:text-red-500 cursor-pointer">
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* PROFILE TAB */}
                                {activeTab === 'profile' && (
                                    <div className="flex justify-center">
                                        <UserProfile
                                            routing="hash"
                                            appearance={{
                                                elements: {
                                                    rootBox: "w-full",
                                                    card: "shadow-none border-none w-full bg-transparent",
                                                    navbar: "hidden",
                                                    navbarButton: "text-stone-600 hover:text-stone-900",
                                                    headerTitle: "text-stone-900",
                                                    headerSubtitle: "text-stone-500",
                                                },
                                                variables: {
                                                    colorPrimary: '#1c1917',
                                                    colorText: '#1c1917',
                                                    fontFamily: 'inherit',
                                                    borderRadius: '1rem',
                                                }
                                            }}
                                        />
                                    </div>
                                )}

                                {/* PREFERENCES TAB */}
                                {activeTab === 'preferences' && (
                                    <div className="bg-white rounded-3xl border border-stone-200 p-8">
                                        <h2 className="text-xl font-semibold text-stone-900 mb-6">Preferences</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* General Settings */}
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-2">General</h3>

                                                <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100">
                                                    <div>
                                                        <p className="font-medium text-stone-900">Auto-save signatures</p>
                                                        <p className="text-xs text-stone-500 mt-1">Save immediately after creating</p>
                                                    </div>
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await updateSettings({ autoSave: !autoSave });
                                                            } catch (err: unknown) {
                                                                console.error("Failed to update settings:", err);
                                                                setModalState({
                                                                    isOpen: true,
                                                                    title: "Update Failed",
                                                                    message: "Failed to update settings. Please try again or check your connection.",
                                                                    type: 'error'
                                                                });
                                                                // alert("Failed to update settings. Please try again.");
                                                            }
                                                        }}
                                                        className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative ${autoSave ? 'bg-stone-900' : 'bg-stone-200'}`}
                                                    >
                                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${autoSave ? 'translate-x-5' : 'translate-x-0'}`} />
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100">
                                                    <div>
                                                        <p className="font-medium text-stone-900">Dark Mode</p>
                                                        <p className="text-xs text-stone-500 mt-1">Toggle application theme</p>
                                                    </div>
                                                    <button className="w-11 h-6 rounded-full bg-stone-200 cursor-not-allowed opacity-50 relative">
                                                        <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Export Settings */}
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-2">Export Defaults</h3>

                                                <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                                                    <p className="font-medium text-stone-900 mb-3">Default Format</p>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {['png', 'svg', 'pdf'].map((fmt) => (
                                                            <button
                                                                key={fmt}
                                                                onClick={() => updateSettings({ defaultFormat: fmt })}
                                                                disabled={!isPro && fmt !== 'png'}
                                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border ${defaultFormat === fmt
                                                                    ? 'bg-stone-900 text-white border-stone-900'
                                                                    : (!isPro && fmt !== 'png')
                                                                        ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                                                                        : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                                                                    }`}
                                                            >
                                                                <div className="flex flex-col items-center gap-1">
                                                                    <span>{fmt.toUpperCase()}</span>
                                                                    {(!isPro && fmt !== 'png') && <span className="text-[9px] bg-amber-100 text-amber-700 px-1 rounded">PRO</span>}
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* SUBSCRIPTION TAB */}
                                {activeTab === 'subscription' && (
                                    <div className="bg-white rounded-3xl border border-stone-200 p-8">
                                        <div className="flex items-center justify-between mb-8">
                                            <h2 className="text-xl font-semibold text-stone-900">Subscription</h2>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isPro ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600'}`}>
                                                {plan.toUpperCase()} PLAN
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Usage Stats */}
                                            <div className="space-y-6">
                                                <div className="p-5 bg-stone-50 rounded-2xl border border-stone-100">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <p className="font-medium text-stone-900">Signatures Created</p>
                                                        <p className="text-sm text-stone-500 font-mono">{sigCount} / {isPro ? '∞' : '5'}</p>
                                                    </div>
                                                    <div className="h-2 bg-stone-200 rounded-full overflow-hidden mb-2">
                                                        <div className="h-full bg-stone-900" style={{ width: `${Math.min(100, (sigCount / (isPro ? sigCount + 10 : 5)) * 100)}%` }} />
                                                    </div>
                                                    <p className="text-xs text-stone-400">
                                                        {isPro ? 'You have unlimited signatures.' : `${5 - sigCount} signatures remaining on Free plan.`}
                                                    </p>
                                                </div>

                                                <div className="p-5 bg-stone-50 rounded-2xl border border-stone-100 opacity-70">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <p className="font-medium text-stone-900">Team Members</p>
                                                        <p className="text-sm text-stone-500 font-mono">0 / {isProPlus ? '10' : '0'}</p>
                                                    </div>
                                                    <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                                                        <div className="h-full bg-stone-900" style={{ width: '0%' }} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Plan Details */}
                                            <div className="p-6 rounded-2xl border border-stone-200 bg-white">
                                                <h3 className="font-semibold text-stone-900 mb-4">Current Plan Details</h3>
                                                <ul className="space-y-3 mb-6">
                                                    <li className="flex items-center gap-3 text-sm text-stone-600">
                                                        <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                        {isPro ? 'Unlimited signatures' : '5 signatures per month'}
                                                    </li>
                                                    <li className="flex items-center gap-3 text-sm text-stone-600">
                                                        <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                        {isPro ? 'Advanced Export (SVG, PDF)' : 'Standard PNG Export'}
                                                    </li>
                                                    <li className="flex items-center gap-3 text-sm text-stone-600">
                                                        <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                        {isPro ? 'Cloud Backup & Sync' : 'Local Browser Storage'}
                                                    </li>
                                                </ul>

                                                {!isPro && (
                                                    <Link href="/#pricing" className="block w-full py-3 bg-stone-900 text-white text-center rounded-xl font-bold hover:bg-stone-800 transition-colors">
                                                        Upgrade to Pro
                                                    </Link>
                                                )}
                                                {isPro && (
                                                    <button disabled className="block w-full py-3 bg-stone-100 text-stone-400 text-center rounded-xl font-bold cursor-not-allowed">
                                                        Plan Active
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* EXPORT TAB */}


                                {/* API TAB */}
                                {activeTab === 'api' && (
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-xl font-semibold text-stone-900">API Gateway</h2>
                                                <p className="text-sm text-stone-500">Manage API keys and monitor usage</p>
                                            </div>
                                            <div className="flex gap-3">
                                                <Link href="/docs" className="px-4 py-2 border border-stone-200 rounded-xl text-sm font-medium hover:bg-stone-50 transition-colors text-stone-600 cursor-pointer flex items-center justify-center">
                                                    Read Documentation
                                                </Link>
                                                {isProPlus && (
                                                    <button
                                                        onClick={openCreateKeyModal}
                                                        className="px-4 py-2 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors cursor-pointer shadow-md"
                                                    >
                                                        + Create New Key
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {!isProPlus ? (
                                            <div className="bg-stone-50 rounded-3xl p-12 text-center border border-stone-200 border-dashed">
                                                <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">⚡</div>
                                                <h3 className="text-lg font-bold text-stone-900 mb-2">Connect your workflow</h3>
                                                <p className="text-stone-500 max-w-md mx-auto mb-8">
                                                    Upgrade to Pro Plus to access our REST API and integrate Sky Sign signatures directly into your own applications.
                                                </p>
                                                <Link href="/#pricing" className="inline-block px-8 py-3 bg-stone-900 text-white font-bold rounded-xl hover:bg-stone-800">
                                                    Upgrade to Pro Plus
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="space-y-8">
                                                {/* (Creation Form Moved to Modal) */}

                                                {/* Keys Table */}
                                                <div>
                                                    <h3 className="text-sm font-bold text-stone-900 mb-4 px-1">Active Keys</h3>
                                                    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
                                                        <table className="w-full text-left">
                                                            <thead className="bg-stone-50 border-b border-stone-200">
                                                                <tr>
                                                                    <th className="px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Name</th>
                                                                    <th className="px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Key Hint</th>
                                                                    <th className="px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Created</th>
                                                                    <th className="px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider text-right">Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-stone-100">
                                                                {apiKeys.map((k: { _id: Id<"apiKeys">, name: string, key?: string, createdAt: string }) => (
                                                                    <tr key={k._id} className="hover:bg-stone-50/50 transition-colors">
                                                                        <td className="px-6 py-4">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                                                <span className="text-sm font-medium text-stone-900">{k.name}</span>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-4">
                                                                            <code className="text-xs font-mono text-stone-500 bg-stone-100 px-2 py-1 rounded">sk_...{k.key?.slice(-4) || '????'}</code>
                                                                        </td>
                                                                        <td className="px-6 py-4 text-sm text-stone-500">
                                                                            {new Date(k.createdAt).toLocaleDateString()}
                                                                        </td>
                                                                        <td className="px-6 py-4 text-right">
                                                                            <button
                                                                                onClick={() => handleDeleteKey(k._id)}
                                                                                className="text-stone-400 hover:text-red-600 transition-colors text-sm font-medium px-3 py-1 hover:bg-red-50 rounded-lg cursor-pointer"
                                                                            >
                                                                                Revoke
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                                {apiKeys.length === 0 && (
                                                                    <tr>
                                                                        <td colSpan={4} className="px-6 py-12 text-center text-stone-400 text-sm">
                                                                            No active API keys found.
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Create Key Modal */}
                <AnimatePresence>
                    {isCreatingKey && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/20 backdrop-blur-sm p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                                className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-stone-900">
                                            {showKey ? 'Secret Key Generated' : 'Create New API Key'}
                                        </h3>
                                        {!showKey && (
                                            <button onClick={() => setIsCreatingKey(false)} className="text-stone-400 hover:text-stone-600 cursor-pointer">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>

                                    {showKey ? (
                                        <div className="space-y-6">
                                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <p className="text-emerald-800 font-medium">Key created successfully!</p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-stone-500 mb-2">Copy this key now. You won&apos;t be able to see it again.</p>
                                                <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
                                                    <code className="text-sm font-mono text-stone-800 flex-1 break-all">{showKey}</code>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(showKey);
                                                            // Optional: Show copied feedback
                                                        }}
                                                        className="p-2 hover:bg-white rounded-lg text-stone-400 hover:text-stone-900 transition-colors cursor-pointer shadow-sm"
                                                        title="Copy to clipboard"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                    </button>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setIsCreatingKey(false)}
                                                className="w-full py-3 bg-stone-900 text-white font-bold rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
                                            >
                                                Done
                                            </button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleCreateKey}>
                                            <div className="space-y-4 mb-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-stone-700 mb-1">Key Name</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-colors"
                                                        placeholder="e.g. Production Server, CI/CD Pipeline"
                                                        value={newKeyName}
                                                        onChange={e => setNewKeyName(e.target.value)}
                                                        required
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsCreatingKey(false)}
                                                    className="flex-1 py-3 border border-stone-200 text-stone-600 font-bold rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="flex-1 py-3 bg-stone-900 text-white font-bold rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
                                                >
                                                    Create Key
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>



                <AnimatePresence>
                    {modalState.isOpen && (
                        <Modal
                            isOpen={modalState.isOpen}
                            onClose={() => setModalState({ ...modalState, isOpen: false })}
                            title={modalState.title}
                            message={modalState.message}
                            type={modalState.type}
                        />
                    )}
                </AnimatePresence>

            </main >
        </div >
    );
}
