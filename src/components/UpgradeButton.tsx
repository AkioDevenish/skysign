'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { openPaddleCheckout } from './PaddleProvider';

interface UpgradeButtonProps {
    planId?: string;
    label?: string;
    className?: string;
    billingCycle?: 'monthly' | 'yearly';
}

export default function UpgradeButton({ 
    planId = 'pro', 
    label = 'Upgrade Now', 
    className = "",
    billingCycle = 'monthly'
}: UpgradeButtonProps) {
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(false);

    const handleUpgrade = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            await openPaddleCheckout({
                customerEmail: user.primaryEmailAddress?.emailAddress,
                clerkUserId: user.id,
                planId,
                billingCycle,
            });
        } catch (error) {
            console.error('Checkout failed:', error);
            alert('Failed to start checkout. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className={`cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {isLoading ? 'Processing...' : label}
        </button>
    );
}
