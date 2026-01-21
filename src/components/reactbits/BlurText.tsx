'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface BlurTextProps {
    text?: string;
    delay?: number;
    className?: string;
    animateBy?: 'words' | 'letters';
    direction?: 'top' | 'bottom';
    threshold?: number;
    rootMargin?: string;
    onAnimationComplete?: () => void;
}

const BlurText = ({
    text = '',
    delay = 200,
    className = '',
    animateBy = 'words',
    direction = 'top',
    threshold = 0.1,
    rootMargin = '0px',
    onAnimationComplete,
}: BlurTextProps) => {
    const elements = animateBy === 'words' ? text.split(' ') : text.split('');
    const [inView, setInView] = useState(false);
    const ref = useRef<HTMLParagraphElement>(null);
    const animatedCount = useRef(0);

    const defaultFrom =
        direction === 'top'
            ? { filter: 'blur(10px)', opacity: 0, transform: 'translate3d(0,-50px,0)' }
            : { filter: 'blur(10px)', opacity: 0, transform: 'translate3d(0,50px,0)' };

    const defaultTo = { filter: 'blur(0px)', opacity: 1, transform: 'translate3d(0,0,0)' };

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    if (ref.current) observer.unobserve(ref.current);
                }
            },
            { threshold, rootMargin }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [threshold, rootMargin]);

    return (
        <p ref={ref} className={`${className} flex flex-wrap`}>
            {elements.map((element, index) => (
                <motion.span
                    key={index}
                    initial={defaultFrom}
                    animate={inView ? defaultTo : defaultFrom}
                    transition={{
                        duration: 1,
                        delay: index * (delay / 1000),
                        ease: [0.25, 0.1, 0.25, 1],
                    }}
                    className="inline-block will-change-[transform,filter,opacity]"
                    onAnimationComplete={() => {
                        animatedCount.current += 1;
                        if (animatedCount.current === elements.length && onAnimationComplete) {
                            onAnimationComplete();
                        }
                    }}
                >
                    {element === ' ' ? '\u00A0' : element}
                    {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
                </motion.span>
            ))}
        </p>
    );
};

export default BlurText;
