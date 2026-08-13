'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CourseEnrollee } from '@/types/khoahoc.type';
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from '@/components/ui/avatar';
import { getAvatarUrl, avatarImageProps } from '@/lib/utils/imageUrl';
import { cn } from '@/lib/utils';

interface EnrolledStudentsStackProps {
    students: CourseEnrollee[];
    totalCount: number;
    maxVisible?: number;
    size?: 'sm' | 'default' | 'lg';
    className?: string;
}

function AvatarTip({
    label,
    children,
    className,
}: {
    label: string;
    children: React.ReactNode;
    className?: string;
}) {
    const [pinned, setPinned] = useState(false);
    const [hovered, setHovered] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const visible = pinned || hovered;

    useEffect(() => {
        if (!pinned) return;

        const handleOutside = (event: MouseEvent | TouchEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) {
                setPinned(false);
            }
        };

        document.addEventListener('mousedown', handleOutside);
        document.addEventListener('touchstart', handleOutside);
        return () => {
            document.removeEventListener('mousedown', handleOutside);
            document.removeEventListener('touchstart', handleOutside);
        };
    }, [pinned]);

    return (
        <div
            ref={rootRef}
            className={cn('relative', className)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={(event) => {
                event.stopPropagation();
                setPinned((prev) => !prev);
            }}
        >
            {children}
            {visible && (
                <div
                    role="tooltip"
                    className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg dark:bg-gray-100 dark:text-gray-900"
                >
                    {label}
                    <span
                        aria-hidden
                        className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-gray-900 dark:border-t-gray-100"
                    />
                </div>
            )}
        </div>
    );
}

export function EnrolledStudentsStack({
    students,
    totalCount,
    maxVisible = 8,
    size = 'default',
    className,
}: EnrolledStudentsStackProps) {
    if (totalCount <= 0) return null;

    const visible = students.slice(0, maxVisible);
    const remaining = Math.max(0, totalCount - visible.length);

    return (
        <div className={cn('flex flex-wrap items-center gap-3', className)}>
            <AvatarGroup>
                {visible.map((student) => {
                    const name = student.fullName || 'Học viên';
                    return (
                        <AvatarTip key={student._id} label={name}>
                            <Avatar
                                size={size}
                                className="cursor-pointer border-2 border-white dark:border-gray-900"
                            >
                                <AvatarImage
                                    {...avatarImageProps}
                                    src={getAvatarUrl(student.avatar)}
                                    alt={name}
                                />
                                <AvatarFallback className="bg-blue-100 text-xs font-semibold text-blue-700">
                                    {name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </AvatarTip>
                    );
                })}
                {remaining > 0 && (
                    <AvatarTip label={`${remaining.toLocaleString('vi-VN')} học viên khác`}>
                        <AvatarGroupCount className="cursor-pointer bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            +{remaining}
                        </AvatarGroupCount>
                    </AvatarTip>
                )}
            </AvatarGroup>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-gray-100">{totalCount.toLocaleString('vi-VN')}</span>
                {' '}học viên đã tham gia
            </p>
        </div>
    );
}
