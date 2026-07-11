'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Loader2, Search, Plus, X, Upload, Save, Pencil, Trash2, Eye, Users, Trophy
} from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomInputSearch } from '@/components/custom/CustomInputSearch';
import { CustomInputDate } from '@/components/custom/CustomInputDate';
import { CustomInputTime } from '@/components/custom/CustomInputTime';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { CustomTextarea } from '@/components/custom/CustomTextarea';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import { TableSkeleton } from '@/components/ui/skeleton';
import { uploadApi } from '@/lib/upload';
import { toast } from 'sonner';
import * as dautruongApi from '@/lib/api/dautruong.api';
import { Contest } from '@/lib/api/dautruong.api';

interface AdminContest extends Contest {
    createdBy?: { _id: string; name: string; email: string };
}

type StatusFilter = 'all' | 'draft' | 'published' | 'ended';

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 'draft', label: 'Nháp' },
    { value: 'published', label: 'Đã đăng' },
    { value: 'ended', label: 'Đã kết thúc' },
];

export default function AdminDauTruongPage() {
    const router = useRouter();

    const [contests, setContests] = useState<AdminContest[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<AdminContest | null>(null);
    const [createModal, setCreateModal] = useState(false);
    const [editContest, setEditContest] = useState<AdminContest | null>(null);
    const [viewContest, setViewContest] = useState<AdminContest | null>(null);
    const [statusContest, setStatusContest] = useState<AdminContest | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingThumb, setUploadingThumb] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        title: '',
        description: '',
        thumbnail: '',
        startDate: '',
        startTimeHour: '00',
        startTimeMinute: '00',
        endDate: '',
        endTimeHour: '00',
        endTimeMinute: '00',
        duration: 30,
        maxAttempts: 0,
    });

    useEffect(() => {
        loadContests();
    }, [statusFilter]);

    const loadContests = async () => {
        try {
            setLoading(true);
            const params: { page: number; limit: number; status?: string } = { page: 1, limit: 50 };
            if (statusFilter !== 'all') params.status = statusFilter;

            const response = await dautruongApi.getAdminContests(params);
            console.log('Admin contests response:', response);
            setContests(response.contests || []);
        } catch (error) {
            console.error('Error loading contests:', error);
            toast.error('Không thể tải danh sách cuộc thi');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setForm({
            title: '',
            description: '',
            thumbnail: '',
            startDate: '',
            startTimeHour: '00',
            startTimeMinute: '00',
            endDate: '',
            endTimeHour: '00',
            endTimeMinute: '00',
            duration: 30,
            maxAttempts: 0,
        });
        setCreateModal(true);
    };

    const handleEdit = (contest: AdminContest) => {
        const startDate = contest.startTime ? new Date(contest.startTime) : null;
        const endDate = contest.endTime ? new Date(contest.endTime) : null;

        setForm({
            title: contest.title,
            description: contest.description || '',
            thumbnail: contest.thumbnail || '',
            startDate: startDate ? startDate.toISOString().slice(0, 10) : '',
            startTimeHour: startDate ? String(startDate.getHours()).padStart(2, '0') : '00',
            startTimeMinute: startDate ? String(startDate.getMinutes()).padStart(2, '0') : '00',
            endDate: endDate ? endDate.toISOString().slice(0, 10) : '',
            endTimeHour: endDate ? String(endDate.getHours()).padStart(2, '0') : '00',
            endTimeMinute: endDate ? String(endDate.getMinutes()).padStart(2, '0') : '00',
            duration: contest.duration,
            maxAttempts: contest.maxAttempts || 0,
        });
        setEditContest(contest);
        setCreateModal(true);
    };

    const handleView = (contest: AdminContest) => {
        setViewContest(contest);
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;

        try {
            await dautruongApi.deleteContest(deleteConfirm._id);
            toast.success('Đã xóa cuộc thi');
            setContests(contests.filter(c => c._id !== deleteConfirm._id));
            setDeleteConfirm(null);
        } catch (error) {
            toast.error('Không thể xóa cuộc thi');
        }
    };

    const handleStatusChange = async (newStatus: 'draft' | 'published' | 'ended') => {
        if (!statusContest) return;

        try {
            await dautruongApi.updateContest(statusContest._id, { status: newStatus });
            toast.success('Đã cập nhật trạng thái');
            setContests(contests.map(c =>
                c._id === statusContest._id ? { ...c, status: newStatus } : c
            ));
            setStatusContest(null);
        } catch (error) {
            toast.error('Không thể cập nhật trạng thái');
        }
    };

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploadingThumb(true);

            // Convert file to base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64 = reader.result as string;
                const response = await uploadApi.uploadFile(base64);
                if (response.success && response.url) {
                    setForm({ ...form, thumbnail: response.url });
                    toast.success('Đã tải lên ảnh');
                } else {
                    toast.error(response.message || 'Không thể tải lên ảnh');
                }
                setUploadingThumb(false);
            };
            reader.onerror = () => {
                toast.error('Không thể đọc file');
                setUploadingThumb(false);
            };
        } catch (error) {
            toast.error('Không thể tải lên ảnh');
            setUploadingThumb(false);
        }
    };

    const handleSubmit = async () => {
        if (!form.title.trim()) {
            toast.error('Vui lòng nhập tiêu đề');
            return;
        }
        if (!form.startDate) {
            toast.error('Vui lòng chọn ngày bắt đầu');
            return;
        }
        if (!form.startTimeHour || !form.startTimeMinute) {
            toast.error('Vui lòng chọn giờ bắt đầu');
            return;
        }

        try {
            setSubmitting(true);

            // Combine date and time
            const startDateTime = new Date(`${form.startDate}T${form.startTimeHour}:${form.startTimeMinute}:00`);

            if (isNaN(startDateTime.getTime())) {
                toast.error('Thời gian bắt đầu không hợp lệ');
                return;
            }

            let endDateTime;
            if (form.endDate && form.endTimeHour && form.endTimeMinute) {
                endDateTime = new Date(`${form.endDate}T${form.endTimeHour}:${form.endTimeMinute}:00`);
            } else {
                endDateTime = new Date(startDateTime.getTime() + form.duration * 60000);
            }

            if (isNaN(endDateTime.getTime())) {
                toast.error('Thời gian kết thúc không hợp lệ');
                return;
            }

            const data = {
                title: form.title,
                description: form.description,
                thumbnail: form.thumbnail,
                startTime: startDateTime.toISOString(),
                endTime: endDateTime.toISOString(),
                duration: form.duration,
                maxAttempts: form.maxAttempts,
                // Only set status and questions when creating new contest
                // When editing, don't send these fields to preserve existing values
                ...(editContest ? {} : { status: 'draft' as const, questions: [] }),
            };

            let contestId: string;
            if (editContest) {
                const result = await dautruongApi.updateContest(editContest._id, data);
                contestId = editContest._id;

                // Update local state with the new data
                const updatedContest = result.data?.contest || result.contest;
                if (updatedContest) {
                    setContests(contests.map(c =>
                        c._id === contestId ? { ...c, ...updatedContest } : c
                    ));
                }

                toast.success('Đã cập nhật cuộc thi');
                setCreateModal(false);
                setEditContest(null);
            } else {
                const result = await dautruongApi.createContest(data);
                // Check if result has the expected structure
                if (result.data && result.data.contest) {
                    contestId = result.data.contest._id;
                } else if (result.contest) {
                    contestId = result.contest._id;
                } else {
                    throw new Error('Invalid response format');
                }
                toast.success('Đã tạo cuộc thi');
                setCreateModal(false);
                setEditContest(null);

                // Redirect to editor page only when creating new contest
                router.push(`/admin/dautruong/${contestId}/edit`);
            }
        } catch (error) {
            console.error('Error saving contest:', error);
            const errorMessage = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
                (error as { message?: string })?.message ||
                'Không thể lưu cuộc thi';
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredContests = contests.filter(contest =>
        contest.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Đấu trường học tập</h1>
                    <p className="text-gray-500 dark:text-gray-400">Quản lý các cuộc thi</p>
                </div>
                <CustomButton onClick={handleCreate} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Tạo cuộc thi
                </CustomButton>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <CustomInputSearch
                        placeholder="Tìm kiếm cuộc thi..."
                        value={searchQuery}
                        onChange={setSearchQuery}
                    />
                </div>
                <div className="flex gap-2">
                    {STATUS_TABS.map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => setStatusFilter(tab.value)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === tab.value
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <TableSkeleton />
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Cuộc thi
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Thời gian
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Thống kê
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredContests.map(contest => (
                                <tr
                                    key={contest._id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                                    onClick={() => router.push(`/admin/dautruong/${contest._id}/edit`)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {contest.thumbnail && (
                                                <img
                                                    src={contest.thumbnail}
                                                    alt={contest.title}
                                                    className="h-12 w-12 rounded-lg object-cover"
                                                />
                                            )}
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {contest.title}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {contest.questions?.length || 0} câu hỏi
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 dark:text-white">
                                            {new Date(contest.startTime).toLocaleDateString('vi-VN')}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {contest.duration} phút
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setStatusContest(contest); }}
                                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full cursor-pointer hover:opacity-80 transition-opacity ${contest.status === 'published' ? 'bg-green-100 text-green-800' :
                                                contest.status === 'ended' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {contest.status === 'published' ? 'Đã đăng' :
                                                contest.status === 'ended' ? 'Đã kết thúc' : 'Nháp'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                {contest.participantCount}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Trophy className="h-4 w-4" />
                                                {contest.totalPoints} điểm
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleView(contest); }}
                                                className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleEdit(contest); }}
                                                className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setDeleteConfirm(contest); }}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredContests.length === 0 && (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            Không có cuộc thi nào
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            {createModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editContest ? 'Chỉnh sửa cuộc thi' : 'Tạo cuộc thi mới'}
                            </h2>
                            <button
                                onClick={() => {
                                    setCreateModal(false);
                                    setEditContest(null);
                                }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Tiêu đề *
                                    </label>
                                    <CustomInput
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        placeholder="Nhập tiêu đề cuộc thi"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Mô tả
                                    </label>
                                    <CustomTextarea
                                        value={form.description}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, description: e.target.value })}
                                        rows={3}
                                        placeholder="Nhập mô tả cuộc thi"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Ảnh đại diện
                                    </label>
                                    <div className="flex items-center gap-4">
                                        {form.thumbnail && (
                                            <img
                                                src={form.thumbnail}
                                                alt="Thumbnail"
                                                className="h-20 w-20 rounded-lg object-cover"
                                            />
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleThumbnailUpload}
                                            className="hidden"
                                        />
                                        <CustomButton
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingThumb}
                                            variant="outline"
                                            className="gap-2"
                                        >
                                            {uploadingThumb ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Upload className="h-4 w-4" />
                                            )}
                                            Tải lên ảnh
                                        </CustomButton>
                                    </div>
                                </div>

                                <div>
                                    <CustomInputDate
                                        label="Ngày bắt đầu"
                                        value={form.startDate}
                                        onChange={(value) => setForm({ ...form, startDate: value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Giờ bắt đầu *
                                    </label>
                                    <div className="flex gap-2 items-center">
                                        <CustomInputTime
                                            value={form.startTimeHour}
                                            onChange={(value) => setForm({ ...form, startTimeHour: value })}
                                            max={23}
                                            placeholder="00"
                                        />
                                        <span className="text-gray-500">:</span>
                                        <CustomInputTime
                                            value={form.startTimeMinute}
                                            onChange={(value) => setForm({ ...form, startTimeMinute: value })}
                                            max={59}
                                            placeholder="00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <CustomInputDate
                                        label="Ngày kết thúc"
                                        value={form.endDate}
                                        onChange={(value) => setForm({ ...form, endDate: value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Giờ kết thúc
                                    </label>
                                    <div className="flex gap-2 items-center">
                                        <CustomInputTime
                                            value={form.endTimeHour}
                                            onChange={(value) => setForm({ ...form, endTimeHour: value })}
                                            max={23}
                                            placeholder="00"
                                        />
                                        <span className="text-gray-500">:</span>
                                        <CustomInputTime
                                            value={form.endTimeMinute}
                                            onChange={(value) => setForm({ ...form, endTimeMinute: value })}
                                            max={59}
                                            placeholder="00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Thời lượng (phút) *
                                    </label>
                                    <CustomInput
                                        type="number"
                                        value={form.duration}
                                        onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 0 })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Số lần làm bài tối đa
                                    </label>
                                    <CustomInput
                                        type="number"
                                        value={form.maxAttempts}
                                        onChange={(e) => setForm({ ...form, maxAttempts: parseInt(e.target.value) || 0 })}
                                        placeholder="0 = không giới hạn"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        0 = không giới hạn số lần làm bài
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 px-6 py-4 flex justify-end gap-3 z-10">
                            <CustomButton
                                onClick={() => {
                                    setCreateModal(false);
                                    setEditContest(null);
                                }}
                                variant="outline"
                            >
                                Hủy
                            </CustomButton>
                            <CustomButton
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="gap-2"
                            >
                                {submitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                {editContest ? 'Lưu & Chỉnh sửa câu hỏi' : 'Tạo & Chỉnh sửa câu hỏi'}
                            </CustomButton>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {viewContest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {viewContest.title}
                            </h2>
                            <button
                                onClick={() => setViewContest(null)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {viewContest.thumbnail && (
                                <img
                                    src={viewContest.thumbnail}
                                    alt={viewContest.title}
                                    className="w-full h-64 object-cover rounded-lg"
                                />
                            )}

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Thông tin</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Thời gian bắt đầu:</span>
                                        <p className="text-gray-900 dark:text-white">
                                            {new Date(viewContest.startTime).toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Thời gian kết thúc:</span>
                                        <p className="text-gray-900 dark:text-white">
                                            {viewContest.endTime ? new Date(viewContest.endTime).toLocaleString('vi-VN') : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Thời lượng:</span>
                                        <p className="text-gray-900 dark:text-white">{viewContest.duration} phút</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Tổng điểm:</span>
                                        <p className="text-gray-900 dark:text-white">{viewContest.totalPoints} điểm</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Số lần làm bài:</span>
                                        <p className="text-gray-900 dark:text-white">{viewContest.maxAttempts === 0 ? 'Không giới hạn' : viewContest.maxAttempts}</p>
                                    </div>
                                </div>
                            </div>

                            {viewContest.description && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Mô tả</h3>
                                    <p className="text-gray-700 dark:text-gray-300">{viewContest.description}</p>
                                </div>
                            )}

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Câu hỏi ({viewContest.questions?.length || 0})
                                </h3>
                                <div className="space-y-4">
                                    {viewContest.questions?.map((question, index) => (
                                        <div
                                            key={index}
                                            className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4"
                                        >
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    Câu {index + 1}
                                                </span>
                                                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                    {question.type === 'multiple-choice' ? 'Trắc nghiệm' :
                                                        question.type === 'true-false' ? 'Đúng/Sai' : 'Trả lời ngắn'}
                                                </span>
                                            </div>
                                            <p className="text-gray-900 dark:text-white mb-3">{question.question}</p>

                                            {question.type === 'multiple-choice' && (
                                                <div className="space-y-2">
                                                    {question.options?.map((opt, i) => (
                                                        <div
                                                            key={i}
                                                            className={`flex items-center gap-2 p-2 rounded ${opt.isCorrect ? 'bg-green-100 text-green-800' : 'bg-white dark:bg-gray-800'
                                                                }`}
                                                        >
                                                            <span className="text-sm">
                                                                {opt.isCorrect ? '✓' : String.fromCharCode(65 + i)}
                                                            </span>
                                                            <span className="text-sm">{opt.text}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {question.type === 'true-false' && (
                                                <div className="space-y-2">
                                                    {question.trueFalseOptions?.map((opt, i) => (
                                                        <div
                                                            key={i}
                                                            className={`flex items-center gap-2 p-2 rounded ${opt.isCorrect ? 'bg-green-100 text-green-800' : 'bg-white dark:bg-gray-800'
                                                                }`}
                                                        >
                                                            <span className="text-sm">
                                                                {opt.isCorrect ? '✓ Đúng' : '✗ Sai'}
                                                            </span>
                                                            <span className="text-sm">{opt.text}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {question.type === 'short-answer' && (
                                                <div className="p-2 bg-green-100 text-green-800 rounded">
                                                    <span className="text-sm font-medium">Đáp án: {question.correctAnswer}</span>
                                                </div>
                                            )}

                                            {question.explanation && (
                                                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                                        <span className="font-medium">Lời giải:</span> {question.explanation}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModalDelete
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={handleDelete}
                title="Xóa cuộc thi"
                message="Bạn có chắc chắn muốn xóa cuộc thi này? Hành động này không thể hoàn tác."
            />

            {/* Status Change Modal */}
            {statusContest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
                        <div className="px-6 py-4 border-b dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Đổi trạng thái
                            </h2>
                        </div>
                        <div className="p-6 space-y-3">
                            <button
                                onClick={() => handleStatusChange('draft')}
                                className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${statusContest.status === 'draft'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-900 dark:text-white">Nháp</span>
                                    {statusContest.status === 'draft' && (
                                        <span className="text-blue-500 text-sm">Hiện tại</span>
                                    )}
                                </div>
                            </button>
                            <button
                                onClick={() => handleStatusChange('published')}
                                className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${statusContest.status === 'published'
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-900 dark:text-white">Đã đăng</span>
                                    {statusContest.status === 'published' && (
                                        <span className="text-green-500 text-sm">Hiện tại</span>
                                    )}
                                </div>
                            </button>
                            <button
                                onClick={() => handleStatusChange('ended')}
                                className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${statusContest.status === 'ended'
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-red-300'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-900 dark:text-white">Đã kết thúc</span>
                                    {statusContest.status === 'ended' && (
                                        <span className="text-red-500 text-sm">Hiện tại</span>
                                    )}
                                </div>
                            </button>
                        </div>
                        <div className="px-6 py-4 border-t dark:border-gray-700 flex justify-end">
                            <button
                                onClick={() => setStatusContest(null)}
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
