'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, BookOpen, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { khoahocApi } from '@/lib/api/khoahoc.api';

interface MyCourse {
    _id: string;
    courseId: string;
    title: string;
    slug: string;
    thumbnail?: string;
    teacherName?: string;
    teacherAvatar?: string;
    totalLessons: number;
    completedLessons: number;
    progress: number; // 0-100
    lastAccessedLessonId?: string;
    lastAccessedAt?: string;
    enrolledAt: string;
}

type TabType = 'all' | 'in-progress' | 'completed' | 'not-started';

export default function MyCoursesPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<MyCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('all');

    useEffect(() => {
        const fetchMyCourses = async () => {
            try {
                setLoading(true);
                const data = await khoahocApi.getMyCourses();
                setCourses(data || []);
            } catch (error) {
                console.error(error);
                alert('Có lỗi xảy ra khi tải danh sách khoá học của bạn!');
            } finally {
                setLoading(false);
            }
        };

        fetchMyCourses();
    }, []);

    const filteredCourses = courses.filter(course => {
        if (activeTab === 'all') return true;
        if (activeTab === 'in-progress') return course.progress > 0 && course.progress < 100;
        if (activeTab === 'completed') return course.progress === 100;
        if (activeTab === 'not-started') return course.progress === 0;
        return true;
    });

    const handleContinueLearning = (course: MyCourse) => {
        if (course.lastAccessedLessonId) {
            router.push(`/learn/${course.lastAccessedLessonId}`);
        } else {
            // Navigate to course detail to start from beginning
            router.push(`/khoahoc/${course.slug}`);
        }
    };

    const tabs: { key: TabType; label: string; count: number }[] = [
        { key: 'all', label: 'Tất cả', count: courses.length },
        { key: 'in-progress', label: 'Đang học', count: courses.filter(c => c.progress > 0 && c.progress < 100).length },
        { key: 'completed', label: 'Hoàn thành', count: courses.filter(c => c.progress === 100).length },
        { key: 'not-started', label: 'Chưa bắt đầu', count: courses.filter(c => c.progress === 0).length }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <h1 className="text-3xl font-bold mb-2 text-white">Khoá học của tôi</h1>
                    <p className="text-blue-100 text-sm">Quản lý và tiếp tục học tập các khoá học bạn đã đăng ký</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Tabs */}
                <div className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-6 py-3 text-sm font-semibold whitespace-nowrap transition-all relative ${activeTab === tab.key
                                ? 'text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.label}
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.key
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-600'
                                }`}>
                                {tab.count}
                            </span>
                            {activeTab === tab.key && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Course list */}
                {filteredCourses.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                            {activeTab === 'all' ? 'Chưa có khoá học nào' : 'Không tìm thấy khoá học'}
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            {activeTab === 'all'
                                ? 'Hãy khám phá và đăng ký các khoá học hấp dẫn để bắt đầu hành trình học tập!'
                                : 'Không có khoá học nào trong danh mục này.'}
                        </p>
                        {activeTab === 'all' && (
                            <button
                                onClick={() => router.push('/khoahoc')}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors"
                            >
                                Khám phá khoá học
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredCourses.map(course => (
                            <div
                                key={course._id}
                                className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all group"
                            >
                                <div className="flex flex-col sm:flex-row gap-6 p-6">
                                    {/* Thumbnail */}
                                    <div className="sm:w-64 shrink-0">
                                        <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden relative">
                                            {course.thumbnail ? (
                                                <img
                                                    src={course.thumbnail}
                                                    alt={course.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <BookOpen className="w-12 h-12 text-gray-400" />
                                                </div>
                                            )}
                                            {/* Progress badge */}
                                            {course.progress > 0 && (
                                                <div className="absolute top-3 left-3 px-3 py-1 bg-black/80 backdrop-blur-sm rounded-full text-xs font-bold text-white">
                                                    {course.progress}%
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 flex flex-col">
                                        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                                            {course.title}
                                        </h3>

                                        {/* Teacher info */}
                                        {course.teacherName && (
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold">
                                                    {course.teacherAvatar ? (
                                                        <img
                                                            src={course.teacherAvatar}
                                                            alt={course.teacherName}
                                                            className="w-full h-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        course.teacherName.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray-500">{course.teacherName}</span>
                                            </div>
                                        )}

                                        {/* Progress bar */}
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                                                <span>Tiến độ: {course.completedLessons}/{course.totalLessons} bài</span>
                                                <span className="font-bold text-blue-600">{course.progress}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                                                    style={{ width: `${course.progress}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Meta info */}
                                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                            {course.lastAccessedAt && (
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>Truy cập: {new Date(course.lastAccessedAt).toLocaleDateString('vi-VN')}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                                <BookOpen className="w-3.5 h-3.5" />
                                                <span>Đăng ký: {new Date(course.enrolledAt).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex gap-3 mt-auto">
                                            <button
                                                onClick={() => handleContinueLearning(course)}
                                                className="flex-1 sm:flex-initial px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                                            >
                                                {course.progress === 0 ? (
                                                    <>
                                                        <Play className="w-4 h-4" />
                                                        Bắt đầu học
                                                    </>
                                                ) : course.progress === 100 ? (
                                                    <>
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        Xem lại
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play className="w-4 h-4" />
                                                        Tiếp tục học
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => router.push(`/khoahoc/${course.slug}`)}
                                                className="px-6 py-2.5 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold transition-colors"
                                            >
                                                Chi tiết
                                            </button>
                                        </div>
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