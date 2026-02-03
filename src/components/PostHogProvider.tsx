'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { ReactNode, useEffect } from 'react';

export function PostHogProvider({ children }: { children: ReactNode }) {
    useEffect(() => {
        if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
            posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
                api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
                capture_pageview: false, // Manually capture pageviews if needed, or set true
                loaded: (posthog) => {
                    if (process.env.NODE_ENV === 'development') posthog.debug();
                }
            });
        }
    }, []);

    return <PHProvider client={posthog}>{children}</PHProvider>;
}
