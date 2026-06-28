'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Loader2, Search, CheckCircle2, XCircle, Eye, Edit, Trash2,
    TrendingUp, Users, BookOpen, DollarSign, BarChart3, Plus, X, Upload, Image as ImageIcon
} from 'lucide-react';
import {
    BarChart as RechartsBarChart, Bar, LineChart as RechartsLineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInputSearch } from '@/components/custom/CustomInputSearch';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { DashboardCard } from '@/components/custom/DashboardCard';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import { TableSkeleton } from '@/components/ui/skeleton';
import CustomEditor, { CustomEditorRef } from '@/components/custom/CustomEditor';
import { uploadApi } from '@/lib/upload';
import { toast } from 'sonner';
import * as khoahocApi from '@/lib/api/khoahoc.api';
import CourseBuilderOverlay from '@/components/admin/CourseBuilderOverlay';

interface AdminCourse {
    _id: string;
    title: string;
    slug: string;
    thumbnail?: string;
    description?: string;
    teacherId: string | { _id: string; fullName?: string; name?: string; avatar?: string };
    type: 'free' | 'pro';
    price: number;
    discountPrice?: number;
    enrollCount: number;
    status: 'draft' | 'pending' | 'approved' | 'rejected' | 'hidden';
    createdAt: string;
}

interface AdminStats {
    totalCourses: number;
    totalStudents: number;
    monthlyRevenue: number;
    coursesByMonth: { month: string; count: number }[];
    revenueByMonth: { month: string; revenue: number }[];
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 'pending', label: 'Chờ duyệt' },
    { value: 'approved', label: 'Đã duyệt' },
    { value: 'rejected', label: 'Từ chối' },
];

export default function AdminCoursesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialStatus = (searchParams.get('status') as StatusFilter) || 'all';

    const [courses, setCourses] = useState<AdminCourse[]>([]);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<AdminCourse | null>(null);
    const [rejectModal, setRejectModal] = useState<{ courseId: string; reason: string } | null>(null);
    const [createModal, setCreateModal] = useState(false);
    const [createStep, setCreateStep] = useState(1);
    const [createForm, setCreateForm] = useState({
        title: '',
        thumbnail: '',
        description: '',
        type: 'free' as 'free' | 'pro',
        price: 0,
        discountType: 'vnd' as 'vnd' | 'percent',
        discountValue: 0,
        allowCoinPayment: false
    });
    const [uploadingThumb, setUploadingThumb] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const editorRef = useRef<CustomEditorRef>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [builderOverlay, setBuilderOverlay] = useState<{ courseId: string; courseName: string } | null>(null);
    const [editCourse, setEditCourse] = useState<AdminCourse | null>(null);
    const [previewCourse, setPreviewCourse] = useState<AdminCourse | null>(null);
    const [editStep, setEditStep] = useState(1);
    const [editForm, setEditForm] = useState({
        title: '',
        thumbnail: '',
        description: '',
        type: 'free' as 'free' | 'pro',
        price: 0,
        discountType: 'vnd' as 'vnd' | 'percent',
        discountValue: 0,
        allowCoinPayment: false
    });
    const [uploadingEditThumb, setUploadingEditThumb] = useState(false);
    const [editSubmitting, setEditSubmitting] = useState(false);
    const editEditorRef = useRef<CustomEditorRef>(null);
    const editFileInputRef = useRef<HTMLInputElement>(null);
    const [statusModal, setStatusModal] = useState<{ course: AdminCourse; newStatus: string } | null>(null);

    // Load course data when editCourse is set
    useEffect(() => {
        if (editCourse) {
            setEditStep(1);
            setEditForm({
                title: editCourse.title,
                thumbnail: editCourse.thumbnail || '',
                description: '', // Will be loaded by editor
                type: editCourse.type,
                price: editCourse.price,
                discountType: 'vnd',
                discountValue: editCourse.price > 0 && editCourse.discountPrice ? editCourse.price - editCourse.discountPrice : 0,
                allowCoinPayment: false // TODO: get from course if field exists
            });
        }
    }, [editCourse]);

    // Persist builderOverlay across page reloads via localStorage
    useEffect(() => {
        const saved = localStorage.getItem('courseBuilderOpen');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.courseId && parsed.courseName) {
                    setBuilderOverlay(parsed);
                }
            } catch { /* ignore */ }
        }
    }, []);

    useEffect(() => {
        if (builderOverlay) {
            localStorage.setItem('courseBuilderOpen', JSON.stringify(builderOverlay));
        } else {
            localStorage.removeItem('courseBuilderOpen');
        }
    }, [builderOverlay]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [coursesData, statsData] = await Promise.all([
                    khoahocApi.getAdminCourses(statusFilter === 'all' ? undefined : statusFilter),
                    khoahocApi.getAdminStats(),
                ]);
                setCourses(coursesData || []);
                setStats(statsData);
            } catch (error) {
                console.error(error);
                toast.error('Có lỗi xảy ra khi tải dữ liệu!');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [statusFilter]);

    const filteredCourses = Array.isArray(courses) ? courses.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

    const handleApprove = async (courseId: string) => {
        try {
            await khoahocApi.approveCourse(courseId);
            setCourses(prev => prev.map(c => c._id === courseId ? { ...c, status: 'approved' } : c));
            toast.success('Đã duyệt khoá học');
        } catch { toast.error('Có lỗi xảy ra!'); }
    };

    const handleReject = async () => {
        if (!rejectModal?.reason.trim()) { toast.error('Vui lòng nhập lý do từ chối!'); return; }
        try {
            await khoahocApi.rejectCourse(rejectModal.courseId, rejectModal.reason);
            setCourses(prev => prev.map(c => c._id === rejectModal.courseId ? { ...c, status: 'rejected' } : c));
            setRejectModal(null);
            toast.success('Đã từ chối khoá học');
        } catch { toast.error('Có lỗi xảy ra!'); }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        try {
            await khoahocApi.deleteAdminCourse(deleteConfirm._id);
            setCourses(prev => prev.filter(c => c._id !== deleteConfirm._id));
            setDeleteConfirm(null);
            toast.success('Đã xoá khoá học');
        } catch { toast.error('Có lỗi xảy ra!'); }
    };

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target?.result as string;
            setUploadingThumb(true);
            try {
                const result = await uploadApi.uploadImage(base64, 'courses');
                if (result.success && result.url) {
                    setCreateForm(prev => ({ ...prev, thumbnail: result.url! }));
                    toast.success('Upload ảnh thành công');
                } else {
                    toast.error(result.message || 'Upload thất bại');
                }
            } catch {
                toast.error('Có lỗi xảy ra khi upload');
            } finally {
                setUploadingThumb(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleNextStep = () => {
        if (createStep === 1) {
            if (!createForm.title.trim()) { toast.error('Vui lòng nhập tên khoá học'); return; }
            if (!createForm.thumbnail.trim()) { toast.error('Vui lòng tải ảnh thumbnail'); return; }
            const description = editorRef.current?.getContent() || '';
            if (!description.trim()) { toast.error('Vui lòng nhập mô tả'); return; }
            setCreateForm(prev => ({ ...prev, description }));
            setCreateStep(2);
        } else if (createStep === 2) {
            if (createForm.type === 'pro') {
                if (createForm.price <= 0) { toast.error('Vui lòng nhập giá bán'); return; }
            }
            setCreateStep(3);
        }
    };

    const handleCreateCourse = async () => {
        setSubmitting(true);
        try {
            // Calculate discountPrice from discountType + discountValue
            let discountPrice;
            if (createForm.type === 'pro' && createForm.discountValue > 0) {
                if (createForm.discountType === 'vnd') {
                    discountPrice = Math.max(0, createForm.price - createForm.discountValue);
                } else { // percent
                    discountPrice = Math.max(0, createForm.price - (createForm.price * createForm.discountValue / 100));
                }
            }

            const newCourse = await khoahocApi.createAdminCourse({
                title: createForm.title,
                thumbnail: createForm.thumbnail,
                description: createForm.description,
                slug: createForm.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-'),
                type: createForm.type,
                price: createForm.type === 'pro' ? createForm.price : 0,
                discountPrice: discountPrice,
                allowCoinPayment: createForm.allowCoinPayment
            });

            toast.success('Tạo khoá học thành công');
            setCreateModal(false);
            setCreateStep(1);
            setCreateForm({
                title: '',
                thumbnail: '',
                description: '',
                type: 'free',
                price: 0,
                discountType: 'vnd',
                discountValue: 0,
                allowCoinPayment: false
            });
            setCourses(prev => [newCourse, ...prev]);
            // Automatically open the builder for the newly created course
            setBuilderOverlay({ courseId: newCourse._id, courseName: newCourse.title });
        } catch {
            toast.error('Tạo khoá học thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target?.result as string;
            setUploadingEditThumb(true);
            try {
                const result = await uploadApi.uploadImage(base64, 'courses');
                if (result.success && result.url) {
                    setEditForm(prev => ({ ...prev, thumbnail: result.url! }));
                    toast.success('Upload ảnh thành công');
                } else {
                    toast.error(result.message || 'Upload thất bại');
                }
            } catch {
                toast.error('Có lỗi xảy ra khi upload');
            } finally {
                setUploadingEditThumb(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleEditNextStep = () => {
        if (editStep === 1) {
            if (!editForm.title.trim()) { toast.error('Vui lòng nhập tên khoá học'); return; }
            if (!editForm.thumbnail.trim()) { toast.error('Vui lòng tải ảnh thumbnail'); return; }
            const description = editEditorRef.current?.getContent() || '';
            if (!description.trim()) { toast.error('Vui lòng nhập mô tả'); return; }
            setEditForm(prev => ({ ...prev, description }));
            setEditStep(2);
        } else if (editStep === 2) {
            if (editForm.type === 'pro') {
                if (editForm.price <= 0) { toast.error('Vui lòng nhập giá bán'); return; }
            }
            setEditStep(3);
        }
    };

    const handleUpdateCourse = async () => {
        if (!editCourse) return;
        setEditSubmitting(true);
        try {
            let discountPrice;
            if (editForm.type === 'pro' && editForm.discountValue > 0) {
                if (editForm.discountType === 'vnd') {
                    discountPrice = Math.max(0, editForm.price - editForm.discountValue);
                } else {
                    discountPrice = Math.max(0, editForm.price - (editForm.price * editForm.discountValue / 100));
                }
            }

            const updated = await khoahocApi.updateAdminCourse(editCourse._id, {
                title: editForm.title,
                thumbnail: editForm.thumbnail,
                description: editForm.description,
                type: editForm.type,
                price: editForm.type === 'pro' ? editForm.price : 0,
                discountPrice: discountPrice,
                allowCoinPayment: editForm.allowCoinPayment
            });

            toast.success('Cập nhật khoá học thành công');
            setCourses(prev => prev.map(c => c._id === editCourse._id ? { ...c, ...updated } : c));
            setEditCourse(null);
            setEditStep(1);
        } catch {
            toast.error('Cập nhật khoá học thất bại');
        } finally {
            setEditSubmitting(false);
        }
    };

    const getStatusBadge = (status: AdminCourse['status']) => {
        const base = 'px-2.5 py-1 rounded-full text-xs font-semibold';
        switch (status) {
            case 'pending': return <span className={`${base} bg-yellow-500/15 text-yellow-500`}>Chờ duyệt</span>;
            case 'approved': return <span className={`${base} bg-green-500/15 text-green-500`}>Đã duyệt</span>;
            case 'rejected': return <span className={`${base} bg-red-500/15 text-red-500`}>Từ chối</span>;
            case 'draft': return <span className={`${base} bg-gray-500/15 text-gray-400`}>Nháp</span>;
            case 'hidden': return <span className={`${base} bg-gray-700/50 text-gray-500`}>Ẩn</span>;
            default: return null;
        }
    };

    console.log('Courses:', courses);

    const cardConfigs = [
        {
            key: 'courses', title: 'Tổng khoá học',
            value: stats?.totalCourses ?? (Array.isArray(courses) ? courses.length : 0),
            icon: <BookOpen className="w-4 h-4" />,
            iconBgColor: '#EFF6FF', iconColor: '#3B82F6',
        },
        {
            key: 'students', title: 'Tổng học viên',
            value: stats?.totalStudents ?? 0,
            icon: <Users className="w-4 h-4" />,
            iconBgColor: '#DCFCE7', iconColor: '#16A34A',
        },
        {
            key: 'revenue', title: 'Doanh thu tháng',
            value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats?.monthlyRevenue ?? 0),
            icon: <DollarSign className="w-4 h-4" />,
            iconBgColor: '#FAF5FF', iconColor: '#9333EA',
        },
        {
            key: 'pending', title: 'Chờ duyệt',
            value: Array.isArray(courses) ? courses.filter(c => c.status === 'pending').length : 0,
            icon: <TrendingUp className="w-4 h-4" />,
            iconBgColor: '#FFFBEB', iconColor: '#D97706',
        },
    ];

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8 px-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Quản lý khoá học</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">Duyệt và quản lý khoá học</p>
                </div>
                <CustomButton onClick={() => setCreateModal(true)} className="shrink-0">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm khoá học
                </CustomButton>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cardConfigs.map(card => (
                    <DashboardCard
                        key={card.key}
                        title={card.title}
                        value={card.value}
                        icon={card.icon}
                        iconBgColor={card.iconBgColor}
                        iconColor={card.iconColor}
                    />
                ))}
            </div>

            {/* Charts */}
            {stats && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="w-5 h-5 text-blue-500" />
                            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">Doanh thu 12 tháng</h3>
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                            <RechartsBarChart data={stats.revenueByMonth}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                                <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#F9FAFB' }}
                                    formatter={(v) => [new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(v)), 'Doanh thu']}
                                />
                                <Bar dataKey="revenue" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-5 h-5 text-green-500" />
                            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">Khoá học mới theo tháng</h3>
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                            <RechartsLineChart data={stats.coursesByMonth}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                                <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 11 }} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#F9FAFB' }}
                                    formatter={(v) => [v, 'Khoá học']}
                                />
                                <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 4 }} activeDot={{ r: 6 }} />
                            </RechartsLineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <CustomInputSearch
                            placeholder="Tìm kiếm khoá học..."
                            value={searchQuery}
                            onChange={setSearchQuery}
                            size="medium"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {STATUS_TABS.map(tab => (
                            <CustomButton
                                key={tab.value}
                                onClick={() => setStatusFilter(tab.value)}
                                variant={statusFilter === tab.value ? 'primary' : 'secondary'}
                                size="small"
                            >
                                {tab.label}
                            </CustomButton>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <TableSkeleton rows={10} cols={8} />
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Desktop table */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    {['Khoá học', 'Giáo viên', 'Loại', 'Giá', 'Học viên', 'Trạng thái', 'Ngày tạo', 'Thao tác'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredCourses.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                                            Không tìm thấy khoá học nào
                                        </td>
                                    </tr>
                                ) : filteredCourses.map(course => (
                                    <tr key={course._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-16 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden shrink-0 cursor-pointer hover:opacity-80 transition"
                                                    onClick={() => setBuilderOverlay({ courseId: course._id, courseName: course.title })}
                                                >
                                                    {course.thumbnail
                                                        ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                                                        : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-4 h-4 text-gray-400" /></div>
                                                    }
                                                </div>
                                                <span
                                                    className="font-medium text-sm text-gray-800 dark:text-gray-200 line-clamp-1 cursor-pointer hover:text-blue-500 transition"
                                                    onClick={() => setBuilderOverlay({ courseId: course._id, courseName: course.title })}
                                                >
                                                    {course.title}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {typeof course.teacherId === 'object' && course.teacherId.avatar && (
                                                    <img src={course.teacherId.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                                                )}
                                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                                    {typeof course.teacherId === 'object' ? (course.teacherId.fullName || course.teacherId.name || 'N/A') : 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-bold ${course.type === 'pro' ? 'text-yellow-500' : 'text-blue-500'}`}>
                                                {course.type === 'pro' ? 'Pro' : 'Free'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                            {course.type === 'free' ? 'Miễn phí'
                                                : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.discountPrice || course.price)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{course.enrollCount}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => setStatusModal({ course, newStatus: course.status })}
                                                className="hover:opacity-80 transition"
                                            >
                                                {getStatusBadge(course.status)}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(course.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => setPreviewCourse(course)}
                                                    className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 rounded-lg transition-colors"
                                                    title="Xem"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setEditCourse(course)}
                                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(course)}
                                                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"
                                                    title="Xoá"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile card list */}
                    <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredCourses.length === 0 ? (
                            <div className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                                Không tìm thấy khoá học nào
                            </div>
                        ) : filteredCourses.map(course => (
                            <div key={course._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors space-y-3">
                                {/* Title row */}
                                <div className="flex items-start gap-3">
                                    <div
                                        className="w-20 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden shrink-0 cursor-pointer hover:opacity-80 transition"
                                        onClick={() => setBuilderOverlay({ courseId: course._id, courseName: course.title })}
                                    >
                                        {course.thumbnail
                                            ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                                            : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-4 h-4 text-gray-400" /></div>
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4
                                            className="font-medium text-sm text-gray-800 dark:text-gray-200 line-clamp-2 cursor-pointer hover:text-blue-500 transition"
                                            onClick={() => setBuilderOverlay({ courseId: course._id, courseName: course.title })}
                                        >
                                            {course.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {typeof course.teacherId === 'object' ? (course.teacherId.fullName || course.teacherId.name || 'N/A') : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {/* Info badges */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${course.type === 'pro' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                        {course.type === 'pro' ? 'Pro' : 'Free'}
                                    </span>
                                    <button
                                        onClick={() => setStatusModal({ course, newStatus: course.status })}
                                        className="hover:opacity-80 transition"
                                    >
                                        {getStatusBadge(course.status)}
                                    </button>
                                    <span className="text-xs text-gray-500">
                                        {new Date(course.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>

                                {/* Price & enroll */}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                                        {course.type === 'free' ? 'Miễn phí'
                                            : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.discountPrice || course.price)}
                                    </span>
                                    <span className="text-gray-500">{course.enrollCount} học viên</span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-1">
                                    <button
                                        onClick={() => setPreviewCourse(course)}
                                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 rounded-lg transition-colors"
                                        title="Xem"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setEditCourse(course)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg transition-colors"
                                        title="Chỉnh sửa"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(course)}
                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"
                                        title="Xoá"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setRejectModal(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Từ chối khoá học</h3>
                            <button onClick={() => setRejectModal(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 space-y-3">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Lý do từ chối sẽ được gửi đến giáo viên.</p>
                            <textarea
                                value={rejectModal.reason}
                                onChange={e => setRejectModal({ ...rejectModal, reason: e.target.value })}
                                placeholder="Nhập lý do từ chối..."
                                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 h-32 resize-none text-gray-800 dark:text-gray-200"
                            />
                        </div>
                        <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
                            <CustomButton variant="secondary" onClick={() => setRejectModal(null)} className="flex-1">Huỷ</CustomButton>
                            <CustomButton onClick={handleReject} className="flex-1 bg-red-600 hover:bg-red-700">Xác nhận từ chối</CustomButton>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <ConfirmModalDelete
                    isOpen={!!deleteConfirm}
                    onClose={() => setDeleteConfirm(null)}
                    onConfirm={handleDelete}
                    title="Xác nhận xoá"
                    message={`Bạn có chắc chắn muốn xoá khoá học "${deleteConfirm.title}"? Hành động này không thể hoàn tác.`}
                />
            )}

            {/* Create Modal */}
            {createModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => { setCreateModal(false); setCreateStep(1); }}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Tạo khoá học mới</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Bước {createStep}/3</p>
                            </div>
                            <button onClick={() => { setCreateModal(false); setCreateStep(1); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 space-y-5">
                            {/* Step 1: Thông tin chung */}
                            {createStep === 1 && (
                                <>
                                    <div className="mb-4">
                                        <h4 className="text-base font-semibold text-gray-800 dark:text-gray-100">Phần 1: Thông tin chung</h4>
                                        <p className="text-sm text-gray-500 mt-1">Nhập thông tin cơ bản về khoá học</p>
                                    </div>

                                    <CustomInput
                                        label="Tên khoá học"
                                        value={createForm.title}
                                        onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Nhập tên khoá học..."
                                        required
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Ảnh thumbnail (Tỷ lệ 19:6) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleThumbnailUpload}
                                            className="hidden"
                                        />
                                        {createForm.thumbnail ? (
                                            <div className="relative w-full aspect-[19/6] bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                                <img src={createForm.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => setCreateForm(prev => ({ ...prev, thumbnail: '' }))}
                                                    className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploadingThumb}
                                                className="w-full aspect-[19/6] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition disabled:opacity-50"
                                            >
                                                {uploadingThumb ? (
                                                    <>
                                                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                                        <span className="text-sm text-gray-500">Đang upload...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="w-8 h-8 text-gray-400" />
                                                        <span className="text-sm text-gray-500">Click để tải ảnh lên</span>
                                                        <span className="text-xs text-gray-400">Tỷ lệ 19:6 (ví dụ: 1900x600px)</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Mô tả <span className="text-red-500">*</span>
                                        </label>
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                            <CustomEditor ref={editorRef} initialValue={createForm.description} />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Step 2: Cấu hình thanh toán */}
                            {createStep === 2 && (
                                <>
                                    <div className="mb-4">
                                        <h4 className="text-base font-semibold text-gray-800 dark:text-gray-100">Phần 2: Cấu hình thanh toán</h4>
                                        <p className="text-sm text-gray-500 mt-1">Thiết lập giá và phương thức thanh toán</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Loại khoá học <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setCreateForm(prev => ({ ...prev, type: 'free', price: 0, discountValue: 0 }))}
                                                className={`flex-1 p-4 border-2 rounded-lg transition ${createForm.type === 'free'
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                                    }`}
                                            >
                                                <div className="text-center">
                                                    <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">Miễn phí</div>
                                                    <div className="text-xs text-gray-500 mt-1">Học viên có thể truy cập miễn phí</div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => setCreateForm(prev => ({ ...prev, type: 'pro' }))}
                                                className={`flex-1 p-4 border-2 rounded-lg transition ${createForm.type === 'pro'
                                                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-yellow-300'
                                                    }`}
                                            >
                                                <div className="text-center">
                                                    <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">Trả phí</div>
                                                    <div className="text-xs text-gray-500 mt-1">Học viên cần thanh toán để học</div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {createForm.type === 'pro' && (
                                        <>
                                            <div className="grid grid-cols-2 gap-4">
                                                <CustomInput
                                                    label="Giá bán (VNĐ)"
                                                    type="number"
                                                    value={createForm.price.toString()}
                                                    onChange={(e) => setCreateForm(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                                                    placeholder="0"
                                                    required
                                                />
                                                <div className="flex gap-2">
                                                    <div className="flex-1">
                                                        <CustomInput
                                                            label="Giảm"
                                                            type="number"
                                                            value={createForm.discountValue.toString()}
                                                            onChange={(e) => setCreateForm(prev => ({ ...prev, discountValue: parseInt(e.target.value) || 0 }))}
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    <div className="w-28">
                                                        <CustomSelect
                                                            label="Loại"
                                                            value={createForm.discountType}
                                                            onChange={(value) => setCreateForm(prev => ({ ...prev, discountType: value as 'vnd' | 'percent' }))}
                                                            options={[
                                                                { value: 'vnd', label: 'VNĐ' },
                                                                { value: 'percent', label: '%' },
                                                            ]}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-800 dark:text-gray-100">Cho phép thanh toán bằng xu</div>
                                                    <div className="text-xs text-gray-500 mt-0.5">Học viên có thể dùng xu để mua khoá học</div>
                                                </div>
                                                <button
                                                    onClick={() => setCreateForm(prev => ({ ...prev, allowCoinPayment: !prev.allowCoinPayment }))}
                                                    className={`relative w-12 h-6 rounded-full transition ${createForm.allowCoinPayment ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                                                        }`}
                                                >
                                                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${createForm.allowCoinPayment ? 'translate-x-6' : 'translate-x-0.5'
                                                        }`} />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {/* Step 3: Kiểm tra lại */}
                            {createStep === 3 && (
                                <>
                                    <div className="mb-4">
                                        <h4 className="text-base font-semibold text-gray-800 dark:text-gray-100">Phần 3: Kiểm tra lại thông tin</h4>
                                        <p className="text-sm text-gray-500 mt-1">Xem lại thông tin trước khi tạo khoá học</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                            <div className="text-xs font-medium text-gray-500 uppercase mb-1">Tên khoá học</div>
                                            <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{createForm.title}</div>
                                        </div>

                                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                            <div className="text-xs font-medium text-gray-500 uppercase mb-2">Ảnh thumbnail</div>
                                            <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                                                <img src={createForm.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                            <div className="text-xs font-medium text-gray-500 uppercase mb-1">Loại khoá học</div>
                                            <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                                {createForm.type === 'free' ? 'Miễn phí' : 'Trả phí'}
                                            </div>
                                        </div>

                                        {createForm.type === 'pro' && (
                                            <>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                        <div className="text-xs font-medium text-gray-500 uppercase mb-1">Giá bán</div>
                                                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(createForm.price)}
                                                        </div>
                                                    </div>
                                                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                        <div className="text-xs font-medium text-gray-500 uppercase mb-1">Giảm</div>
                                                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                                            {createForm.discountValue > 0 ? (
                                                                createForm.discountType === 'vnd'
                                                                    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(createForm.discountValue)
                                                                    : `${createForm.discountValue}%`
                                                            ) : 'Không'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                    <div className="text-xs font-medium text-gray-500 uppercase mb-1">Thanh toán bằng xu</div>
                                                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                                        {createForm.allowCoinPayment ? 'Có' : 'Không'}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 z-10">
                            {createStep > 1 && (
                                <CustomButton variant="secondary" onClick={() => setCreateStep(prev => prev - 1)} className="flex-1">
                                    Quay lại
                                </CustomButton>
                            )}
                            {createStep < 3 ? (
                                <CustomButton
                                    onClick={handleNextStep}
                                    className="flex-1"
                                    disabled={uploadingThumb}
                                >
                                    Tiếp theo
                                </CustomButton>
                            ) : (
                                <CustomButton
                                    onClick={handleCreateCourse}
                                    className="flex-1"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Đang tạo...
                                        </>
                                    ) : (
                                        'Tạo khoá học'
                                    )}
                                </CustomButton>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editCourse && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => { setEditCourse(null); setEditStep(1); }}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Chỉnh sửa khoá học</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Bước {editStep}/3</p>
                            </div>
                            <button onClick={() => { setEditCourse(null); setEditStep(1); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 space-y-5">
                            {/* Step 1: Thông tin chung */}
                            {editStep === 1 && (
                                <>
                                    <div className="mb-4">
                                        <h4 className="text-base font-semibold text-gray-800 dark:text-gray-100">Phần 1: Thông tin chung</h4>
                                        <p className="text-sm text-gray-500 mt-1">Nhập thông tin cơ bản về khoá học</p>
                                    </div>

                                    <CustomInput
                                        label="Tên khoá học"
                                        value={editForm.title}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Nhập tên khoá học..."
                                        required
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Ảnh thumbnail (Tỷ lệ 19:6) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            ref={editFileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleEditThumbnailUpload}
                                            className="hidden"
                                        />
                                        {editForm.thumbnail ? (
                                            <div className="relative w-full aspect-[19/6] bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                                <img src={editForm.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => setEditForm(prev => ({ ...prev, thumbnail: '' }))}
                                                    className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => editFileInputRef.current?.click()}
                                                disabled={uploadingEditThumb}
                                                className="w-full aspect-[19/6] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition disabled:opacity-50"
                                            >
                                                {uploadingEditThumb ? (
                                                    <>
                                                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                                        <span className="text-sm text-gray-500">Đang upload...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="w-8 h-8 text-gray-400" />
                                                        <span className="text-sm text-gray-500">Click để tải ảnh lên</span>
                                                        <span className="text-xs text-gray-400">Tỷ lệ 19:6 (ví dụ: 1900x600px)</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Mô tả <span className="text-red-500">*</span>
                                        </label>
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                            <CustomEditor ref={editEditorRef} initialValue={editCourse.description || editForm.description} />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Step 2: Cấu hình thanh toán */}
                            {editStep === 2 && (
                                <>
                                    <div className="mb-4">
                                        <h4 className="text-base font-semibold text-gray-800 dark:text-gray-100">Phần 2: Cấu hình thanh toán</h4>
                                        <p className="text-sm text-gray-500 mt-1">Thiết lập giá và phương thức thanh toán</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Loại khoá học <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setEditForm(prev => ({ ...prev, type: 'free', price: 0, discountValue: 0 }))}
                                                className={`flex-1 p-4 border-2 rounded-lg transition ${editForm.type === 'free'
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                                    }`}
                                            >
                                                <div className="text-center">
                                                    <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">Miễn phí</div>
                                                    <div className="text-xs text-gray-500 mt-1">Học viên có thể truy cập miễn phí</div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => setEditForm(prev => ({ ...prev, type: 'pro' }))}
                                                className={`flex-1 p-4 border-2 rounded-lg transition ${editForm.type === 'pro'
                                                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-yellow-300'
                                                    }`}
                                            >
                                                <div className="text-center">
                                                    <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">Trả phí</div>
                                                    <div className="text-xs text-gray-500 mt-1">Học viên cần thanh toán để học</div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {editForm.type === 'pro' && (
                                        <>
                                            <div className="grid grid-cols-2 gap-4">
                                                <CustomInput
                                                    label="Giá bán (VNĐ)"
                                                    type="number"
                                                    value={editForm.price.toString()}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                                                    placeholder="0"
                                                    required
                                                />
                                                <div className="flex gap-2">
                                                    <div className="flex-1">
                                                        <CustomInput
                                                            label="Giảm"
                                                            type="number"
                                                            value={editForm.discountValue.toString()}
                                                            onChange={(e) => setEditForm(prev => ({ ...prev, discountValue: parseInt(e.target.value) || 0 }))}
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    <div className="w-28">
                                                        <CustomSelect
                                                            label="Loại"
                                                            value={editForm.discountType}
                                                            onChange={(value) => setEditForm(prev => ({ ...prev, discountType: value as 'vnd' | 'percent' }))}
                                                            options={[
                                                                { value: 'vnd', label: 'VNĐ' },
                                                                { value: 'percent', label: '%' },
                                                            ]}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-800 dark:text-gray-100">Cho phép thanh toán bằng xu</div>
                                                    <div className="text-xs text-gray-500 mt-0.5">Học viên có thể dùng xu để mua khoá học</div>
                                                </div>
                                                <button
                                                    onClick={() => setEditForm(prev => ({ ...prev, allowCoinPayment: !prev.allowCoinPayment }))}
                                                    className={`relative w-12 h-6 rounded-full transition ${editForm.allowCoinPayment ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                                                        }`}
                                                >
                                                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${editForm.allowCoinPayment ? 'translate-x-6' : 'translate-x-0.5'
                                                        }`} />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {/* Step 3: Kiểm tra lại */}
                            {editStep === 3 && (
                                <>
                                    <div className="mb-4">
                                        <h4 className="text-base font-semibold text-gray-800 dark:text-gray-100">Phần 3: Kiểm tra lại thông tin</h4>
                                        <p className="text-sm text-gray-500 mt-1">Xem lại thông tin trước khi cập nhật</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                            <div className="text-xs font-medium text-gray-500 uppercase mb-1">Tên khoá học</div>
                                            <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{editForm.title}</div>
                                        </div>

                                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                            <div className="text-xs font-medium text-gray-500 uppercase mb-2">Ảnh thumbnail</div>
                                            <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                                                <img src={editForm.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                            <div className="text-xs font-medium text-gray-500 uppercase mb-1">Loại khoá học</div>
                                            <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                                {editForm.type === 'free' ? 'Miễn phí' : 'Trả phí'}
                                            </div>
                                        </div>

                                        {editForm.type === 'pro' && (
                                            <>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                        <div className="text-xs font-medium text-gray-500 uppercase mb-1">Giá bán</div>
                                                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(editForm.price)}
                                                        </div>
                                                    </div>
                                                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                        <div className="text-xs font-medium text-gray-500 uppercase mb-1">Giảm</div>
                                                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                                            {editForm.discountValue > 0 ? (
                                                                editForm.discountType === 'vnd'
                                                                    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(editForm.discountValue)
                                                                    : `${editForm.discountValue}%`
                                                            ) : 'Không'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                    <div className="text-xs font-medium text-gray-500 uppercase mb-1">Thanh toán bằng xu</div>
                                                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                                        {editForm.allowCoinPayment ? 'Có' : 'Không'}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 z-10">
                            {editStep > 1 && (
                                <CustomButton variant="secondary" onClick={() => setEditStep(prev => prev - 1)} className="flex-1">
                                    Quay lại
                                </CustomButton>
                            )}
                            {editStep < 3 ? (
                                <CustomButton
                                    onClick={handleEditNextStep}
                                    className="flex-1"
                                    disabled={uploadingEditThumb}
                                >
                                    Tiếp theo
                                </CustomButton>
                            ) : (
                                <CustomButton
                                    onClick={handleUpdateCourse}
                                    className="flex-1"
                                    disabled={editSubmitting}
                                >
                                    {editSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Đang cập nhật...
                                        </>
                                    ) : (
                                        'Cập nhật khoá học'
                                    )}
                                </CustomButton>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {previewCourse && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => setPreviewCourse(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Xem trước khoá học</h3>
                            <button onClick={() => setPreviewCourse(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            {previewCourse.thumbnail && (
                                <div className="w-full aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                    <img src={previewCourse.thumbnail} alt={previewCourse.title} className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div>
                                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200">{previewCourse.title}</h4>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${previewCourse.type === 'pro' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                        {previewCourse.type === 'pro' ? 'Pro' : 'Free'}
                                    </span>
                                    {getStatusBadge(previewCourse.status)}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase">Giá</div>
                                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1">
                                        {previewCourse.type === 'free' ? 'Miễn phí' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(previewCourse.discountPrice || previewCourse.price)}
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase">Học viên</div>
                                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1">{previewCourse.enrollCount}</div>
                                </div>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <div className="text-xs text-gray-500 uppercase mb-2">Giáo viên</div>
                                <div className="flex items-center gap-2">
                                    {typeof previewCourse.teacherId === 'object' && previewCourse.teacherId.avatar && (
                                        <img src={previewCourse.teacherId.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                                    )}
                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                        {typeof previewCourse.teacherId === 'object' ? (previewCourse.teacherId.fullName || previewCourse.teacherId.name || 'N/A') : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 z-10">
                            <CustomButton variant="secondary" onClick={() => setPreviewCourse(null)} className="flex-1">Đóng</CustomButton>
                            <CustomButton
                                onClick={() => router.push(`/khoahoc/${previewCourse.slug}`)}
                                className="flex-1"
                            >
                                Xem trang công khai
                            </CustomButton>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Update Modal */}
            {statusModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => setStatusModal(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Cập nhật trạng thái</h3>
                            <button onClick={() => setStatusModal(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Khoá học: <span className="font-medium text-gray-800 dark:text-gray-200">{statusModal.course.title}</span></div>
                            </div>
                            <CustomSelect
                                label="Trạng thái"
                                value={statusModal.newStatus}
                                onChange={(value) => setStatusModal({ ...statusModal, newStatus: value })}
                                options={[
                                    { value: 'draft', label: 'Nháp' },
                                    { value: 'pending', label: 'Chờ duyệt' },
                                    { value: 'approved', label: 'Đã duyệt' },
                                    { value: 'rejected', label: 'Từ chối' },
                                    { value: 'hidden', label: 'Ẩn' },
                                ]}
                            />
                        </div>
                        <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
                            <CustomButton variant="secondary" onClick={() => setStatusModal(null)} className="flex-1">Huỷ</CustomButton>
                            <CustomButton
                                onClick={async () => {
                                    try {
                                        const updated = await khoahocApi.updateAdminCourse(statusModal.course._id, { status: statusModal.newStatus as 'draft' | 'pending' | 'approved' | 'rejected' | 'hidden' });
                                        setCourses(prev => prev.map(c => c._id === statusModal.course._id ? { ...c, status: statusModal.newStatus as 'draft' | 'pending' | 'approved' | 'rejected' | 'hidden' } : c));
                                        setStatusModal(null);
                                        toast.success('Cập nhật trạng thái thành công');
                                    } catch {
                                        toast.error('Cập nhật trạng thái thất bại');
                                    }
                                }}
                                className="flex-1"
                            >
                                Cập nhật
                            </CustomButton>
                        </div>
                    </div>
                </div>
            )}

            {/* Course Builder Overlay */}
            {builderOverlay && (
                <CourseBuilderOverlay
                    courseId={builderOverlay.courseId}
                    courseName={builderOverlay.courseName}
                    onClose={() => setBuilderOverlay(null)}
                />
            )}
        </div>
    );
}
