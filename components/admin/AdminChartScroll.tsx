'use client';

import { cn } from '@/lib/utils';

interface AdminChartScrollProps {
    children: React.ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    minWidth?: number;
}

const SIZE_CLASS: Record<NonNullable<AdminChartScrollProps['size']>, string> = {
    sm: 'min-w-[480px] md:min-w-[560px] lg:min-w-0',
    md: 'min-w-[560px] md:min-w-[720px] lg:min-w-0',
    lg: 'min-w-[640px] md:min-w-[800px] lg:min-w-0',
};

export function AdminChartScroll({ children, className, size = 'md', minWidth }: AdminChartScrollProps) {
    return (
        <div className={cn('admin-scroll-x w-full lg:overflow-x-visible', className)}>
            <div
                className={cn('w-full lg:min-w-0', minWidth == null && SIZE_CLASS[size])}
                style={minWidth != null ? { minWidth: `${minWidth}px` } : undefined}
            >
                {children}
            </div>
        </div>
    );
}
