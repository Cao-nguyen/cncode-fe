'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, BookOpen, Clock, Users, ChevronRight, FileText, Star, Play } from 'lucide-react';
import { CustomInputSearch } from '@/components/custom/CustomInputSearch';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { toast } from 'sonner';
import * as khoahocApi from '@/lib/api/khoahoc.api';
import type { Course, CourseQuery } from '@/types/khoahoc.type';

export default function CoursesPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [sortFilter, setSortFilter] = useState<string>('newest');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const params: CourseQuery = {};
                if (typeFilter !== 'all') params.type = typeFilter as 'free' | 'pro';
                if (sortFilter !== 'newest') params.sort = sortFilter as 'price-asc' | 'price-desc' | 'newest';
                const data = await khoahocApi.getCourses(params);
                const courseList = (() => {
                    if (Array.isArray(data)) return data;
                    if (data && typeof data === 'object' && 'courses' in data) {
                        return (data as { courses: Course[] }).courses;
                    }
                    return [];
                })();
                setCourses(courseList);
            } catch (error) {
                console.error('Fetch error:', error);
                toast.error('Có lỗi khi tải danh sách khoá học');
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [typeFilter, sortFilter]);

    const filteredCourses = Array.isArray(courses)
        ? courses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
        : [];

    const formatDuration = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h > 0) return `${h} giờ ${m} phút`;
        return `${m} phút`;
    };

    return (
        <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--cn-bg-main)' }}>
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--cn-text-main)' }}>
                                Khoá học
                            </h1>
                            <p style={{ color: 'var(--cn-text-sub)' }}>Khám phá các khoá học lập trình từ cơ bản đến nâng cao</p>
                        </div>
                    </div>
                </div>

                {/* Filter Card */}
                <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: 'var(--cn-bg-card)', border: '1px solid var(--cn-border)' }}>
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1">
                            <CustomInputSearch
                                placeholder="Tìm kiếm khoá học..."
                                value={searchQuery}
                                onChange={setSearchQuery}
                                size="medium"
                            />
                        </div>
                        <div className="w-full md:w-36">
                            <CustomSelect
                                value={typeFilter}
                                onChange={setTypeFilter}
                                options={[
                                    { value: 'all', label: 'Tất cả' },
                                    { value: 'free', label: 'Miễn phí' },
                                    { value: 'pro', label: 'Trả phí' },
                                ]}
                            />
                        </div>
                        <div className="w-full md:w-44">
                            <CustomSelect
                                value={sortFilter}
                                onChange={setSortFilter}
                                options={[
                                    { value: 'newest', label: 'Mới nhất' },
                                    { value: 'price-asc', label: 'Giá: Thấp đến cao' },
                                    { value: 'price-desc', label: 'Giá: Cao đến thấp' },
                                ]}
                            />
                        </div>
                    </div>
                </div>

                {/* Course Grid - 4 cột */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--cn-bg-card)', border: '1px solid var(--cn-border)' }}>
                                <div className="w-full h-[180px] animate-pulse" style={{ backgroundColor: 'var(--cn-bg-section)' }} />
                                <div className="p-4 space-y-3">
                                    <div className="h-5 w-3/4 rounded animate-pulse" style={{ backgroundColor: 'var(--cn-bg-section)' }} />
                                    <div className="flex gap-2">
                                        <div className="h-3 w-16 rounded animate-pulse" style={{ backgroundColor: 'var(--cn-bg-section)' }} />
                                        <div className="h-3 w-20 rounded animate-pulse" style={{ backgroundColor: 'var(--cn-bg-section)' }} />
                                    </div>
                                    <div className="flex items-center gap-2 pt-1">
                                        <div className="w-6 h-6 rounded-full animate-pulse" style={{ backgroundColor: 'var(--cn-bg-section)' }} />
                                        <div className="h-3 w-24 rounded animate-pulse" style={{ backgroundColor: 'var(--cn-bg-section)' }} />
                                    </div>
                                    <div className="pt-2 border-t" style={{ borderColor: 'var(--cn-border)' }}>
                                        <div className="h-6 w-20 rounded animate-pulse" style={{ backgroundColor: 'var(--cn-bg-section)' }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="text-center py-20">
                        <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--cn-border)' }} />
                        <p style={{ color: 'var(--cn-text-sub)' }}>Không tìm thấy khoá học nào</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredCourses.map(course => (
                            <div
                                key={course._id}
                                onClick={() => router.push(`/khoahoc/${course.slug}`)}
                                className="rounded-xl overflow-hidden transition group flex flex-col cursor-pointer"
                                style={{
                                    backgroundColor: 'var(--cn-bg-card)',
                                    border: '1px solid var(--cn-border)',
                                    boxShadow: 'var(--cn-shadow-sm)'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--cn-shadow-lg)'}
                                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--cn-shadow-sm)'}
                            >
                                {/* Thumbnail */}
                                <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                    {course.thumbnail ? (
                                        <img
                                            src={course.thumbnail}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BookOpen className="w-10 h-10 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 flex gap-1.5">
                                        {course.type === 'pro' && (
                                            <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs font-bold rounded-full">
                                                Pro
                                            </span>
                                        )}
                                        {course.discountPrice && course.price && course.price > course.discountPrice && (
                                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                                                -{Math.round(((course.price - course.discountPrice) / course.price) * 100)}%
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 space-y-3">
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 group-hover:text-blue-500 transition-colors">
                                        {course.title}
                                    </h3>

                                    <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <Play className="w-3 h-3" />
                                                <span>{course.totalLessons} bài học</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                <span>{course.enrollCount} học viên</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            {course.totalDuration > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{formatDuration(course.totalDuration)}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1 text-yellow-500">
                                                <Star className="w-3 h-3 fill-yellow-500" data-filled={true} />
                                                <span className="font-semibold">5.0</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Teacher */}
                                    <div className="flex items-center gap-2 pt-1">
                                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden shrink-0 border border-gray-300 dark:border-gray-500">
                                            {typeof course.teacherId === 'object' && course.teacherId.avatar ? (
                                                <img src={course.teacherId.avatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">?</div>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {typeof course.teacherId === 'object' && course.teacherId.fullName
                                                ? (course.teacherId.fullName)
                                                : 'Giảng viên'}
                                        </span>
                                    </div>

                                    {/* Price & Action */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                                        <div>
                                            {course.type === 'free' ? (
                                                <span className="text-lg font-bold text-green-500">Miễn phí</span>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold text-red-500 dark:text-gray-100">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.discountPrice || course.price)}
                                                    </span>
                                                    {course.discountPrice && course.price && course.price > course.discountPrice ? (
                                                        <>
                                                            <span className="text-xs text-gray-400 line-through">
                                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price)}
                                                            </span>
                                                        </>
                                                    ) : null}
                                                </div>
                                            )}
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}