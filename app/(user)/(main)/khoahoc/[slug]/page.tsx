'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCourseBySlug, getEnrollmentStatus, enrollPayOS, enrollCoin } from '@/lib/api/khoahoc.api';
import { CourseReviews } from '@/components/khoahoc/CourseReviews';
import { EnrolledStudentsStack } from '@/components/khoahoc/EnrolledStudentsStack';
import { Course, CourseEnrollee, Enrollment, ChapterWithLessons } from '@/types/khoahoc.type';
import { getCourseLastLesson, removeCourseLastLesson } from '@/lib/localProgress';
import { Loader2, PlayCircle, BookOpen, Clock, Shield, Check, Lock, ChevronDown, ChevronUp, Users } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import StaticContent from '@/components/common/StaticContent';
import axios from 'axios';
import { getAvatarUrl, avatarImageProps, getImageUrl } from '@/lib/utils/imageUrl';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function CourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [course, setCourse] = useState<Course | null>(null);
    const [chapters, setChapters] = useState<ChapterWithLessons[]>([]);
    const [recentEnrollees, setRecentEnrollees] = useState<CourseEnrollee[]>([]);
    const [loading, setLoading] = useState(true);
    const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
    const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({});
    const [payingMethod, setPayingMethod] = useState<'free' | 'payos' | 'coin' | null>(null);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (enrollment && enrollment.paymentStatus === 'pending' && course?._id) {
            interval = setInterval(async () => {
                try {
                    const status = await getEnrollmentStatus(course._id);
                    if (status && status.paymentStatus !== 'pending') {
                        setEnrollment(status);
                        if (status.paymentStatus === 'completed') {
                            toast.success('Thanh toán thành công! Chúc bạn học tốt.');
                        }
                    }
                } catch {
                    /* ignore polling errors */
                }
            }, 3000);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [enrollment?.paymentStatus, course?._id]);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true);
                const data = await getCourseBySlug(slug);
                setCourse(data.course);
                setRecentEnrollees(data.recentEnrollees || []);
                if (data.chapters?.length) {
                    setChapters(data.chapters);
                    const initialOpen: Record<string, boolean> = {};
                    data.chapters.forEach((c) => {
                        if (c._id) initialOpen[c._id] = true;
                    });
                    setOpenChapters(initialOpen);
                }

                try {
                    const enrollStatus = await getEnrollmentStatus(data.course._id);
                    setEnrollment(enrollStatus);
                } catch {
                    // Not enrolled or not logged in
                }
            } catch (error) {
                console.error(error);
                router.push('/khoahoc');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchDetail();
        }
    }, [slug, router]);

    const handleEnroll = async (method: 'free' | 'payos' | 'coin') => {
        if (!course) return;
        try {
            setPayingMethod(method);
            if (method === 'free') {
                const nextEnrollment = await enrollCoin(course._id);
                setEnrollment(nextEnrollment);
                toast.success('Đăng ký thành công!');
            } else if (method === 'payos') {
                const res = await enrollPayOS(course._id);
                if (res?.alreadyEnrolled && res.enrollment) {
                    setEnrollment(res.enrollment);
                    toast.success('Bạn đã sở hữu khoá học này.');
                    return;
                }
                if (res?.checkoutUrl) {
                    window.location.href = res.checkoutUrl;
                } else {
                    toast.error('Không nhận được liên kết thanh toán.');
                }
            } else if (method === 'coin') {
                const nextEnrollment = await enrollCoin(course._id);
                setEnrollment(nextEnrollment);
                toast.success('Đăng ký thành công!');
            }
        } catch (error) {
            console.error('Enroll error', error);
            const status = axios.isAxiosError(error) ? error.response?.status : undefined;
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message
                : undefined;
            if (status === 401) {
                toast.error('Vui lòng đăng nhập để đăng ký khoá học.');
                router.push(`/login?next=/khoahoc/${slug}`);
                return;
            }
            toast.error(message || 'Có lỗi xảy ra khi đăng ký!');
        } finally {
            setPayingMethod(null);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!course) return null;

    const teacherInfo = typeof course.teacherId === 'object' ? course.teacherId : null;
    const teacherName = teacherInfo?.fullName || 'Giảng viên';
    const teacherAvatar = teacherInfo?.avatar || null;

    const formattedPrice = course.type === 'free'
        ? 'MIỄN PHÍ'
        : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.discountPrice || course.price);

    const originalPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price);

    const formatDuration = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h > 0) return `${h} giờ ${m} phút`;
        return `${m} phút`;
    };

    const formatLessonDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        if (h > 0) {
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const isEnrolled = enrollment && enrollment.paymentStatus === 'completed';
    const isPending = enrollment && enrollment.paymentStatus === 'pending';
    const isPaying = payingMethod !== null;

    const toggleChapter = (id: string) => {
        setOpenChapters(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const getStartLessonId = (): string => {
        if (!course?._id || !chapters.length) return '';

        const savedLessonId = getCourseLastLesson(course._id);
        if (savedLessonId) {
            const stillExists = chapters.some(ch =>
                ch.lessons?.some(lesson => lesson._id === savedLessonId)
            );
            if (stillExists) return savedLessonId;
            removeCourseLastLesson(course._id);
        }

        const firstChapter = chapters[0];
        const firstLesson = firstChapter?.lessons?.[0];
        return firstLesson?._id || '';
    };

    const sidebarCard = (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl sm:rounded-3xl lg:sticky lg:top-24">
            <div className="relative aspect-video bg-gray-200">
                {course.thumbnail ? (
                    <img
                        src={getImageUrl(course.thumbnail)}
                        alt={course.title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <BookOpen className="h-12 w-12" />
                    </div>
                )}
                {!isEnrolled && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/30 backdrop-blur-md sm:h-16 sm:w-16">
                            <PlayCircle className="h-7 w-7 text-white sm:h-8 sm:w-8" />
                        </div>
                    </div>
                )}
            </div>

            <div className="p-5 sm:p-6 lg:p-8">
                {!isEnrolled && !isPending && (
                    <div className="mb-5 sm:mb-6">
                        {course.type === 'free' ? (
                            <div className="text-2xl font-bold text-gray-900 sm:text-3xl">MIỄN PHÍ</div>
                        ) : (
                            <div className="flex flex-wrap items-end gap-2 sm:gap-3">
                                <span className="text-2xl font-bold text-gray-900 sm:text-3xl">{formattedPrice}</span>
                                {course.discountPercent > 0 && (
                                    <span className="pb-1 text-base text-gray-400 line-through sm:text-lg">{originalPrice}</span>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {isEnrolled ? (
                    <Link href={`/learn/${getStartLessonId()}`}>
                        <button className="mb-5 w-full rounded-2xl bg-blue-600 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-700 sm:mb-6 sm:py-4 sm:text-lg">
                            VÀO HỌC NGAY
                        </button>
                    </Link>
                ) : isPending ? (
                    <div className="mb-5 space-y-3 sm:mb-6">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full rounded-2xl bg-amber-500 py-3.5 text-base font-bold text-white shadow-lg shadow-amber-500/30 transition-colors hover:bg-amber-600 sm:py-4 sm:text-lg"
                        >
                            ĐANG XÁC NHẬN THANH TOÁN...
                        </button>
                        <p className="text-center text-xs italic text-gray-500">
                            Nếu bạn đã thanh toán thành công, vui lòng đợi 1-2 phút hoặc nhấn làm mới trang.
                        </p>
                    </div>
                ) : course.type === 'free' ? (
                    <button
                        onClick={() => handleEnroll('free')}
                        disabled={isPaying}
                        className="mb-5 w-full rounded-2xl bg-blue-600 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 sm:mb-6 sm:py-4 sm:text-lg"
                    >
                        {payingMethod === 'free' ? (
                            <span className="inline-flex items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                ĐANG ĐĂNG KÝ
                            </span>
                        ) : 'ĐĂNG KÝ HỌC'}
                    </button>
                ) : (
                    <div className="mb-5 flex flex-col gap-3 sm:mb-6">
                        <button
                            onClick={() => handleEnroll('payos')}
                            disabled={isPaying}
                            className="w-full rounded-2xl bg-blue-600 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 sm:py-4 sm:text-lg"
                        >
                            {payingMethod === 'payos' ? (
                                <span className="inline-flex items-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    ĐANG TẠO THANH TOÁN
                                </span>
                            ) : 'MUA KHOÁ HỌC (PayOS)'}
                        </button>
                        {course.allowCoinPayment && (
                            <button
                                onClick={() => handleEnroll('coin')}
                                disabled={isPaying}
                                className="w-full rounded-2xl bg-yellow-500 py-3.5 text-base font-bold text-white shadow-lg shadow-yellow-500/30 transition-colors hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-70 sm:py-4 sm:text-lg"
                            >
                                {payingMethod === 'coin' ? (
                                    <span className="inline-flex items-center gap-2">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        ĐANG THANH TOÁN
                                    </span>
                                ) : 'MUA BẰNG COIN'}
                            </button>
                        )}
                    </div>
                )}

                <ul className="space-y-3 text-sm text-gray-600 sm:space-y-4">
                    <li className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 shrink-0 text-gray-400" />
                        <span>Tổng số <strong>{course.totalLessons}</strong> bài học</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <Clock className="h-5 w-5 shrink-0 text-gray-400" />
                        <span>Thời lượng <strong>{formatDuration(course.totalDuration)}</strong></span>
                    </li>
                    <li className="flex items-center gap-3">
                        <Shield className="h-5 w-5 shrink-0 text-gray-400" />
                        <span>Học mọi lúc, mọi nơi</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 shrink-0 text-gray-400" />
                        <span>Cấp chứng chỉ hoàn thành</span>
                    </li>
                </ul>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-16 sm:pb-20">
            <div className="bg-gray-900 px-4 py-8 text-white sm:px-6 sm:py-10 lg:py-12">
                <div className="mx-auto max-w-7xl">
                    <div className="text-sm text-gray-400">
                        <Link href="/khoahoc" className="hover:text-white">Khoá học</Link>
                        <span className="mx-2">/</span>
                        <span className="text-white">{course.title}</span>
                    </div>

                    <h1 className="mt-4 text-2xl font-bold leading-tight sm:mt-6 sm:text-3xl md:text-4xl">
                        {course.title}
                    </h1>

                    <div className="mt-5 flex flex-wrap items-center gap-4 text-sm sm:mt-6 sm:gap-6">
                        <div className="flex items-center gap-2.5">
                            <Avatar className="h-9 w-9 shrink-0 border-2 border-white/20 sm:h-10 sm:w-10">
                                <AvatarImage
                                    {...avatarImageProps}
                                    src={getAvatarUrl(teacherAvatar)}
                                    alt={teacherName}
                                />
                                <AvatarFallback className="bg-blue-500 text-xs font-bold text-white">
                                    {teacherName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span>Bởi {teacherName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                            <Users className="h-4 w-4" />
                            {course.enrollCount.toLocaleString('vi-VN')} học viên
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="-mt-6 grid grid-cols-1 gap-8 sm:-mt-8 lg:grid-cols-3 lg:gap-12">
                    <div className="order-2 space-y-8 pt-4 sm:space-y-10 sm:pt-6 lg:order-1 lg:col-span-2 lg:pt-16">
                        {course.description && (
                            <section>
                                <h2 className="mb-4 text-xl font-bold text-gray-900 sm:mb-6 sm:text-2xl">Giới thiệu khoá học</h2>
                                <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
                                    <StaticContent content={course.description} />
                                </div>
                            </section>
                        )}

                        {course.enrollCount > 0 && (
                            <section>
                                <h2 className="mb-4 text-xl font-bold text-gray-900 sm:mb-6 sm:text-2xl">Học viên đã tham gia</h2>
                                <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
                                    <EnrolledStudentsStack
                                        students={recentEnrollees}
                                        totalCount={course.enrollCount}
                                        maxVisible={8}
                                    />
                                </div>
                            </section>
                        )}

                        <section>
                            <h2 className="mb-4 text-xl font-bold text-gray-900 sm:mb-6 sm:text-2xl">Nội dung khoá học</h2>

                            <div className="mb-4 flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
                                <span>{chapters.length} chương • {course.totalLessons} bài học • Thời lượng {formatDuration(course.totalDuration)}</span>
                                <button
                                    onClick={() => {
                                        const allOpen = Object.values(openChapters).every(v => v);
                                        const nextState: Record<string, boolean> = {};
                                        chapters.forEach(c => nextState[c._id as string] = !allOpen);
                                        setOpenChapters(nextState);
                                    }}
                                    className="self-start font-medium text-blue-600 hover:underline sm:self-auto"
                                >
                                    {Object.values(openChapters).every(v => v) ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}
                                </button>
                            </div>

                            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                                {chapters.length > 0 ? chapters.map((chapter, index) => (
                                    <div key={chapter._id} className="border-b border-gray-100 last:border-0">
                                        <button
                                            onClick={() => toggleChapter(chapter._id as string)}
                                            className="flex w-full items-center justify-between gap-3 bg-gray-50/50 px-4 py-3.5 transition-colors hover:bg-gray-50 sm:px-6 sm:py-4"
                                        >
                                            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                                                {openChapters[chapter._id as string] ? (
                                                    <ChevronUp className="h-5 w-5 shrink-0 text-gray-400" />
                                                ) : (
                                                    <ChevronDown className="h-5 w-5 shrink-0 text-gray-400" />
                                                )}
                                                <span className="text-left text-sm font-semibold text-gray-900 sm:text-base">
                                                    {index + 1}. {chapter.title}
                                                </span>
                                            </div>
                                            <span className="shrink-0 text-xs text-gray-500 sm:text-sm">
                                                {chapter.lessons?.length || 0} bài học
                                            </span>
                                        </button>

                                        {openChapters[chapter._id as string] && (
                                            <div className="px-4 py-1 sm:px-6 sm:py-2">
                                                {(chapter.lessons || []).map((lesson, lIdx) => (
                                                    <div
                                                        key={lesson._id}
                                                        className="flex flex-col gap-2 border-b border-gray-50 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                                                    >
                                                        <div className="flex min-w-0 items-start gap-2.5 sm:items-center sm:gap-3">
                                                            {(lesson.type === 'video' || lesson.type === 'exercise') ? (
                                                                <PlayCircle className="h-5 w-5 shrink-0 text-blue-500" />
                                                            ) : (
                                                                <BookOpen className="h-5 w-5 shrink-0 text-green-500" />
                                                            )}
                                                            <span className="text-sm text-gray-700">
                                                                {index + 1}.{lIdx + 1} {lesson.title}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3 pl-7 sm:gap-4 sm:pl-0">
                                                            {lesson.isPreview && !isEnrolled && (
                                                                <span className="rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600">
                                                                    Xem thử
                                                                </span>
                                                            )}
                                                            {lesson.type === 'video' && lesson.duration && lesson.duration > 0 && (
                                                                <span className="text-xs text-gray-500 sm:text-sm">
                                                                    {formatLessonDuration(lesson.duration)}
                                                                </span>
                                                            )}
                                                            {!isEnrolled && !lesson.isPreview && (
                                                                <Lock className="h-4 w-4 text-gray-400" />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )) : (
                                    <div className="p-6 text-center text-gray-500">Nội dung đang được cập nhật.</div>
                                )}
                            </div>
                        </section>

                        <section>
                            <CourseReviews courseId={course._id} />
                        </section>
                    </div>

                    <div className="order-1 pt-4 sm:pt-6 lg:order-2 lg:col-span-1 lg:pt-16">
                        {sidebarCard}
                    </div>
                </div>
            </div>
        </div>
    );
}
