'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import {
    Plus, Edit2, Trash2, Eye, EyeOff, Search, ChevronLeft, ChevronRight,
    Heart, Loader2, User, CreditCard, GraduationCap, Wrench, MessageSquare, X, HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { helpCenterApi } from '@/lib/api/helpcenter.api';
import type { HelpCenterFAQ, HelpCenterStats } from '@/types/helpcenter.type';
import type { CustomEditorRef } from '@/components/custom/CustomEditor';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomInputSearch } from '@/components/custom/CustomInputSearch';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { CustomToggle } from '@/components/custom/CustomToggle';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';

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

export default function AdminHelpCenterPage() {
    const { token } = useAuthStore();
    const editorRef = useRef<CustomEditorRef | null>(null);
    const [faqs, setFaqs] = useState<HelpCenterFAQ[]>([]);
    const [tableLoading, setTableLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [stats, setStats] = useState<HelpCenterStats>({ total: 0, active: 0, inactive: 0, byCategory: {} });
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isInitialMount = useRef(true);

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

    const fetchTableData = useCallback(async (currentPage: number, currentCategory: string, currentSearch: string) => {
        if (!token) return;
        setTableLoading(true);
        try {
            const faqsResult = await helpCenterApi.getAllFAQs(currentPage, 20, currentCategory, currentSearch);
            if (faqsResult.success) {
                setFaqs(faqsResult.data);
                setTotalPages(faqsResult.pagination?.totalPages || 1);
                setTotal(faqsResult.pagination?.total || 0);
            }
        } catch (error) {
            console.error('Fetch FAQs error:', error);
            toast.error('Không thể tải danh sách câu hỏi');
        } finally {
            setTableLoading(false);
        }
    }, [token]);

    const fetchStatsData = useCallback(async () => {
        if (!token) return;
        try {
            const statsResult = await helpCenterApi.getStats();
            if (statsResult.success) {
                setStats(statsResult.data);
            }
        } catch (error) {
            console.error('Fetch stats error:', error);
        }
    }, [token]);

    useEffect(() => {
        fetchStatsData();
    }, [fetchStatsData]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            fetchTableData(page, selectedCategory, search);
            return;
        }
        fetchTableData(page, selectedCategory, search);
    }, [page, selectedCategory, search, fetchTableData]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const answerContent = editorRef.current?.getContent() || '';
        if (!formData.question.trim()) { toast.warning('Vui lòng nhập câu hỏi'); return; }
        if (!answerContent.trim() || answerContent === '<p><br></p>') { toast.warning('Vui lòng nhập câu trả lời'); return; }

        setSubmitting(true);
        try {
            const result = editingFaq
                ? await helpCenterApi.updateFAQ(editingFaq._id, { ...formData, answer: answerContent })
                : await helpCenterApi.createFAQ({ ...formData, answer: answerContent });

            if (result.success) {
                toast.success(editingFaq ? 'Cập nhật thành công' : 'Tạo câu hỏi thành công');
                setShowModal(false);
                resetForm();
                fetchTableData(page, selectedCategory, search);
                fetchStatsData();
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
            const result = await helpCenterApi.deleteFAQ(deletingId);
            if (result.success) {
                toast.success('Xóa thành công');
                fetchTableData(page, selectedCategory, search);
                fetchStatsData();
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
            const result = await helpCenterApi.updateFAQ(faq._id, { isActive: !faq.isActive });
            if (result.success) {
                toast.success(faq.isActive ? 'Đã ẩn câu hỏi' : 'Đã hiện câu hỏi');
                fetchTableData(page, selectedCategory, search);
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

    return (
        <div className="space-y-6 pb-8 px-4">
            { }
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

            { }
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-500">Tổng số</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-green-200 bg-green-50">
                    <p className="text-sm text-green-600">Đang hiển thị</p>
                    <p className="text-2xl font-bold text-green-700">{stats.active}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-500">Đã ẩn</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.inactive}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-500">Lượt hữu ích</p>
                    <p className="text-2xl font-bold text-gray-800">
                        {faqs.reduce((sum, f) => sum + f.helpfulCount, 0)}
                    </p>
                </div>
            </div>

            { }
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
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
            </div>

            { }
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">

                { }
                {tableLoading && (
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-100 overflow-hidden z-20">
                        <div className="w-full h-full bg-blue-500 animate-[loading_1.5s_infinite_linear]" style={{
                            backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                            backgroundSize: '200% 100%'
                        }}></div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className={`w-full min-w-[800px] transition-opacity duration-300 ${tableLoading ? 'opacity-50' : 'opacity-100'}`}>
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr className="text-left">
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-[50px] text-center">STT</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Câu hỏi</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-[120px]">Danh mục</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-[100px] text-center">Lượt xem</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-[100px] text-center">Hữu ích</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-[110px] text-center">Trạng thái</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-[120px] text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {faqs.map((faq, index) => (
                                <tr key={faq._id} className="hover:bg-gray-50 transition">
                                    <td className="px-4 py-3 text-sm text-gray-500 text-center">{(page - 1) * 20 + index + 1}</td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm font-medium text-gray-800 line-clamp-2 max-w-[300px]">{faq.question}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 whitespace-nowrap">
                                            {CATEGORY_ICONS[faq.category]}
                                            {getCategoryLabel(faq.category)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm text-gray-500">{faq.views}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                                            <Heart size={14} />
                                            {faq.helpfulCount}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${faq.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {faq.isActive ? 'Hiển thị' : 'Ẩn'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-1">
                                            <button onClick={() => handleToggleActive(faq)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
                                                {faq.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                                            </button>
                                            <button onClick={() => openEditModal(faq)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => openDeleteModal(faq._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                { }
                {totalPages > 1 && (
                    <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
                        <div className="text-sm text-gray-500">Tổng: {total} câu hỏi</div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">
                                <ChevronLeft size={16} />
                            </button>
                            <span className="px-2 text-sm font-medium text-gray-700">{page} / {totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            { }
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

            { }
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
