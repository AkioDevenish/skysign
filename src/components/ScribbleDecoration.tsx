'use client';

import { motion } from 'framer-motion';

interface ScribbleDecorationProps {
    type: 'underline' | 'flourish' | 'arrow' | 'circle' | 'signature';
    className?: string;
    color?: string;
    animate?: boolean;
}

export default function ScribbleDecoration({
    type,
    className = '',
    color = 'currentColor',
    animate = true,
}: ScribbleDecorationProps) {
    const pathVariants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
                pathLength: { duration: 1.5, ease: [0.4, 0, 0.2, 1] as const },
                opacity: { duration: 0.3 },
            },
        },
    };

    const decorations = {
        underline: (
            <svg
                viewBox="0 0 200 20"
                fill="none"
                className={`w-full ${className}`}
                preserveAspectRatio="none"
            >
                <motion.path
                    d="M2 10 C 30 2, 50 18, 80 10 S 130 2, 160 10 S 190 18, 198 10"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    variants={animate ? pathVariants : undefined}
                    initial={animate ? 'hidden' : undefined}
                    whileInView={animate ? 'visible' : undefined}
                    viewport={{ once: true }}
                />
            </svg>
        ),
        flourish: (
            <svg
                viewBox="0 0 100 50"
                fill="none"
                className={className}
            >
                <motion.path
                    d="M5 25 Q 20 5, 35 25 T 65 25 Q 80 45, 95 25"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                    variants={animate ? pathVariants : undefined}
                    initial={animate ? 'hidden' : undefined}
                    whileInView={animate ? 'visible' : undefined}
                    viewport={{ once: true }}
                />
                <motion.circle
                    cx="95"
                    cy="25"
                    r="3"
                    fill={color}
                    initial={animate ? { scale: 0 } : undefined}
                    whileInView={animate ? { scale: 1 } : undefined}
                    transition={{ delay: 1.5, duration: 0.3 }}
                    viewport={{ once: true }}
                />
            </svg>
        ),
        arrow: (
            <svg
                viewBox="0 0 100 40"
                fill="none"
                className={className}
            >
                <motion.path
                    d="M5 20 C 20 10, 40 30, 60 20 S 85 10, 90 20"
                    stroke={color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                    variants={animate ? pathVariants : undefined}
                    initial={animate ? 'hidden' : undefined}
                    whileInView={animate ? 'visible' : undefined}
                    viewport={{ once: true }}
                />
                <motion.path
                    d="M82 15 L 95 20 L 82 25"
                    stroke={color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    initial={animate ? { opacity: 0 } : undefined}
                    whileInView={animate ? { opacity: 1 } : undefined}
                    transition={{ delay: 1.3, duration: 0.3 }}
                    viewport={{ once: true }}
                />
            </svg>
        ),
        circle: (
            <svg
                viewBox="0 0 100 100"
                fill="none"
                className={className}
            >
                <motion.ellipse
                    cx="50"
                    cy="50"
                    rx="45"
                    ry="40"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                    transform="rotate(-5 50 50)"
                    variants={animate ? pathVariants : undefined}
                    initial={animate ? 'hidden' : undefined}
                    whileInView={animate ? 'visible' : undefined}
                    viewport={{ once: true }}
                />
            </svg>
        ),
        signature: (
            <svg
                viewBox="0 0 200 60"
                fill="none"
                className={className}
            >
                <motion.path
                    d="M10 45 C 20 20, 35 50, 45 30 S 60 10, 75 35 C 85 55, 100 25, 115 35 S 135 50, 150 30 C 160 15, 175 40, 190 35"
                    stroke={color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                    variants={animate ? pathVariants : undefined}
                    initial={animate ? 'hidden' : undefined}
                    whileInView={animate ? 'visible' : undefined}
                    viewport={{ once: true }}
                />
            </svg>
        ),
    };

    return decorations[type];
}

// Pre-styled decorative elements for common use cases
export function UnderlineAccent({ className = '' }: { className?: string }) {
    return (
        <div className={`absolute -bottom-2 left-0 right-0 h-3 ${className}`}>
            <ScribbleDecoration type="underline" color="rgba(16, 185, 129, 0.4)" />
        </div>
    );
}

export function FloatingFlourish({ className = '' }: { className?: string }) {
    return (
        <div className={`absolute w-24 h-12 opacity-30 ${className}`}>
            <ScribbleDecoration type="flourish" color="#78716c" />
        </div>
    );
}

export function SignatureAccent({ className = '' }: { className?: string }) {
    return (
        <div className={`w-48 h-16 opacity-20 ${className}`}>
            <ScribbleDecoration type="signature" color="#1c1917" />
        </div>
    );
}
