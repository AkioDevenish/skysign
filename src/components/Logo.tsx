'use client';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
};

const iconSizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
};

export default function Logo({ size = 'md', className = '' }: LogoProps) {
    return (
        <div className={`${sizeClasses[size]} flex items-center justify-center ${className}`}>
            <svg
                className={iconSizeClasses[size]}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Brush tip at top */}
                <ellipse 
                    cx="72" 
                    cy="18" 
                    rx="12" 
                    ry="6" 
                    fill="#44403c"
                    transform="rotate(-30 72 18)"
                />
                {/* Elegant S brush stroke */}
                <path 
                    d="M68 22 
                       C58 28, 38 30, 32 42 
                       C26 54, 42 58, 52 54 
                       C62 50, 72 56, 68 68 
                       C64 80, 44 86, 28 82" 
                    stroke="#44403c" 
                    strokeWidth="8" 
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
            </svg>
        </div>
    );
}
