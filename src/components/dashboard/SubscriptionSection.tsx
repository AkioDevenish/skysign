'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { openPaddleCheckout } from '../PaddleProvider';
import { useToast } from '../ToastProvider';

interface SubscriptionSectionProps {
    plan: string;
    sigCount: number;
    isPro: boolean;
    isProPlus: boolean;
}

export default function SubscriptionSection({ plan, sigCount, isPro, isProPlus }: SubscriptionSectionProps) {
    const { user } = useUser();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleUpgrade = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const result = await openPaddleCheckout({
                customerEmail: user.primaryEmailAddress?.emailAddress,
                clerkUserId: user.id,
                planId: 'pro',
                billingCycle,
            });
            if (!result.ok) {
                toast(result.error || 'Failed to start checkout. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Checkout failed:', error);
            toast('Failed to start checkout. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

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
                            {isPro ? 'You have unlimited signatures.' : `${Math.max(0, 5 - sigCount)} signatures remaining on Free plan.`}
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
                        <div className="space-y-4">
                             {/* Billing Cycle Toggle */}
                             <div className="flex items-center justify-center p-1 bg-stone-100 rounded-xl">
                                <button
                                    onClick={() => setBillingCycle('monthly')}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                        billingCycle === 'monthly' 
                                            ? 'bg-white text-stone-900 shadow-sm' 
                                            : 'text-stone-500 hover:text-stone-900'
                                    }`}
                                >
                                    Monthly
                                </button>
                                <button
                                    onClick={() => setBillingCycle('yearly')}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                        billingCycle === 'yearly' 
                                            ? 'bg-white text-stone-900 shadow-sm' 
                                            : 'text-stone-500 hover:text-stone-900'
                                    }`}
                                >
                                    Yearly (-25%)
                                </button>
                            </div>

                            <button
                                onClick={handleUpgrade}
                                disabled={isLoading}
                                className="block w-full py-3 bg-stone-900 text-white text-center rounded-xl font-bold hover:bg-stone-800 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                {isLoading ? 'Processing...' : `Upgrade to Pro (${billingCycle === 'monthly' ? '$12/mo' : '$108/yr'})`}
                            </button>
                        </div>
                    )}
                    {isPro && (
                        <div className="space-y-3">
                            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                                <span className="text-emerald-700 text-sm font-semibold flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Active
                                </span>
                            </div>
                            <a 
                                href="mailto:support@skysign.app?subject=Manage Subscription&body=I would like to cancel or update my subscription."
                                className="block w-full py-3 bg-white border border-stone-200 text-stone-600 text-center rounded-xl font-semibold hover:bg-stone-50 hover:text-stone-900 transition-colors text-sm"
                            >
                                Manage Subscription
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
