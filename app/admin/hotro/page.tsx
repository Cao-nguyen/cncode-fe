'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import {
    Plus, Edit2, Trash2, Eye, EyeOff, Search, ChevronLeft, ChevronRight,
    Heart, Loader2, User, CreditCard, GraduationCap, Wrench, MessageSquare, X, HelpCircle,
    Layers, ChevronsLeft, ChevronsRight, ChevronDown, Check
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

const PAGINATION_OPTIONS = [10, 20, 50, 100];

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
    const [isPerPageOpen, setIsPerPageOpen] = useState(false);
    const perPageDropdownRef = useRef<HTMLDivElement>(null);
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
        setIsPerPageOpen(false);
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
        <div className="space-y-6 pb-8 px-4">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/30 p-6 border border-blue-100">
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-transparent rounded-full blur-3xl" />
                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <MessageSquare className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Trung tâm hỗ trợ</h1>
                                <p className="text-sm text-gray-500">Quản lý câu hỏi thường gặp (FAQ)</p>
                            </div>
                        </div>
                    </div>
                    <CustomButton variant="primary" size="medium" onClick={openCreateModal}>
                        <Plus size={16} />
                        Thêm câu hỏi
                    </CustomButton>
                </div>
            </div>

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
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
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
                </div>

                <div className="border-t border-gray-200 px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative" ref={perPageDropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsPerPageOpen(!isPerPageOpen)}
                                className="min-w-[60px] px-3 py-1.5 text-sm font-medium border rounded-lg bg-white text-gray-900 transition-all duration-200 focus:outline-none cursor-pointer flex items-center justify-between gap-2 border-gray-200 hover:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                                <span>{itemsPerPage}</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-gray-600 transition-transform duration-200 ${isPerPageOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isPerPageOpen && (
                                <div className="absolute z-[9999] w-full bottom-full mb-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                    {PAGINATION_OPTIONS.map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => handleItemsPerPageChange(option)}
                                            className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center justify-between transition-colors"
                                        >
                                            <span className="text-gray-900">{option}</span>
                                            {itemsPerPage === option && (
                                                <Check className="w-3.5 h-3.5 text-blue-600" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <span className="text-sm text-gray-500">Tổng: {pagination.total} câu hỏi</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setPage(1)} disabled={page === 1} className="p-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition" title="Trang đầu">
                            <ChevronsLeft size={16} />
                        </button>
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition" title="Trang trước">
                            <ChevronLeft size={16} />
                        </button>
                        <span className="px-3 text-sm font-medium text-gray-700">{page} / {pagination.totalPages || 1}</span>
                        <button onClick={() => setPage(p => Math.min(pagination.totalPages || 1, p + 1))} disabled={page === (pagination.totalPages || 1)} className="p-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition" title="Trang sau">
                            <ChevronRight size={16} />
                        </button>
                        <button onClick={() => setPage(pagination.totalPages || 1)} disabled={page === (pagination.totalPages || 1)} className="p-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition" title="Trang cuối">
                            <ChevronsRight size={16} />
                        </button>
                    </div>
                </div>
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
        </div>
    );
}
