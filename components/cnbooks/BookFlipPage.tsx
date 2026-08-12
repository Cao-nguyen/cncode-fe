'use client';

import React from 'react';
import { motion } from 'framer-motion';

const FLIP_DURATION = 0.65;

interface BookFlipPageProps {
    front: React.ReactNode;
    back: React.ReactNode;
    direction: 'next' | 'prev';
    onComplete: () => void;
    className?: string;
}

export function BookFlipPage({
    front,
    back,
    direction,
    onComplete,
    className = '',
}: BookFlipPageProps) {
    const origin = direction === 'next' ? 'left center' : 'right center';
    const rotateTo = direction === 'next' ? -180 : 180;

    return (
        <motion.div
            className={`absolute inset-0 z-10 ${className}`}
            style={{
                transformOrigin: origin,
                transformStyle: 'preserve-3d',
            }}
            initial={{ rotateY: 0 }}
            animate={{ rotateY: rotateTo }}
            transition={{ duration: FLIP_DURATION, ease: [0.45, 0.05, 0.25, 0.95] }}
            onAnimationComplete={onComplete}
        >
            <div
                className="absolute inset-0 bg-white overflow-hidden"
                style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    backgroundImage:
                        direction === 'next'
                            ? 'linear-gradient(to left, rgba(0,0,0,0.02) 0%, transparent 4%)'
                            : 'linear-gradient(to right, rgba(0,0,0,0.02) 0%, transparent 4%)',
                }}
            >
                {front}
            </div>
            <div
                className="absolute inset-0 bg-white overflow-hidden"
                style={{
                    transform: 'rotateY(180deg)',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    backgroundImage:
                        direction === 'next'
                            ? 'linear-gradient(to right, rgba(0,0,0,0.02) 0%, transparent 4%)'
                            : 'linear-gradient(to left, rgba(0,0,0,0.02) 0%, transparent 4%)',
                }}
            >
                {back}
            </div>
            {/* Page curl shadow during flip */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        direction === 'next'
                            ? 'linear-gradient(to left, rgba(0,0,0,0.12), transparent 40%)'
                            : 'linear-gradient(to right, rgba(0,0,0,0.12), transparent 40%)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.6, 0] }}
                transition={{ duration: FLIP_DURATION }}
            />
        </motion.div>
    );
}

export { FLIP_DURATION };
