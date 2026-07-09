'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Eye, EyeOff, Trash2, Loader2, Users, DollarSign, CheckCircle2, XCircle, Clock, AlertCircle, BookOpen } from 'lucide-react';
import { TeacherCourseSummary } from '@/types/khoahoc.type';

export default function TeacherCoursesPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<TeacherCourseSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeacherCourses = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/teacher/khoahoc', {
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch teacher courses');
                }

                const data = await response.json();
                setCourses(data.data || []);
            } catch (error) {
                console.error(error);
                alert('Có lỗi xảy ra khi tải danh sách khoá học!');
            } finally {
                setLoading(false);
            }
        };

        fetchTeacherCourses();
    }, []);

    const getStatusBadge = (status: TeacherCourseSummary['status'], rejectedReason?: string) => {
        const baseClasses = "px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5";

        switch (status) {
            case 'draft':
                return (
                    <span className={`${baseClasses} bg-gray-800 text-gray-400`}>
                        <Clock className="w-3 h-3" />
                        Nháp
                    </span>
                );
            case 'pending':
                return (
                    <span className={`${baseClasses} bg-yellow-500/20 text-yellow-400`}>
                        <AlertCircle className="w-3 h-3" />
                        Chờ duyệt
                    </span>
                );
            case 'approved':
                return (
                    <span className={`${baseClasses} bg-green-500/20 text-green-400`}>
                        <CheckCircle2 className="w-3 h-3" />
                        Đã duyệt
                    </span>
                );
            case 'rejected':
                return (
                    <div className="flex flex-col gap-1">
                        <span className={`${baseClasses} bg-red-500/20 text-red-400`}>
                            <XCircle className="w-3 h-3" />
                            Từ chối
                        </span>
                        {rejectedReason && (
                            <span className="text-xs text-red-400/70 mt-1">Lý do: {rejectedReason}</span>
                        )}
                    </div>
                );
            case 'hidden':
                return (
                    <span className={`${baseClasses} bg-gray-900 text-gray-500`}>
                        <EyeOff className="w-3 h-3" />
                        Đã ẩn
                    </span>
                );
            default:
                return null;
        }
    };

    const handleToggleHide = async (courseId: string, currentHidden: boolean) => {
        if (!confirm(`Bạn có chắc muốn ${currentHidden ? 'hiện' : 'ẩn'} khoá học này?`)) return;
        try {
            const response = await fetch(`/api/teacher/khoahoc/${courseId}/toggle-hide`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ hide: !currentHidden })
            });

            if (response.ok) {
                setCourses(prev => prev.map(course => {
                    if (course._id === courseId) {
                        return {
                            ...course,
                            status: !currentHidden ? 'approved' as const : 'hidden' as const,
                            isHidden: !currentHidden
                        };
                    }
                    return course;
                }));
            }
        } catch (error) {
            console.error(error);
            alert('Có lỗi xảy ra!');
        }
    };

    const handleDeleteCourse = async (courseId: string) => {
        if (!confirm('Bạn có chắc muốn xoá khoá học này? Hành động này không thể hoàn tác.')) return;
        try {
            const response = await fetch(`/api/teacher/khoahoc/${courseId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                setCourses(prev => prev.filter(course => course._id !== courseId));
            }
        } catch (error) {
            console.error(error);
            alert('Có lỗi xảy ra!');
        }
    };

    const handleSubmitForReview = async (courseId: string) => {
        if (!confirm('Bạn có chắc muốn gửi khoá học để duyệt? Sau khi gửi, bạn không thể chỉnh sửa cho đến khi được duyệt.')) return;
        try {
            const response = await fetch(`/api/teacher/khoahoc/${courseId}/submit`, {
                method: 'PUT',
                credentials: 'include'
            });

            if (response.ok) {
                setCourses(prev => prev.map(course => {
                    if (course._id === courseId) {
                        return { ...course, status: 'pending' };
                    }
                    return course;
                }));
            }
        } catch (error) {
            console.error(error);
            alert('Có lỗi xảy ra!');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Quản lý khoá học</h1>
                            <p className="text-purple-100 text-sm">Quản lý và theo dõi các khoá học bạn đã tạo</p>
                        </div>
                        <button
                            onClick={() => router.push('/teacher/khoahoc/create')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-700 hover:bg-purple-50 rounded-xl font-bold text-sm transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Tạo khoá học mới
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Tổng khoá học</p>
                                <p className="text-2xl font-bold">{courses.length}</p>
                            </div>
                            <div className="p-3 bg-blue-500/20 rounded-xl">
                                <BookOpen className="w-6 h-6 text-blue-400" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Tổng học viên</p>
                                <p className="text-2xl font-bold">
                                    {courses.reduce((sum, course) => sum + (course.enrollCount || 0), 0)}
                                </p>
                            </div>
                            <div className="p-3 bg-green-500/20 rounded-xl">
                                <Users className="w-6 h-6 text-green-400" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Tổng doanh thu</p>
                                <p className="text-2xl font-bold">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                        courses.reduce((sum, course) => sum + (course.revenue || 0), 0)
                                    )}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-500/20 rounded-xl">
                                <DollarSign className="w-6 h-6 text-purple-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Courses grid */}
                {courses.length === 0 ? (
                    <div className="bg-slate-900 rounded-2xl p-12 text-center border border-slate-800">
                        <BookOpen className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-300 mb-2">Chưa có khoá học nào</h3>
                        <p className="text-sm text-slate-500 mb-6">Bắt đầu tạo khoá học đầu tiên để chia sẻ kiến thức của bạn!</p>
                        <button
                            onClick={() => router.push('/teacher/khoahoc/create')}
                            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl text-sm font-semibold transition-colors inline-flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Tạo khoá học đầu tiên
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map(course => (
                            <div
                                key={course._id}
                                className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-slate-700 transition-all group"
                            >
                                {/* Thumbnail */}
                                <div className="aspect-video bg-slate-800 relative overflow-hidden">
                                    {course.thumbnail ? (
                                        <img
                                            src={course.thumbnail}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BookOpen className="w-12 h-12 text-slate-700" />
                                        </div>
                                    )}
                                    {/* Status badge overlay */}
                                    <div className="absolute top-3 left-3">
                                        {getStatusBadge(course.status, course.rejectedReason)}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-slate-100 mb-2 line-clamp-2">{course.title}</h3>

                                    {/* Course info */}
                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-400">Loại:</span>
                                            <span className={`font-bold ${course.type === 'pro' ? 'text-yellow-400' : 'text-blue-400'}`}>
                                                {course.type === 'pro' ? 'Pro' : 'Miễn phí'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-400">Học viên:</span>
                                            <span className="text-slate-300 font-medium">{course.enrollCount}</span>
                                        </div>
                                        {course.revenue && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-400">Doanh thu:</span>
                                                <span className="text-green-400 font-bold">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.revenue)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => router.push(`/teacher/khoahoc/edit/${course._id}`)}
                                            className="flex-1 min-w-[120px] px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                                            disabled={course.status !== 'draft' && course.status !== 'rejected'}
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                            Chỉnh sửa
                                        </button>

                                        <button
                                            onClick={() => handleToggleHide(course._id, course.status === 'hidden')}
                                            className="flex-1 min-w-[120px] px-3 py-2 border border-slate-700 hover:border-slate-600 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                                        >
                                            {course.status === 'hidden' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                            {course.status === 'hidden' ? 'Hiện' : 'Ẩn'}
                                        </button>

                                        {(course.status === 'draft' || course.status === 'rejected') && (
                                            <>
                                                <button
                                                    onClick={() => handleSubmitForReview(course._id)}
                                                    className="flex-1 min-w-[120px] px-3 py-2 bg-green-600 hover:bg-green-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Gửi duyệt
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteCourse(course._id)}
                                                    className="flex-1 min-w-[120px] px-3 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    Xoá
                                                </button>
                                            </>
                                        )}

                                        <button
                                            onClick={() => router.push(`/khoahoc/${course.slug}`)}
                                            className="flex-1 min-w-[120px] px-3 py-2 border border-slate-700 hover:border-slate-600 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                                        >
                                            Xem chi tiết
                                        </button>
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