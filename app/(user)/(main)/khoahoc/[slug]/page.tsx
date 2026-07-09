'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCourseBySlug, getEnrollmentStatus, enrollPayOS, enrollCoin } from '@/lib/api/khoahoc.api';
import ReviewSection from '@/components/common/ReviewSection';
import { Course, Enrollment, ChapterWithLessons } from '@/types/khoahoc.type';
import { getCourseLastLesson } from '@/lib/localProgress';
import { Loader2, PlayCircle, BookOpen, Clock, Award, Shield, Check, Lock, ChevronDown, ChevronUp, Users } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import StaticContent from '@/components/common/StaticContent';
import axios from 'axios';

export default function CourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [course, setCourse] = useState<Course | null>(null);
    const [chapters, setChapters] = useState<ChapterWithLessons[]>([]);
    const [loading, setLoading] = useState(true);
    const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
    const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({});
    const [payingMethod, setPayingMethod] = useState<'free' | 'payos' | 'coin' | null>(null);

    // Tự động kiểm tra trạng thái nếu đang chờ thanh toán (Polling)
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
                } catch (e) { /* Ignore errors during polling */ }
            }, 3000); // Kiểm tra mỗi 3 giây
        }
        return () => { if (interval) clearInterval(interval); };
    }, [enrollment?.paymentStatus, course?._id]);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true);
                const data = await getCourseBySlug(slug) as unknown as { course: Course; chapters: ChapterWithLessons[] };
                setCourse(data.course);
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

                } catch (e) {
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
        return <div className="min-h-[70vh] flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;
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

    // Get last lesson from localStorage or first lesson
    const getStartLessonId = (): string => {
        if (!course?._id || !chapters.length) return '';

        // Try to get saved lesson from localStorage
        const savedLessonId = getCourseLastLesson(course._id);
        if (savedLessonId) return savedLessonId;

        // No saved progress, return first lesson
        const firstChapter = chapters[0];
        const firstLesson = firstChapter?.lessons?.[0];
        return firstLesson?._id || '';
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-gray-900 text-white py-12 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                        {/* Breadcrumb */}
                        <div className="text-gray-400 text-sm mb-6">
                            <Link href="/khoahoc" className="hover:text-white">Khoá học</Link>
                            <span className="mx-2">/</span>
                            <span className="text-white">{course.title}</span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold mb-8 leading-tight">
                            {course.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs overflow-hidden shrink-0">
                                    {teacherAvatar ? (
                                        <img src={teacherAvatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        teacherName.charAt(0)
                                    )}
                                </span>
                                <span>Bởi {teacherName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                                <Users className="w-4 h-4" />
                                {course.enrollCount} học viên
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12 -mt-8">
                {/* Left Column */}
                <div className="lg:col-span-2 pt-16">
                    {/* Course Introduction */}
                    {course.description && (
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Giới thiệu khoá học</h2>
                            <div className="bg-white border border-gray-200 rounded-2xl p-6">
                                <StaticContent content={course.description} />
                            </div>
                        </div>
                    )}

                    {/* Course Content */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Nội dung khoá học</h2>

                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                            <span>{chapters.length} chương • {course.totalLessons} bài học • Thời lượng {formatDuration(course.totalDuration)}</span>
                            <button onClick={() => {
                                const allOpen = Object.values(openChapters).every(v => v);
                                const nextState: Record<string, boolean> = {};
                                chapters.forEach(c => nextState[c._id as string] = !allOpen);
                                setOpenChapters(nextState);
                            }} className="text-blue-600 font-medium hover:underline">
                                {Object.values(openChapters).every(v => v) ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}
                            </button>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                            {chapters.length > 0 ? chapters.map((chapter, index) => (
                                <div key={chapter._id} className="border-b border-gray-100 last:border-0">
                                    <button
                                        onClick={() => toggleChapter(chapter._id as string)}
                                        className="w-full px-6 py-4 flex items-center justify-between bg-gray-50/50 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            {openChapters[chapter._id as string] ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                            <span className="font-semibold text-gray-900 text-left">{index + 1}. {chapter.title}</span>
                                        </div>
                                        <span className="text-sm text-gray-500">{chapter.lessons?.length || 0} bài học</span>
                                    </button>

                                    {openChapters[chapter._id as string] && (
                                        <div className="px-6 py-2">
                                            {(chapter.lessons || []).map((lesson, lIdx) => (
                                                <div key={lesson._id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                                    <div className="flex items-center gap-3">
                                                        {(lesson.type === 'video' || lesson.type === 'exercise') ? (
                                                            <PlayCircle className="w-5 h-5 text-blue-500 shrink-0" />
                                                        ) : (
                                                            <BookOpen className="w-5 h-5 text-green-500 shrink-0" />
                                                        )}
                                                        <span className="text-gray-700 text-sm">{index + 1}.{lIdx + 1} {lesson.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        {lesson.isPreview && !isEnrolled && (
                                                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">Xem thử</span>
                                                        )}
                                                        {lesson.type === 'video' && lesson.duration && lesson.duration > 0 && (
                                                            <span className="text-sm text-gray-500">{formatLessonDuration(lesson.duration)}</span>
                                                        )}
                                                        {!isEnrolled && !lesson.isPreview && (
                                                            <Lock className="w-4 h-4 text-gray-400" />
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
                    </div>

                    {/* Reviews */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Đánh giá</h2>
                        <ReviewSection targetType="course" targetId={course._id} canReview={!!isEnrolled} />
                    </div>
                </div>

                {/* Right Column / Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden sticky top-24">
                        {/* Thumbnail */}
                        <div className="aspect-video relative bg-gray-200">
                            {course.thumbnail ? (
                                <img
                                    src={course.thumbnail}
                                    alt={course.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <BookOpen className="w-12 h-12" />
                                </div>
                            )}
                            {!isEnrolled && (
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center">
                                        <PlayCircle className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-8">
                            {!isEnrolled && !isPending && (
                                <div className="mb-6">
                                    {course.type === 'free' ? (
                                        <div className="text-3xl font-bold text-gray-900">MIỄN PHÍ</div>
                                    ) : (
                                        <div className="flex items-end gap-3 flex-wrap">
                                            <span className="text-3xl font-bold text-gray-900">{formattedPrice}</span>
                                            {course.discountPercent > 0 && (
                                                <span className="text-lg text-gray-400 line-through pb-1">{originalPrice}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {isEnrolled ? (
                                <Link href={`/learn/${getStartLessonId()}`}>
                                    <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-colors mb-6 shadow-lg shadow-blue-500/30">
                                        VÀO HỌC NGAY
                                    </button>
                                </Link>
                            ) : isPending ? (
                                <div className="space-y-3 mb-6">
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="w-full py-4 bg-amber-500 text-white rounded-2xl font-bold text-lg hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/30"
                                    >
                                        ĐANG XÁC NHẬN THANH TOÁN...
                                    </button>
                                    <p className="text-xs text-center text-gray-500 italic">
                                        Nếu bạn đã thanh toán thành công, vui lòng đợi 1-2 phút hoặc nhấn làm mới trang.
                                    </p>
                                </div>
                            ) : course.type === 'free' ? (
                                <button
                                    onClick={() => handleEnroll('free')}
                                    disabled={isPaying}
                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-colors mb-6 shadow-lg shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {payingMethod === 'free' ? (
                                        <span className="inline-flex items-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            ĐANG ĐĂNG KÝ
                                        </span>
                                    ) : 'ĐĂNG KÝ HỌC'}
                                </button>
                            ) : (
                                <div className="flex flex-col gap-3 mb-6">
                                    <button
                                        onClick={() => handleEnroll('payos')}
                                        disabled={isPaying}
                                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {payingMethod === 'payos' ? (
                                            <span className="inline-flex items-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                ĐANG TẠO THANH TOÁN
                                            </span>
                                        ) : 'MUA KHOÁ HỌC (PayOS)'}
                                    </button>
                                    {course.allowCoinPayment && (
                                        <button
                                            onClick={() => handleEnroll('coin')}
                                            disabled={isPaying}
                                            className="w-full py-4 bg-yellow-500 text-white rounded-2xl font-bold text-lg hover:bg-yellow-600 transition-colors shadow-lg shadow-yellow-500/30 disabled:cursor-not-allowed disabled:opacity-70"
                                        >
                                            {payingMethod === 'coin' ? (
                                                <span className="inline-flex items-center gap-2">
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    ĐANG THANH TOÁN
                                                </span>
                                            ) : 'MUA BẰNG COIN'}
                                        </button>
                                    )}
                                </div>
                            )}

                            <ul className="space-y-4 text-sm text-gray-600">
                                <li className="flex items-center gap-3">
                                    <BookOpen className="w-5 h-5 text-gray-400 shrink-0" />
                                    <span>Tổng số <strong>{course.totalLessons}</strong> bài học</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-gray-400 shrink-0" />
                                    <span>Thời lượng <strong>{formatDuration(course.totalDuration)}</strong></span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-gray-400 shrink-0" />
                                    <span>Học mọi lúc, mọi nơi</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-gray-400 shrink-0" />
                                    <span>Cấp chứng chỉ hoàn thành</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
