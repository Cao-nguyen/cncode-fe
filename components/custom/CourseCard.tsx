// components/custom/CourseCard.tsx
'use client';

import React from 'react';
import { Clock, Users, Star, Eye, Heart, BookOpen, Award, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface CourseCardProps {
    id: string;
    title: string;
    description: string;
    thumbnail?: string;
    instructor: string;
    instructorAvatar?: string;
    price: number;
    originalPrice?: number;
    rating?: number;
    students?: number;
    duration?: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
    isFree?: boolean;
    isHot?: boolean;
    isNew?: boolean;
    discount?: number;
    href?: string;
    onEnroll?: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
    id,
    title,
    description,
    thumbnail,
    instructor,
    instructorAvatar,
    price,
    originalPrice,
    rating = 0,
    students = 0,
    duration = 'N/A',
    level,
    isFree = false,
    isHot = false,
    isNew = false,
    discount,
    href,
    onEnroll,
}) => {
    const discountPercent = discount || (originalPrice && price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);
    const displayPrice = isFree ? 0 : price;
    const displayOriginalPrice = isFree ? null : originalPrice;

    const getLevelColor = () => {
        switch (level) {
            case 'beginner': return 'bg-green-100 text-green-700';
            case 'intermediate': return 'bg-yellow-100 text-yellow-700';
            case 'advanced': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getLevelLabel = () => {
        switch (level) {
            case 'beginner': return 'Cơ bản';
            case 'intermediate': return 'Trung cấp';
            case 'advanced': return 'Nâng cao';
            default: return '';
        }
    };

    return (
        <div className="group bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] overflow-hidden border border-[var(--cn-border)] shadow-[var(--cn-shadow-sm)] hover:shadow-[var(--cn-shadow-md)] transition-all duration-300">
            {/* Thumbnail */}
            <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[var(--cn-primary)]/20 to-[var(--cn-primary)]/5">
                {thumbnail ? (
                    <Image
                        src={thumbnail}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-[var(--cn-primary)]/30" />
                    </div>
                )}

                {/* Badges */}
                {isHot && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-orange-500 text-white text-[11px] lg:text-[13px] font-medium rounded-[var(--cn-radius-sm)]">
                        🔥 Hot
                    </span>
                )}
                {isNew && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-green-500 text-white text-[11px] lg:text-[13px] font-medium rounded-[var(--cn-radius-sm)]">
                        Mới
                    </span>
                )}
                {discountPercent > 0 && !isFree && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-red-500 text-white text-[11px] lg:text-[13px] font-medium rounded-[var(--cn-radius-sm)]">
                        -{discountPercent}%
                    </span>
                )}
                {isFree && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-green-500 text-white text-[11px] lg:text-[13px] font-medium rounded-[var(--cn-radius-sm)]">
                        Miễn phí
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Title */}
                <h3 className="text-sm lg:text-base font-bold text-[var(--cn-text-main)] mb-2 line-clamp-2 group-hover:text-[var(--cn-primary)] transition-colors">
                    {title}
                </h3>

                {/* Description */}
                <p className="text-[12px] lg:text-[14px] text-[var(--cn-text-sub)] mb-3 line-clamp-2">
                    {description}
                </p>

                {/* Instructor */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full bg-[var(--cn-primary)]/10 overflow-hidden flex-shrink-0">
                        {instructorAvatar ? (
                            <Image
                                src={instructorAvatar}
                                alt={instructor}
                                width={20}
                                height={20}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] lg:text-[11px] font-semibold text-[var(--cn-primary)]">
                                {instructor.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <span className="text-[11px] lg:text-[13px] text-[var(--cn-text-muted)] truncate">
                        {instructor}
                    </span>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-3 mb-3 text-[11px] lg:text-[13px] text-[var(--cn-text-muted)]">
                    {rating > 0 && (
                        <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{rating.toFixed(1)}</span>
                        </div>
                    )}
                    {students > 0 && (
                        <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{students.toLocaleString()} học viên</span>
                        </div>
                    )}
                    {duration !== 'N/A' && (
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{duration}</span>
                        </div>
                    )}
                </div>

                {/* Level Badge */}
                {level && (
                    <div className={`inline-flex px-1.5 py-0.5 rounded-full text-[10px] lg:text-[12px] font-medium ${getLevelColor()} mb-3`}>
                        {getLevelLabel()}
                    </div>
                )}

                {/* Price */}
                <div className="flex items-center justify-between pt-3 border-t border-[var(--cn-border)]">
                    <div>
                        {displayOriginalPrice ? (
                            <div className="flex items-center gap-2">
                                <span className="text-sm lg:text-base font-bold text-[var(--cn-primary)]">
                                    {displayPrice.toLocaleString()}đ
                                </span>
                                <span className="text-[12px] lg:text-[14px] text-[var(--cn-text-muted)] line-through">
                                    {displayOriginalPrice.toLocaleString()}đ
                                </span>
                            </div>
                        ) : displayPrice > 0 ? (
                            <span className="text-sm lg:text-base font-bold text-[var(--cn-primary)]">
                                {displayPrice.toLocaleString()}đ
                            </span>
                        ) : (
                            <span className="text-sm lg:text-base font-bold text-green-600">
                                Miễn phí
                            </span>
                        )}
                    </div>

                    {href ? (
                        <Link
                            href={href}
                            className="flex items-center gap-1 px-3 py-1.5 bg-[var(--cn-primary)] text-white rounded-[var(--cn-radius-sm)] text-[11px] lg:text-[13px] font-medium hover:bg-[var(--cn-primary-hover)] transition-colors"
                        >
                            <Eye className="w-3 h-3" />
                            <span>Xem chi tiết</span>
                        </Link>
                    ) : (
                        <button
                            onClick={onEnroll}
                            className="flex items-center gap-1 px-3 py-1.5 bg-[var(--cn-primary)] text-white rounded-[var(--cn-radius-sm)] text-[11px] lg:text-[13px] font-medium hover:bg-[var(--cn-primary-hover)] transition-colors"
                        >
                            <TrendingUp className="w-3 h-3" />
                            <span>Đăng ký</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};