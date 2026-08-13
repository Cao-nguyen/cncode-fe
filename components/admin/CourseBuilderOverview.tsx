'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    BookOpen,
    Clock,
    Loader2,
    Star,
    Users,
    GraduationCap,
    Tag,
    Calendar,
} from 'lucide-react';
import { khoahocApi } from '@/lib/api/khoahoc.api';
import { AdminCourseOverview, CourseReview } from '@/types/khoahoc.type';
import { EnrolledStudentsStack } from '@/components/khoahoc/EnrolledStudentsStack';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarUrl, avatarImageProps, getImageUrl } from '@/lib/utils/imageUrl';
import { cn } from '@/lib/utils';
import { StarRating } from '@/components/cuahangso/ShopProductReviews';

const STATUS_LABELS: Record<string, string> = {
    draft: 'Nháp',
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Từ chối',
    hidden: 'Ẩn',
};

const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    hidden: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

function formatDuration(seconds?: number) {
    if (!seconds) return '0 phút';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}g ${minutes}p`;
    return `${minutes} phút`;
}

function formatPrice(course: AdminCourseOverview['course']) {
    if (course.type === 'free') return 'Miễn phí';
    const price = course.discountPrice ?? course.price;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

interface CourseBuilderOverviewProps {
    courseId: string;
}

export default function CourseBuilderOverview({ courseId }: CourseBuilderOverviewProps) {
    const [overview, setOverview] = useState<AdminCourseOverview | null>(null);
    const [reviews, setReviews] = useState<CourseReview[]>([]);
    const [reviewStats, setReviewStats] = useState({ average: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [reviewsLoading, setReviewsLoading] = useState(true);

    const loadOverview = useCallback(async () => {
        setLoading(true);
        try {
            const data = await khoahocApi.getAdminCourseOverview(courseId);
            setOverview(data);
        } catch {
            setOverview(null);
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    const loadReviews = useCallback(async () => {
        setReviewsLoading(true);
        try {
            const res = await khoahocApi.getCourseReviews(courseId, 1, 10);
            if (res.success) {
                setReviews(res.data);
                setReviewStats({
                    average: res.stats?.average ?? 0,
                    total: res.stats?.total ?? 0,
                });
            }
        } catch {
            setReviews([]);
        } finally {
            setReviewsLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        loadOverview();
        loadReviews();
    }, [loadOverview, loadReviews]);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!overview) {
        return (
            <div className="flex h-full items-center justify-center px-6 text-sm text-gray-500">
                Không thể tải thông tin khoá học
            </div>
        );
    }

    const { course, chapterCount, lessonCount, enrollCount, recentEnrollees } = overview;
    const teacher =
        typeof course.teacherId === 'object'
            ? course.teacherId
            : { fullName: 'N/A', avatar: undefined };

    return (
        <div className="h-full overflow-y-auto">
            <div className="space-y-4 p-4">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex gap-4 p-4">
                        <div className="h-24 w-36 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                            {course.thumbnail ? (
                                <img
                                    src={getImageUrl(course.thumbnail)}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <BookOpen className="h-8 w-8 text-gray-300" />
                                </div>
                            )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <span
                                    className={cn(
                                        'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                                        STATUS_COLORS[course.status] || STATUS_COLORS.draft,
                                    )}
                                >
                                    {STATUS_LABELS[course.status] || course.status}
                                </span>
                                <span
                                    className={cn(
                                        'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                                        course.type === 'pro'
                                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                                    )}
                                >
                                    {course.type === 'pro' ? 'Pro' : 'Free'}
                                </span>
                            </div>

                            <h2 className="text-lg font-bold leading-snug text-gray-900 dark:text-gray-100">
                                {course.title}
                            </h2>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                                <span className="inline-flex items-center gap-1">
                                    <GraduationCap className="h-3.5 w-3.5" />
                                    {teacher.fullName || 'N/A'}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <Tag className="h-3.5 w-3.5" />
                                    {formatPrice(course)}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {new Date(course.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 border-t border-gray-100 sm:grid-cols-4 dark:border-gray-800">
                        {[
                            { icon: BookOpen, label: 'Chương', value: chapterCount },
                            { icon: BookOpen, label: 'Bài học', value: lessonCount },
                            { icon: Clock, label: 'Thời lượng', value: formatDuration(course.totalDuration) },
                            { icon: Users, label: 'Học viên', value: enrollCount },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="border-r border-gray-100 px-3 py-2.5 last:border-r-0 dark:border-gray-800"
                            >
                                <div className="mb-0.5 flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                                    <item.icon className="h-3 w-3" />
                                    {item.label}
                                </div>
                                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                Học viên đã tham gia
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {enrollCount.toLocaleString('vi-VN')} học viên đã ghi danh
                            </p>
                        </div>
                        {recentEnrollees.length > 0 && (
                            <EnrolledStudentsStack
                                students={recentEnrollees}
                                totalCount={enrollCount}
                                maxVisible={6}
                                size="sm"
                            />
                        )}
                    </div>

                    {recentEnrollees.length === 0 ? (
                        <div className="rounded-lg bg-gray-50 py-6 text-center text-sm text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">
                            Chưa có học viên nào tham gia khoá học này
                        </div>
                    ) : (
                        <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                            {recentEnrollees.map((student) => (
                                <div
                                    key={student._id}
                                    className="flex items-center gap-2 rounded-lg bg-gray-50 px-2.5 py-2 dark:bg-gray-800/50"
                                >
                                    <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-700">
                                        <AvatarImage
                                            {...avatarImageProps}
                                            src={getAvatarUrl(student.avatar)}
                                            alt={student.fullName}
                                        />
                                        <AvatarFallback className="text-xs">
                                            {student.fullName.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                                        {student.fullName}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                Đánh giá khoá học
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {reviewStats.total} đánh giá từ học viên
                            </p>
                        </div>
                        {reviewStats.total > 0 && (
                            <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 dark:bg-amber-950/20">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" data-filled={true} />
                                <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                                    {reviewStats.average.toFixed(1)}
                                </span>
                                <span className="text-xs text-gray-500">/ 5</span>
                            </div>
                        )}
                    </div>

                    {reviewsLoading ? (
                        <div className="flex justify-center py-6">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="rounded-lg bg-gray-50 py-6 text-center dark:bg-gray-800/50">
                            <Star className="mx-auto mb-1.5 h-6 w-6 text-gray-300" data-filled={false} />
                            <p className="text-sm text-gray-500 dark:text-gray-400">Chưa có đánh giá nào</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {reviews.map((review) => {
                                const name = review.user?.fullName || 'Học viên';
                                return (
                                    <article
                                        key={review._id}
                                        className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50"
                                    >
                                        <div className="flex items-start gap-2.5">
                                            <Avatar className="h-8 w-8 shrink-0 border border-gray-200 dark:border-gray-700">
                                                <AvatarImage
                                                    {...avatarImageProps}
                                                    src={getAvatarUrl(review.user?.avatar)}
                                                    alt={name}
                                                />
                                                <AvatarFallback className="text-xs">{name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center justify-between gap-1">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                        {name}
                                                    </p>
                                                    <span className="text-[11px] text-gray-400">
                                                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                                <StarRating value={review.rating} readonly size="sm" />
                                                <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                                                    {review.content}
                                                </p>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
