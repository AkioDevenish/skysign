import Link from 'next/link';

interface SubscriptionSectionProps {
    plan: string;
    sigCount: number;
    isPro: boolean;
    isProPlus: boolean;
}

export default function SubscriptionSection({ plan, sigCount, isPro, isProPlus }: SubscriptionSectionProps) {
    return (
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
    );
}
