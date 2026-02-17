'use client';

import { motion } from 'framer-motion';

export const AnimatedAiIcon = ({ className = "w-6 h-6" }: { className?: string }) => {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            {/* Core Sparkle - Solid and punchy, scaled down */}
            <motion.svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute inset-0 w-full h-full text-stone-900 drop-shadow-sm"
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.8, 0.9, 0.8] }}
                transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                }}
            >
                <path
                    d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"
                    fill="currentColor"
                />
            </motion.svg>

            {/* Tight Orbit Satellite 1 */}
            <motion.svg
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute w-full h-full text-stone-500"
                style={{ originX: 0.5, originY: 0.5 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
                {/* Positioned closer to center */}
                <circle cx="18" cy="6" r="1.5" />
            </motion.svg>

            {/* Tight Orbit Satellite 2 */}
            <motion.svg
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute w-full h-full text-stone-400"
                style={{ originX: 0.5, originY: 0.5 }}
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            >
                {/* Positioned closer to center */}
                <circle cx="6" cy="18" r="1" />
            </motion.svg>
        </div>
    );
};
