// components/custom/BlogCard.tsx
'use client';

import React from 'react';
import { Calendar, User, Clock, ArrowRight, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface BlogCardProps {
    id: string;
    title: string;
    description: string;
    image?: string;
    author: string;
    authorAvatar?: string;
    date: string;
    readTime: string;
    views?: number;
    category?: string;
    href?: string;
    onReadMore?: () => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({
    id,
    title,
    description,
    image,
    author,
    authorAvatar,
    date,
    readTime,
    views,
    category,
    href,
    onReadMore,
}) => {
    const getInitials = (name: string) => {
        return name.charAt(0).toUpperCase();
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="group bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] overflow-hidden border border-[var(--cn-border)] shadow-[var(--cn-shadow-sm)] hover:shadow-[var(--cn-shadow-md)] transition-all duration-300">
            {/* Image */}
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[var(--cn-primary)]/20 to-[var(--cn-primary)]/5">
                {image ? (
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-[var(--cn-primary)]/10 flex items-center justify-center">
                            <span className="text-4xl">📝</span>
                        </div>
                    </div>
                )}
                {category && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 bg-[var(--cn-primary)] text-white text-[11px] lg:text-[13px] font-medium rounded-[var(--cn-radius-sm)]">
                        {category}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Author & Date */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-[var(--cn-primary)]/10 overflow-hidden flex-shrink-0">
                        {authorAvatar ? (
                            <Image
                                src={authorAvatar}
                                alt={author}
                                width={24}
                                height={24}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] lg:text-[12px] font-semibold text-[var(--cn-primary)]">
                                {getInitials(author)}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] lg:text-[13px] text-[var(--cn-text-muted)]">
                        <span>{author}</span>
                        <span>•</span>
                        <span>{formatDate(date)}</span>
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-sm lg:text-base font-bold text-[var(--cn-text-main)] mb-2 line-clamp-2 group-hover:text-[var(--cn-primary)] transition-colors">
                    {title}
                </h3>

                {/* Description */}
                <p className="text-[12px] lg:text-[14px] text-[var(--cn-text-sub)] mb-3 line-clamp-3">
                    {description}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between pt-3 border-t border-[var(--cn-border)]">
                    <div className="flex items-center gap-3 text-[11px] lg:text-[13px] text-[var(--cn-text-muted)]">
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{readTime} phút đọc</span>
                        </div>
                        {views !== undefined && (
                            <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                <span>{views.toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    {href ? (
                        <Link
                            href={href}
                            className="flex items-center gap-1 text-[11px] lg:text-[13px] font-medium text-[var(--cn-primary)] hover:text-[var(--cn-primary-hover)] transition-colors"
                        >
                            <span>Đọc tiếp</span>
                            <ArrowRight className="w-3 h-3" />
                        </Link>
                    ) : (
                        <button
                            onClick={onReadMore}
                            className="flex items-center gap-1 text-[11px] lg:text-[13px] font-medium text-[var(--cn-primary)] hover:text-[var(--cn-primary-hover)] transition-colors"
                        >
                            <span>Đọc tiếp</span>
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};