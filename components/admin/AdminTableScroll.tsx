'use client';

import { cn } from '@/lib/utils';

interface AdminTableScrollProps {
    children: React.ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    minWidth?: number;
}

const SIZE_CLASS: Record<NonNullable<AdminTableScrollProps['size']>, string> = {
    sm: 'min-w-[720px]',
    md: 'min-w-[900px]',
    lg: 'min-w-[980px]',
};

export function AdminTableScroll({ children, className, size = 'md', minWidth }: AdminTableScrollProps) {
    return (
        <div className={cn('admin-scroll-x w-full', className)}>
            <div
                className={cn('w-full', minWidth == null && SIZE_CLASS[size])}
                style={minWidth != null ? { minWidth: `${minWidth}px` } : undefined}
            >
                {children}
            </div>
        </div>
    );
}
