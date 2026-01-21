'use client';

import { ReactNode } from 'react';

interface FadeContentProps {
    children: ReactNode;
    className?: string;
    style?: React.CSSProperties;
    blur?: boolean;
    duration?: number;
    easing?: string;
    initialOpacity?: number;
}

const FadeContent = ({
    children,
    className = '',
    style,
}: FadeContentProps) => {
    return (
        <div className={className} style={style}>
            {children}
        </div>
    );
};

export default FadeContent;
