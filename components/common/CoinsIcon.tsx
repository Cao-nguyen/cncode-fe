'use client';

import Image from 'next/image';

interface CoinsIconProps {
    size?: number;
    className?: string;
}

export default function CoinsIcon({ size = 16, className = '' }: CoinsIconProps) {
    return (
        <Image
            src="/icons/coins.svg"
            alt="Xu"
            width={size}
            height={size}
            className={`inline-block ${className}`}
        />
    );
}