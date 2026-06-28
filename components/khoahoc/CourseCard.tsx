import React from 'react';
import Link from 'next/link';
import { Clock, BookOpen, User } from 'lucide-react';
import { Course } from '@/types/khoahoc.type';

interface CourseCardProps {
    course: Course;
    href?: string;
    showAction?: boolean;
    actionText?: string;
}

export function CourseCard({ course, href, showAction = true, actionText = 'Xem khoá học' }: CourseCardProps) {
    const targetHref = href || `/khoahoc/${course.slug}`;

    const formattedPrice = course.type === 'free'
        ? 'MIỄN PHÍ'
        : course.discountPrice
            ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.discountPrice)
            : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price);

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    return (
        <div
            className="rounded-xl overflow-hidden transition group flex flex-col cursor-pointer"
            style={{
                backgroundColor: 'var(--cn-bg-card)',
                border: '1px solid var(--cn-border)',
                boxShadow: 'var(--cn-shadow-sm)',
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--cn-shadow-lg)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--cn-shadow-sm)'}
        >
            {/* Thumbnail */}
            <Link href={targetHref} className="relative w-full h-[200px] overflow-hidden block shrink-0"
                style={{ backgroundColor: 'var(--cn-bg-section)' }}>
                <img
                    src={course.thumbnail || 'https://via.placeholder.com/600x400?text=Course'}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                />
                {/* Badge giá */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <span
                        className="px-3 py-1 text-white text-[11px] font-bold uppercase rounded-full"
                        style={{
                            backgroundColor: course.type === 'free'
                                ? 'rgba(34, 197, 94, 0.9)'
                                : 'rgba(59, 130, 246, 0.9)',
                        }}
                    >
                        {formattedPrice}
                    </span>
                    {course.type === 'pro' && course.discountPercent > 0 && (
                        <span className="px-3 py-1 text-white text-[11px] font-bold uppercase rounded-full self-start"
                            style={{ backgroundColor: 'rgba(239, 68, 68, 0.9)' }}>
                            -{course.discountPercent}%
                        </span>
                    )}
                </div>
            </Link>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                {/* Meta */}
                <div className="flex items-center justify-between text-xs mb-3" style={{ color: 'var(--cn-text-sub)' }}>
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDuration(course.totalDuration || 0)}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        {course.totalLessons || 0} bài học
                    </div>
                </div>

                {/* Title */}
                <Link href={targetHref}>
                    <h3
                        className="text-lg font-semibold mb-2 line-clamp-2 transition min-h-[3.5rem] text-justify"
                        style={{ color: 'var(--cn-text-main)' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--cn-primary)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--cn-text-main)'}
                    >
                        {course.title}
                    </h3>
                </Link>

                {/* Description */}
                <div className="mb-4 flex-1 min-h-[4.5rem] overflow-hidden">
                    <p className="text-sm line-clamp-3 text-justify" style={{ color: 'var(--cn-text-sub)' }}>
                        {course.description}
                    </p>
                </div>

                {/* Teacher + enroll */}
                <div className="pt-3" style={{ borderTop: '1px solid var(--cn-border)' }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--cn-text-main)' }}>
                            {course.teacherAvatar ? (
                                <img src={course.teacherAvatar} alt={course.teacherName} className="w-7 h-7 rounded-full object-cover" />
                            ) : (
                                <div className="w-7 h-7 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'var(--cn-bg-section)' }}>
                                    <User className="w-3.5 h-3.5" style={{ color: 'var(--cn-text-sub)' }} />
                                </div>
                            )}
                            <span className="font-medium">{course.teacherName || 'Giảng viên'}</span>
                        </div>
                        <span className="text-xs" style={{ color: 'var(--cn-text-sub)' }}>
                            {course.enrollCount || 0} học viên
                        </span>
                    </div>

                    {showAction && (
                        <Link href={targetHref} className="block mt-3">
                            <button
                                className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all"
                                style={{
                                    backgroundColor: 'var(--cn-primary)',
                                    color: 'white',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                            >
                                {actionText}
                            </button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}