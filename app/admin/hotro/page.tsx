// app/admin/trungtamhotro/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { faqApi, IFAQ } from '@/lib/api/faq.api';
import { FAQ_CATEGORIES } from '@/types/faq.type';
import TinyMCEEditor from '@/components/common/TinyMCEEditor';
import { toast } from 'sonner';
import { Loader2, Plus, Edit, Trash2, X, Search } from 'lucide-react';
import ConfirmDialog from '@/components/common/ConfirmDialog';

export default function AdminTrungTamHotroPage() {
    const { token } = useAuthStore();
    const [faqs, setFaqs] = useState<IFAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<IFAQ | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<IFAQ | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        category: 'general',
        order: 0,
        isActive: true
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchFAQs = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const result = await faqApi.getAllFAQsAdmin(token, {
                category: selectedCategory === 'all' ? undefined : selectedCategory,
                search: searchTerm || undefined,
                limit: 100
            });
            if (result.success) {
                setFaqs(result.data);
            } else {
                toast.error(result.message || 'Không thể tải dữ liệu');
            }
        } catch (error) {
            console.error('Fetch FAQs error:', error);
            toast.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    }, [token, selectedCategory, searchTerm]);

    useEffect(() => {
        fetchFAQs();
    }, [fetchFAQs]);

    const handleSubmit = async () => {
        if (!formData.question.trim()) {
            toast.error('Vui lòng nhập câu hỏi');
            return;
        }
        if (!formData.answer.trim()) {
            toast.error('Vui lòng nhập câu trả lời');
            return;
        }
        if (!token) return;

        setSubmitting(true);
        try {
            if (editingItem) {
                const result = await faqApi.updateFAQ(editingItem._id, formData, token);
                if (result.success) {
                    toast.success('Cập nhật thành công');
                    fetchFAQs();
                    closeModal();
                } else {
                    toast.error(result.message || 'Cập nhật thất bại');
                }
            } else {
                const result = await faqApi.createFAQ(formData, token);
                if (result.success) {
                    toast.success('Thêm câu hỏi thành công');
                    fetchFAQs();
                    closeModal();
                } else {
                    toast.error(result.message || 'Thêm thất bại');
                }
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget || !token) return;
        try {
            const result = await faqApi.deleteFAQ(deleteTarget._id, token);
            if (result.success) {
                toast.success('Xóa thành công');
                fetchFAQs();
            } else {
                toast.error(result.message || 'Xóa thất bại');
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setDeleteTarget(null);
        }
    };

    const openCreateModal = () => {
        setEditingItem(null);
        setFormData({
            question: '',
            answer: '',
            category: 'general',
            order: faqs.length,
            isActive: true
        });
        setShowModal(true);
    };

    const openEditModal = (faq: IFAQ) => {
        setEditingItem(faq);
        setFormData({
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            order: faq.order,
            isActive: faq.isActive
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingItem(null);
    };

    if (loading && faqs.length === 0) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trung tâm hỗ trợ</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Quản lý câu hỏi thường gặp</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus size={18} />
                    Thêm câu hỏi
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm câu hỏi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-black dark:border-gray-700"
                    />
                </div>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border rounded-lg bg-white dark:bg-black dark:border-gray-700"
                >
                    <option value="all">Tất cả danh mục</option>
                    {FAQ_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>

            {/* FAQ List */}
            <div className="bg-white dark:bg-[#1c1c1c] rounded-xl shadow-sm border overflow-hidden">
                {faqs.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Chưa có câu hỏi nào</p>
                        <button
                            onClick={openCreateModal}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Thêm câu hỏi đầu tiên
                        </button>
                    </div>
                ) : (
                    <div className="divide-y">
                        {faqs.map((faq, idx) => (
                            <div key={faq._id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-sm text-gray-400">#{idx + 1}</span>
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">
                                                {FAQ_CATEGORIES.find(c => c.id === faq.category)?.name || faq.category}
                                            </span>
                                            {faq.isActive ? (
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-lg text-xs">Hiển thị</span>
                                            ) : (
                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-lg text-xs">Ẩn</span>
                                            )}
                                        </div>
                                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                                            {faq.question}
                                        </h3>
                                        <div
                                            className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2"
                                            dangerouslySetInnerHTML={{ __html: faq.answer }}
                                        />
                                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                                            <span>👁 {faq.views} lượt xem</span>
                                            <span>👍 {faq.helpful} hữu ích</span>
                                            <span>👎 {faq.notHelpful} không hữu ích</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => openEditModal(faq)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteTarget(faq)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal - giữ nguyên */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeModal}>
                    <div className="bg-white dark:bg-[#1c1c1c] rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white dark:bg-[#1c1c1c] p-5 border-b flex justify-between items-center">
                            <h2 className="text-xl font-semibold">
                                {editingItem ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}
                            </h2>
                            <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium mb-2">Câu hỏi *</label>
                                <input
                                    type="text"
                                    value={formData.question}
                                    onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                                    placeholder="Nhập câu hỏi..."
                                    className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-black"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Danh mục</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-black"
                                >
                                    {FAQ_CATEGORIES.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Câu trả lời *</label>
                                <div className="border rounded-lg overflow-hidden">
                                    <TinyMCEEditor
                                        value={formData.answer}
                                        onChange={(val) => setFormData(prev => ({ ...prev, answer: val }))}
                                        height={300}
                                        placeholder="Nhập câu trả lời..."
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                        className="w-4 h-4 rounded"
                                    />
                                    <span className="text-sm">Hiển thị công khai</span>
                                </label>

                                <div>
                                    <label className="text-sm mr-2">Thứ tự:</label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                                        className="w-20 px-2 py-1 border rounded-lg text-center"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white dark:bg-[#1c1c1c] p-5 border-t flex gap-3">
                            <button
                                onClick={closeModal}
                                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 size={18} className="animate-spin mx-auto" /> : (editingItem ? 'Cập nhật' : 'Thêm mới')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Delete */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Xóa câu hỏi"
                message={`Bạn có chắc chắn muốn xóa câu hỏi "${deleteTarget?.question}"?`}
                confirmText="Xóa"
                cancelText="Hủy"
            />
        </div>
    );
}