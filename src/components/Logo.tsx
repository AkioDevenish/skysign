'use client';

import { PenTool } from 'lucide-react';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    showText?: boolean;
}

export default function Logo({ size = 'md', className = '', showText = false }: LogoProps) {
    const sizeClasses = {
        sm: 'w-5 h-5',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <PenTool className={`${sizeClasses[size]} text-stone-900`} strokeWidth={2} />
            {showText && (
                <span className="font-semibold text-stone-900 tracking-tight">
                    SkySign
                </span>
            )}
        </div>
    );
}
