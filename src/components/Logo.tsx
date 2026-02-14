'use client';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    showText?: boolean;
}

export default function Logo({ size = 'md', className = '', showText = false }: LogoProps) {
    if (!showText) return null;

    return (
        <span className={`font-semibold text-stone-800 dark:text-stone-200 ${className}`}>
            SkySign
        </span>
    );
}
