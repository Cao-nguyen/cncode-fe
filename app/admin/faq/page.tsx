// app/admin/faq/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/providers/socket.provider';
import { faqApi, IFaqQuestion, IFaqStats } from '@/lib/api/faq.api';
import { Loader2, Search, Filter, MessageCircle, Trash2, Eye, CheckCircle, XCircle, Bot } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import CustomSelect from '@/components/custom/CustomSelect';
import StatusBadge from '@/components/common/StatusBadge';

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'answered', label: 'Đã trả lời' },
    { value: 'resolved', label: 'Đã giải quyết' }
];

const CATEGORY_OPTIONS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'general', label: 'Chung' },
    { value: 'technical', label: 'Kỹ thuật' },
    { value: 'account', label: 'Tài khoản' },
    { value: 'payment', label: 'Thanh toán' },
    { value: 'course', label: 'Khóa học' },
    { value: 'other', label: 'Khác' }
];

export default function AdminFAQPage() {
    const { token } = useAuthStore();
    const { socket, isConnected } = useSocket();
    const [questions, setQuestions] = useState<IFaqQuestion[]>([]);
    const [stats, setStats] = useState<IFaqStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const initialFetchDone = useRef(false);

    const fetchQuestions = useCallback(async () => {
        if (!token) return;

        try {
            setLoading(true);
            const result = await faqApi.getQuestions(page, PAGE_SIZE, selectedCategory, selectedStatus, search);
            if (result.success && result.data) {
                setQuestions(result.data as IFaqQuestion[]);
                if (result.pagination) {
                    setTotalPages(result.pagination.totalPages);
                    setTotal(result.pagination.total);
                }
                if (result.stats) {
                    setStats(result.stats);
                }
            }
        } catch (error) {
            console.error('Fetch questions error:', error);
            toast.error('Có lỗi xảy ra khi tải danh sách');
        } finally {
            setLoading(false);
        }
    }, [token, page, selectedStatus, selectedCategory, search]);

    // Socket realtime
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleNewQuestion = (newQuestion: IFaqQuestion) => {
            if (page === 1) {
                setQuestions(prev => [newQuestion, ...prev]);
                setTotal(prev => prev + 1);
            }
            fetchQuestions();
        };

        const handleNewAnswer = (data: { questionId: string; question: IFaqQuestion }) => {
            setQuestions(prev => prev.map(q => q._id === data.questionId ? data.question : q));
            fetchQuestions();
        };

        const handleQuestionDeleted = (questionId: string) => {
            setQuestions(prev => prev.filter(q => q._id !== questionId));
            setTotal(prev => prev - 1);
            fetchQuestions();
        };

        socket.on('faq_question_created', handleNewQuestion);
        socket.on('faq_new_answer', handleNewAnswer);
        socket.on('faq_question_deleted', handleQuestionDeleted);

        return () => {
            socket.off('faq_question_created', handleNewQuestion);
            socket.off('faq_new_answer', handleNewAnswer);
            socket.off('faq_question_deleted', handleQuestionDeleted);
        };
    }, [socket, isConnected, page, fetchQuestions]);

    useEffect(() => {
        if (token && !initialFetchDone.current) {
            initialFetchDone.current = true;
            fetchQuestions();
        }
    }, [token, fetchQuestions]);

    const handleDeleteQuestion = async (questionId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return;

        try {
            setDeletingId(questionId);
            const result = await faqApi.deleteQuestion(token!, questionId);
            if (result.success) {
                toast.success('Xóa câu hỏi thành công');
                setQuestions(prev => prev.filter(q => q._id !== questionId));
                setTotal(prev => prev - 1);
                if (questions.length === 1 && page > 1) {
                    setPage(page - 1);
                } else {
                    fetchQuestions();
                }
            } else {
                toast.error(result.message || 'Xóa thất bại');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        } finally {
            setDeletingId(null);
        }
    };

    const handleSearch = () => {
        setSearch(searchInput);
        setPage(1);
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'Chờ xử lý';
            case 'answered': return 'Đã trả lời';
            case 'resolved': return 'Đã giải quyết';
            default: return status;
        }
    };

    const getCategoryLabel = (category: string) => {
        const found = CATEGORY_OPTIONS.find(c => c.value === category);
        return found?.label || category;
    };

    return (
        <div className="space-y-6 pb-8 px-3 sm:px-4">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý Hỏi đáp</h1>
                <p className="text-sm text-gray-500 mt-1">Quản lý câu hỏi và câu trả lời từ AI và người dùng</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-3 text-center border border-gray-200">
                    <div className="text-2xl font-bold text-main">{stats?.total || 0}</div>
                    <div className="text-xs text-gray-500">Tổng câu hỏi</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-3 text-center border border-gray-200">
                    <div className="text-2xl font-bold text-blue-500">{stats?.answered || 0}</div>
                    <div className="text-xs text-gray-500">Đã trả lời</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-3 text-center border border-gray-200">
                    <div className="text-2xl font-bold text-green-500">{stats?.resolved || 0}</div>
                    <div className="text-xs text-gray-500">Đã giải quyết</div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-3 text-center border border-gray-200">
                    <div className="text-2xl font-bold text-amber-500">{stats?.pending || 0}</div>
                    <div className="text-xs text-gray-500">Chờ xử lý</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-main"
                        />
                    </div>
                </div>
                <div className="w-40">
                    <CustomSelect
                        value={selectedCategory}
                        onChange={setSelectedCategory}
                        options={CATEGORY_OPTIONS}
                        placeholder="Danh mục"
                    />
                </div>
                <div className="w-40">
                    <CustomSelect
                        value={selectedStatus}
                        onChange={setSelectedStatus}
                        options={STATUS_OPTIONS}
                        placeholder="Trạng thái"
                    />
                </div>
                <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-main text-white rounded-xl hover:bg-main/80 transition"
                >
                    Tìm kiếm
                </button>
            </div>

            {/* Questions Table */}
            <div className="rounded-xl shadow-sm border border-gray-200 overflow-hidden bg-white dark:bg-gray-900">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-4 py-3 text-sm font-semibold">Người dùng</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold">Tiêu đề</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold">Danh mục</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold">Trạng thái</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold">Số câu trả lời</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold">Ngày tạo</th>
                                <th className="text-center px-4 py-3 text-sm font-semibold">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading && questions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-main mx-auto" />
                                    </td>
                                </tr>
                            ) : questions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-gray-500">
                                        Không có câu hỏi nào
                                    </td>
                                </tr>
                            ) : (
                                questions.map((question) => (
                                    <tr key={question._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-main/10 overflow-hidden">
                                                    {question.userId?.avatar ? (
                                                        <Image src={question.userId.avatar} alt="" width={32} height={32} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-main text-xs font-semibold">
                                                            {question.userId?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-sm truncate max-w-[120px]">
                                                    {question.userId?.fullName || 'Người dùng'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium max-w-xs truncate">
                                                {question.title}
                                            </p>
                                            {question.answers?.some(a => a.isAiGenerated) && (
                                                <span className="text-xs text-purple-500 flex items-center gap-1 mt-1">
                                                    <Bot size={10} /> AI đã trả lời
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm">{getCategoryLabel(question.category)}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={question.status} size="sm" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm">{question.answers?.length || 0}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-500 whitespace-nowrap">
                                                {format(new Date(question.createdAt), 'dd/MM/yyyy', { locale: vi })}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    href={`/faq/${question._id}`}
                                                    target="_blank"
                                                    className="p-1.5 text-main hover:bg-main/10 rounded-lg transition"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteQuestion(question._id)}
                                                    disabled={deletingId === question._id}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                                    title="Xóa câu hỏi"
                                                >
                                                    {deletingId === question._id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 size={16} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="border-t border-gray-200 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                            <div className="text-sm text-gray-500">
                                {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, total)} / {total}
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-1.5 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100"
                                >
                                    Trước
                                </button>
                                <span className="px-3 py-1 text-sm">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-1.5 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100"
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}