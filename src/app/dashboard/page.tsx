'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { getAuditTrail, AuditEntry, getAuditStats } from '@/lib/auditTrail';
import { getTeamMembers, TeamMember, addTeamMember, removeTeamMember } from '@/lib/teamStorage';

export default function DashboardPage() {
    const { user } = useUser();
    const [entries, setEntries] = useState<AuditEntry[]>([]);
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [stats, setStats] = useState({
        totalCreated: 0,
        totalExported: 0,
        totalSigned: 0,
        last30Days: 0,
    });
    const [filter, setFilter] = useState<AuditEntry['action'] | 'all'>('all');
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [newMember, setNewMember] = useState({ name: '', email: '' });

    const plan = (user?.publicMetadata?.plan as string) || 'free';
    const isProPlus = plan === 'proplus';

    useEffect(() => {
        setEntries(getAuditTrail());
        setStats(getAuditStats());
        setTeam(getTeamMembers());
    }, []);

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        const result = addTeamMember(newMember.name, newMember.email);
        if ('error' in result) {
            alert(result.error);
        } else {
            setTeam(getTeamMembers());
            setNewMember({ name: '', email: '' });
            setIsAddingMember(false);
        }
    };

    const handleRemoveMember = (id: string) => {
        if (confirm('Are you sure you want to remove this team member?')) {
            removeTeamMember(id);
            setTeam(getTeamMembers());
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

    const statCards = [
        { label: 'Documents Signed', value: stats.totalSigned, icon: '✍️', gradient: 'from-emerald-500 to-teal-600' },
        { label: 'Signatures Created', value: stats.totalCreated, icon: '🎨', gradient: 'from-purple-500 to-indigo-600' },
        { label: 'Documents Exported', value: stats.totalExported, icon: '📤', gradient: 'from-blue-500 to-cyan-600' },
        { label: 'Activity (30 Days)', value: stats.last30Days, icon: '📊', gradient: 'from-amber-500 to-orange-600' },
    ];

    const filters = [
        { id: 'all', label: 'All Activity' },
        { id: 'signed', label: 'Signed' },
        { id: 'created', label: 'Created' },
        { id: 'exported', label: 'Exported' },
        { id: 'shared', label: 'Shared' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100">
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
                        <Link
                            href="/create"
                            className="px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20"
                        >
                            + New Signature
                        </Link>
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10">
                {/* Welcome Section */}
                <div className="mb-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold text-stone-900 mb-2"
                    >
                        Welcome back, {user?.firstName || 'there'}! 👋
                    </motion.h1>
                    <p className="text-stone-500">Here's an overview of your signature activity.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                    {statCards.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="relative overflow-hidden bg-white rounded-2xl border border-stone-200/60 p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-bl-[60px]`} />
                            <div className="text-3xl mb-3">{stat.icon}</div>
                            <div className="text-3xl font-bold text-stone-900 mb-1">{stat.value}</div>
                            <div className="text-sm text-stone-500">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Activity Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-3xl border border-stone-200/60 shadow-sm overflow-hidden"
                >
                    {/* Activity Header */}
                    <div className="px-6 py-5 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-stone-900">Recent Activity</h2>
                            <p className="text-sm text-stone-500">Your signature and document history</p>
                        </div>

                        {/* Filter Pills */}
                        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl">
                            {filters.map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => setFilter(f.id as any)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f.id
                                        ? 'bg-white text-stone-900 shadow-sm'
                                        : 'text-stone-500 hover:text-stone-700'
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Activity List */}
                    <div className="divide-y divide-stone-100">
                        {filteredEntries.length > 0 ? (
                            filteredEntries.slice(0, 10).map((entry, i) => {
                                const style = getActionStyle(entry.action);
                                return (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="px-6 py-4 flex items-center gap-4 hover:bg-stone-50/50 transition-colors"
                                    >
                                        <div className={`w-10 h-10 rounded-xl ${style.bg} ${style.border} border flex items-center justify-center`}>
                                            {entry.action === 'signed' && '✍️'}
                                            {entry.action === 'created' && '🎨'}
                                            {entry.action === 'exported' && '📤'}
                                            {entry.action === 'shared' && '🔗'}
                                            {entry.action === 'viewed' && '👁️'}
                                            {entry.action === 'deleted' && '🗑️'}
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
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="px-6 py-16 text-center">
                                <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <p className="text-stone-500 font-medium mb-1">No activity yet</p>
                                <p className="text-sm text-stone-400 mb-4">Start by creating your first signature</p>
                                <Link
                                    href="/create"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 transition-all"
                                >
                                    Create Signature
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        )}
                    </div>

                    {filteredEntries.length > 10 && (
                        <div className="px-6 py-4 border-t border-stone-100 text-center">
                            <button className="text-sm text-stone-500 hover:text-stone-700 font-medium">
                                View all {filteredEntries.length} entries →
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* Team Management Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-10 bg-white rounded-3xl border border-stone-200/60 shadow-sm overflow-hidden"
                >
                    <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-semibold text-stone-900">Team Management</h2>
                                {!isProPlus && (
                                    <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider rounded-md border border-amber-100">
                                        Pro Plus Feature
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-stone-500">Manage your organization members</p>
                        </div>
                        {isProPlus && (
                            <button
                                onClick={() => setIsAddingMember(true)}
                                className="px-4 py-2 bg-stone-900 text-white text-xs font-medium rounded-xl hover:bg-stone-800 transition-all shadow-md"
                            >
                                + Add Member
                            </button>
                        )}
                    </div>

                    {!isProPlus ? (
                        <div className="px-6 py-12 text-center bg-stone-50/50">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-stone-100">
                                <svg className="w-8 h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h3 className="text-stone-900 font-semibold mb-1">Unlock Team Cooperation</h3>
                            <p className="text-sm text-stone-500 mb-6 max-w-xs mx-auto">
                                Pro Plus will allow you to add up to 10 team members and manage shared documents.
                            </p>
                            <Link
                                href="/#pricing"
                                className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
                            >
                                View Plans
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-stone-100">
                            {isAddingMember && (
                                <div className="p-6 bg-stone-50/50">
                                    <form onSubmit={handleAddMember} className="flex flex-col md:flex-row gap-4 items-end">
                                        <div className="flex-1 space-y-1">
                                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Full Name</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="John Doe"
                                                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900/5 transition-all text-sm"
                                                value={newMember.name}
                                                onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Email Address</label>
                                            <input
                                                type="email"
                                                required
                                                placeholder="john@example.com"
                                                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900/5 transition-all text-sm"
                                                value={newMember.email}
                                                onChange={e => setNewMember({ ...newMember, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setIsAddingMember(false)}
                                                className="px-4 py-2 text-stone-500 text-sm font-medium hover:text-stone-800"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-6 py-2 bg-stone-900 text-white text-sm font-bold rounded-xl"
                                            >
                                                Invite
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {team.length > 0 ? (
                                team.map((member) => (
                                    <div key={member.id} className="px-6 py-4 flex items-center justify-between hover:bg-stone-50/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 font-bold border border-stone-200">
                                                {member.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-stone-900">{member.name}</p>
                                                <p className="text-xs text-stone-400">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${member.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-stone-100 text-stone-500 border border-stone-200'
                                                }`}>
                                                {member.status}
                                            </span>
                                            <button
                                                onClick={() => handleRemoveMember(member.id)}
                                                className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : !isAddingMember && (
                                <div className="px-6 py-12 text-center text-stone-400 italic text-sm">
                                    No team members found. Invite your first colleague!
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Quick Actions */}
                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[
                        { title: 'Create Signature', desc: 'Draw or type a new signature', href: '/create', icon: '✏️' },
                        { title: 'Import Document', desc: 'Sign an existing PDF', href: '/create', icon: '📄' },
                        { title: 'Settings', desc: 'Manage your account', href: '/settings', icon: '⚙️' },
                    ].map((action, i) => (
                        <motion.div
                            key={action.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                        >
                            <Link
                                href={action.href}
                                className="block p-5 bg-white rounded-2xl border border-stone-200/60 hover:border-stone-300 hover:shadow-md transition-all group"
                            >
                                <div className="text-2xl mb-3">{action.icon}</div>
                                <h3 className="font-semibold text-stone-900 group-hover:text-stone-700">{action.title}</h3>
                                <p className="text-sm text-stone-500">{action.desc}</p>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
}
