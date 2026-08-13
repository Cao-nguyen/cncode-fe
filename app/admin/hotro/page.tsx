'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import {
    Plus, Edit2, Trash2, Eye, EyeOff, Search, Loader2, User, CreditCard, GraduationCap, Wrench, MessageSquare, X, HelpCircle,
    Layers, Heart
} from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { useAdminHelpCenter } from '@/hooks/helpcenter/useAdminHelpCenter';
import type { HelpCenterFAQ, HelpCenterStats } from '@/types/helpcenter.type';
import type { CustomEditorRef } from '@/components/custom/CustomEditor';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomInputSearch } from '@/components/custom/CustomInputSearch';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { CustomToggle } from '@/components/custom/CustomToggle';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import { DashboardCard } from '@/components/custom/DashboardCard';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminTableScroll } from '@/components/admin/AdminTableScroll';

const CustomEditor = dynamic(() => import('@/components/custom/CustomEditor'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-xl">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
    )
});

const CATEGORIES = [
    { value: 'all', label: 'Tất cả' },
    { value: 'account', label: 'Tài khoản' },
    { value: 'payment', label: 'Thanh toán' },
    { value: 'course', label: 'Khóa học' },
    { value: 'technical', label: 'Kỹ thuật' },
    { value: 'other', label: 'Khác' }
];

const CATEGORY_OPTIONS = [
    { value: 'account', label: 'Tài khoản' },
    { value: 'payment', label: 'Thanh toán' },
    { value: 'course', label: 'Khóa học' },
    { value: 'technical', label: 'Kỹ thuật' },
    { value: 'other', label: 'Khác' }
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    account: <User size={14} />,
    payment: <CreditCard size={14} />,
    course: <GraduationCap size={14} />,
    technical: <Wrench size={14} />,
    other: <MessageSquare size={14} />
};

export default function AdminHoTroPage() {
    const { token } = useAuthStore();
    const editorRef = useRef<CustomEditorRef | null>(null);
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isInitialMount = useRef(true);

    const {
        faqs,
        stats,
        loading,
        error,
        pagination,
        fetchAllFAQs,
        fetchStats,
        createFAQ,
        updateFAQ,
        deleteFAQ
    } = useAdminHelpCenter();

    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingFaq, setEditingFaq] = useState<HelpCenterFAQ | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        category: 'other',
        order: 0,
        isActive: true
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            fetchAllFAQs(page, selectedCategory, search, itemsPerPage);
            return;
        }
        fetchAllFAQs(page, selectedCategory, search, itemsPerPage);
    }, [page, selectedCategory, search, itemsPerPage, fetchAllFAQs]);

    const handleSearchChange = (value: string) => {
        setSearchInput(value);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            setSearch(value.trim());
            setPage(1);
        }, 400);
    };

    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value);
        setPage(1);
    };

    const handleItemsPerPageChange = (value: number) => {
        setItemsPerPage(value);
        setPage(1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const answerContent = editorRef.current?.getContent() || '';
        if (!formData.question.trim()) { toast.warning('Vui lòng nhập câu hỏi'); return; }
        if (!answerContent.trim() || answerContent === '<p><br></p>') { toast.warning('Vui lòng nhập câu trả lời'); return; }

        setSubmitting(true);
        try {
            const result = editingFaq
                ? await updateFAQ(editingFaq._id, { ...formData, answer: answerContent })
                : await createFAQ({ ...formData, answer: answerContent });

            if (result.success) {
                toast.success(editingFaq ? 'Cập nhật thành công' : 'Tạo câu hỏi thành công');
                setShowModal(false);
                resetForm();
            } else {
                toast.error(result.message || 'Thao tác thất bại');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        try {
            const result = await deleteFAQ(deletingId);
            if (result.success) {
                toast.success('Xóa thành công');
            } else {
                toast.error(result.message || 'Xóa thất bại');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        } finally {
            setShowDeleteModal(false);
            setDeletingId(null);
        }
    };

    const handleToggleActive = async (faq: HelpCenterFAQ) => {
        try {
            const result = await updateFAQ(faq._id, { isActive: !faq.isActive });
            if (result.success) {
                toast.success(faq.isActive ? 'Đã ẩn câu hỏi' : 'Đã hiện câu hỏi');
            } else {
                toast.error(result.message || 'Cập nhật thất bại');
            }
        } catch (error) {
            toast.error('Cập nhật thất bại');
        }
    };

    const openEditModal = (faq: HelpCenterFAQ) => {
        setEditingFaq(faq);
        setFormData({
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            order: faq.order,
            isActive: faq.isActive
        });
        setShowModal(true);
        setTimeout(() => editorRef.current?.setContent(faq.answer), 100);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
        setTimeout(() => editorRef.current?.setContent(''), 100);
    };

    const resetForm = () => {
        setEditingFaq(null);
        setFormData({ question: '', answer: '', category: 'other', order: 0, isActive: true });
    };

    const openDeleteModal = (id: string) => {
        setDeletingId(id);
        setShowDeleteModal(true);
    };

    const getCategoryLabel = (value: string) => CATEGORIES.find(c => c.value === value)?.label || value;

    const total = stats?.total || 0;
    const active = stats?.active || 0;
    const inactive = stats?.inactive || 0;
    const activeRate = total > 0 ? Math.round((active / total) * 100) : 0;
    const categoryCount = Object.keys(stats?.byCategory || {}).length;

    const statCards = [
        {
            key: 'total',
            title: 'Tổng câu hỏi',
            value: total,
            description: `${categoryCount} danh mục đang có dữ liệu`,
            icon: <Layers size={20} />,
            iconBgColor: '#EFF6FF',
            iconColor: '#3B82F6',
            accentColor: '#3B82F6',
        },
        {
            key: 'active',
            title: 'Đang hiển thị',
            value: active,
            description: `${activeRate}% câu hỏi công khai`,
            icon: <Eye size={20} />,
            iconBgColor: '#ECFDF5',
            iconColor: '#059669',
            accentColor: '#10B981',
        },
        {
            key: 'inactive',
            title: 'Đã ẩn',
            value: inactive,
            description: inactive > 0 ? 'Chưa hiển thị với người dùng' : 'Không có câu hỏi bị ẩn',
            icon: <EyeOff size={20} />,
            iconBgColor: '#F3F4F6',
            iconColor: '#6B7280',
            accentColor: '#9CA3AF',
        },
        {
            key: 'helpful',
            title: 'Lượt hữu ích',
            value: stats?.totalHelpful || 0,
            description: `${(stats?.totalViews || 0).toLocaleString('vi-VN')} lượt xem tổng`,
            icon: <Heart size={20} />,
            iconBgColor: '#FDF2F8',
            iconColor: '#DB2777',
            accentColor: '#EC4899',
        },
    ];

    return (
        <AdminPageShell
            title="Trung tâm hỗ trợ"
            description="Quản lý câu hỏi thường gặp (FAQ)"
            action={
                <CustomButton variant="primary" size="medium" onClick={openCreateModal} className="w-full sm:w-auto">
                    <Plus size={16} />
                    Thêm câu hỏi
                </CustomButton>
            }
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {statCards.map((card) => (
                    <DashboardCard
                        key={card.key}
                        title={card.title}
                        value={card.value}
                        description={card.description}
                        icon={card.icon}
                        iconBgColor={card.iconBgColor}
                        iconColor={card.iconColor}
                        accentColor={card.accentColor}
                    />
                ))}
            </div>

            <div className="flex flex-wrap gap-3 items-center">
                <div className="flex-1 min-w-[200px]">
                    <CustomInputSearch
                        placeholder="Tìm kiếm câu hỏi..."
                        value={searchInput}
                        onChange={handleSearchChange}
                        size="medium"
                    />
                </div>
                <div className="w-48">
                    <CustomSelect
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        options={CATEGORIES}
                        placeholder="Chọn danh mục"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <AdminTableScroll minWidth={900}>
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr className="text-left">
                                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase text-center w-[50px]">STT</th>
                                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Câu hỏi</th>
                                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase w-[120px]">Danh mục</th>
                                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase text-center w-[100px]">Lượt xem</th>
                                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase text-center w-[100px]">Hữu ích</th>
                                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase text-center w-[110px]">Trạng thái</th>
                                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase text-center w-[120px]">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {faqs.map((faq, index) => (
                                <tr key={faq._id} className="hover:bg-gray-50 transition">
                                    <td className="px-5 py-4 text-center text-sm text-gray-500">{(page - 1) * 20 + index + 1}</td>
                                    <td className="px-5 py-4">
                                        <p className="text-sm font-medium text-gray-800 line-clamp-2 max-w-[300px]">{faq.question}</p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 whitespace-nowrap">
                                            {CATEGORY_ICONS[faq.category]}
                                            {getCategoryLabel(faq.category)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-center text-sm text-gray-500">{faq.views}</td>
                                    <td className="px-5 py-4 text-center">
                                        <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                                            <Heart size={14} />
                                            {faq.helpfulCount}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${faq.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {faq.isActive ? 'Hiển thị' : 'Ẩn'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-center gap-1">
                                            <button onClick={() => handleToggleActive(faq)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                                                {faq.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                                            </button>
                                            <button onClick={() => openEditModal(faq)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => openDeleteModal(faq._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </AdminTableScroll>

                <AdminPagination
                    page={page}
                    totalPages={pagination.totalPages || 1}
                    totalItems={pagination.total}
                    pageSize={itemsPerPage}
                    onPageChange={setPage}
                    onPageSizeChange={handleItemsPerPageChange}
                    itemLabel="câu hỏi"
                />
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-gray-800">{editingFaq ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}</h3>
                            <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition"><X size={18} className="text-gray-500" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Câu hỏi <span className="text-red-500">*</span></label>
                                <CustomInput value={formData.question} onChange={(e) => setFormData(p => ({ ...p, question: e.target.value }))} placeholder="Nhập câu hỏi..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Danh mục</label>
                                <CustomSelect value={formData.category} onChange={(v) => setFormData(p => ({ ...p, category: v }))} options={CATEGORY_OPTIONS} placeholder="Chọn danh mục" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Thứ tự hiển thị</label>
                                <CustomInput type="number" value={formData.order.toString()} onChange={(e) => setFormData(p => ({ ...p, order: parseInt(e.target.value) || 0 }))} placeholder="0" />
                                <p className="text-xs text-gray-400 mt-1">Số càng nhỏ càng hiển thị lên đầu</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Câu trả lời <span className="text-red-500">*</span></label>
                                <CustomEditor
                                    key={editingFaq?._id || 'new'}
                                    ref={editorRef}
                                    initialValue={editingFaq?.answer || ''}
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <CustomToggle checked={formData.isActive} onChange={(c) => setFormData(p => ({ ...p, isActive: c }))} />
                                <span className="text-sm text-gray-700">Hiển thị công khai</span>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <CustomButton variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Hủy</CustomButton>
                                <CustomButton variant="primary" className="flex-1" type="submit" loading={submitting}>Lưu</CustomButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModalDelete
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Xóa câu hỏi"
                message="Bạn có chắc chắn muốn xóa câu hỏi này không?"
                warning="Hành động này không thể hoàn tác."
            />

            <style jsx global>{`
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </AdminPageShell>
    );
}
