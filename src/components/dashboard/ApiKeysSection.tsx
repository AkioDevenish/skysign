import { Id } from "../../../convex/_generated/dataModel";
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface ApiKey {
    _id: Id<"apiKeys">;
    name: string;
    last4?: string;
    createdAt: string;
}

interface ApiKeysSectionProps {
    apiKeys: ApiKey[];
    isProPlus: boolean;
    isCreatingKey: boolean;
    setIsCreatingKey: (val: boolean) => void;
    showKey: string | null;
    newKeyName: string;
    setNewKeyName: (val: string) => void;
    onCreateKey: (e: React.FormEvent) => Promise<void>;
    onDeleteKey: (id: string) => Promise<void>;
    openCreateKeyModal: () => void;
}

export default function ApiKeysSection({
    apiKeys,
    isProPlus,
    isCreatingKey,
    setIsCreatingKey,
    showKey,
    newKeyName,
    setNewKeyName,
    onCreateKey,
    onDeleteKey,
    openCreateKeyModal
}: ApiKeysSectionProps) {
    return (
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
                    <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-7 h-7 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                    </div>
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
                                    {apiKeys.map((k) => (
                                        <tr key={k._id} className="hover:bg-stone-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                    <span className="text-sm font-medium text-stone-900">{k.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <code className="text-xs font-mono text-stone-500 bg-stone-100 px-2 py-1 rounded">sk_...{k.last4 || '????'}</code>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-stone-500">
                                                {new Date(k.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => onDeleteKey(k._id)}
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

            {/* Create Key Modal - moved inside component or kept in parent? 
                Keeping UI here for simplicity but logic uses props. 
                Wait, the modal was outside the main content area in the original file.
                Ideally it should be at the top level, but for now let's keep it here or handle it.
                The original had it totally outside the tabs.
            */}
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
                                    <form onSubmit={onCreateKey}>
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
        </div>
    );
}
