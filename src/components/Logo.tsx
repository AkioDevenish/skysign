'use client';

import Image from 'next/image';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    showText?: boolean;
}

const sizeClasses = {
    sm: { container: 'h-8', image: 32 },
    md: { container: 'h-10', image: 40 },
    lg: { container: 'h-12', image: 48 },
};

export default function Logo({ size = 'md', className = '', showText = false }: LogoProps) {
    const { container, image } = sizeClasses[size];
    
    return (
        <div className={`${container} flex items-center ${className}`}>
            <Image
                src="/logo-new.png"
                alt="SkySign Logo"
                width={image}
                height={image}
                className="object-contain"
                priority
            />
            {showText && (
                <span className="ml-2 font-semibold text-stone-800 dark:text-stone-200">
                    SkySign
                </span>
            )}
        </div>
    );
}
