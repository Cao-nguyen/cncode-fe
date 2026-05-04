// app/(user)/(public)/faq/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/providers/socket.provider';
import { faqApi, IFaqQuestion, IFaqStats } from '@/lib/api/faq.api';
import { Loader2, Search, X, MessageCircle, Heart, ThumbsUp, ThumbsDown, ChevronRight, Bot, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import CustomSelect from '@/components/custom/CustomSelect';
import CustomInput from '@/components/custom/CustomInput';
import CustomTextarea from '@/components/custom/CustomTextarea';

const CATEGORIES = [
    { value: 'all', label: 'Tất cả' },
    { value: 'general', label: 'Chung' },
    { value: 'technical', label: 'Kỹ thuật' },
    { value: 'account', label: 'Tài khoản' },
    { value: 'payment', label: 'Thanh toán' },
    { value: 'course', label: 'Khóa học' },
    { value: 'other', label: 'Khác' }
];

const STATUS_FILTERS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'answered', label: 'Đã trả lời' },
    { value: 'resolved', label: 'Đã giải quyết' }
];

function formatTime(date: string) {
    const now = new Date();
    const created = new Date(date);
    const diffHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Vừa xong';
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffHours < 48) return '1 ngày trước';
    if (diffHours < 168) return `${Math.floor(diffHours / 24)} ngày trước`;
    return format(created, 'dd/MM/yyyy', { locale: vi });
}

function QuestionCard({ question, onHelpful, onLikeAnswer }: {
    question: IFaqQuestion;
    onHelpful: (id: string, helpful: boolean) => void;
    onLikeAnswer: (questionId: string, answerId: string) => void;
}) {
    const { user } = useAuthStore();
    const [helpful, setHelpful] = useState(false);
    const [notHelpful, setNotHelpful] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const bestAnswer = question.answers?.find(a => a.isBest);
    const aiAnswer = question.answers?.find(a => a.isAiGenerated);
    const displayAnswer = bestAnswer || aiAnswer || question.answers?.[0];

    const handleHelpful = () => {
        if (!user) {
            toast.error('Vui lòng đăng nhập để đánh giá');
            return;
        }
        setHelpful(true);
        onHelpful(question._id, true);
    };

    const handleNotHelpful = () => {
        if (!user) {
            toast.error('Vui lòng đăng nhập để đánh giá');
            return;
        }
        setNotHelpful(true);
        onHelpful(question._id, false);
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-main/10 overflow-hidden flex-shrink-0">
                            {question.userId?.avatar ? (
                                <Image src={question.userId.avatar} alt="" width={40} height={40} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-main font-semibold">
                                    {question.userId?.fullName?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">
                                {question.userId?.fullName || 'Người dùng'}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-gray-400">{formatTime(question.createdAt)}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
                                    {CATEGORIES.find(c => c.value === question.category)?.label || 'Chung'}
                                </span>
                                {question.status === 'resolved' && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Đã giải quyết</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <Link href={`/faq/${question._id}`} className="text-main hover:underline text-sm flex items-center gap-1">
                        Chi tiết <ChevronRight size={14} />
                    </Link>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {question.title}
                </h3>

                {/* Content preview */}
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3 line-clamp-2">
                    {question.content.length > 150 ? `${question.content.substring(0, 150)}...` : question.content}
                </p>

                {/* Answer preview */}
                {displayAnswer && (
                    <div className={`mt-3 p-3 rounded-lg ${displayAnswer.isAiGenerated ? 'bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800' : 'bg-gray-50 dark:bg-gray-800'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            {displayAnswer.isAiGenerated ? (
                                <>
                                    <Bot size={16} className="text-purple-500" />
                                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400">AI trả lời</span>
                                </>
                            ) : (
                                <span className="text-xs font-medium text-gray-500">Câu trả lời</span>
                            )}
                            {displayAnswer.isBest && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Hay nhất</span>
                            )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {displayAnswer.content}
                        </p>
                    </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                        <MessageCircle size={14} />
                        <span>{question.answerCount || 0} câu trả lời</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                        <Heart size={14} />
                        <span>{question.helpful || 0} hữu ích</span>
                    </div>
                </div>

                {/* Helpful buttons */}
                {!expanded && (
                    <div className="flex items-center gap-3 mt-3 pt-2">
                        <button
                            onClick={handleHelpful}
                            disabled={helpful || notHelpful}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition ${helpful ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-700'}`}
                        >
                            <ThumbsUp size={12} />
                            Hữu ích
                        </button>
                        <button
                            onClick={handleNotHelpful}
                            disabled={helpful || notHelpful}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition ${notHelpful ? 'bg-red-100 text-red-700' : 'bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-700'}`}
                        >
                            <ThumbsDown size={12} />
                            Không hữu ích
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// Create Question Modal
function CreateQuestionModal({ isOpen, onClose, onSubmit }: any) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('general');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            toast.warning('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        setSubmitting(true);
        await onSubmit(title, content, category);
        setTitle('');
        setContent('');
        setCategory('general');
        setSubmitting(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="sticky top-0 bg-white dark:bg-gray-900 p-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Đặt câu hỏi</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
                        <X size={20} data-filled={true} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Danh mục</label>
                        <CustomSelect
                            value={category}
                            onChange={setCategory}
                            options={CATEGORIES.filter(c => c.value !== 'all')}
                            placeholder="Chọn danh mục"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Tiêu đề</label>
                        <CustomInput
                            value={title}
                            onChange={setTitle}
                            placeholder="Tóm tắt vấn đề bạn cần hỏi..."
                            maxLength={200}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Nội dung</label>
                        <CustomTextarea
                            value={content}
                            onChange={setContent}
                            placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                            rows={6}
                            maxLength={2000}
                        />
                    </div>
                    <div className="flex gap-3 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-2.5 bg-main text-white rounded-xl font-medium hover:bg-main/80 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus size={16} />}
                            {submitting ? 'Đang gửi...' : 'Gửi câu hỏi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function FAQPage() {
    const { token, user } = useAuthStore();
    const { socket, isConnected } = useSocket();
    const [questions, setQuestions] = useState<IFaqQuestion[]>([]);
    const [stats, setStats] = useState<IFaqStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [refetchKey, setRefetchKey] = useState(0);

    const fetchQuestions = useCallback(async () => {
        try {
            setLoading(true);
            const result = await faqApi.getQuestions(page, 10, selectedCategory, selectedStatus, search);
            if (result.success && result.data) {
                setQuestions(result.data as IFaqQuestion[]);
                if (result.pagination) setTotalPages(result.pagination.totalPages);
                if (result.stats) setStats(result.stats);
            }
        } catch (error) {
            console.error('Fetch questions error:', error);
        } finally {
            setLoading(false);
        }
    }, [page, selectedCategory, selectedStatus, search]);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions, refetchKey]);

    // Socket listeners
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleNewQuestion = (newQuestion: IFaqQuestion) => {
            setQuestions(prev => [newQuestion, ...prev]);
            fetchQuestions();
        };

        const handleNewAnswer = (data: { questionId: string; question: IFaqQuestion }) => {
            setQuestions(prev => prev.map(q => q._id === data.questionId ? data.question : q));
            fetchQuestions();
        };

        const handleBestAnswer = (data: { questionId: string; question: IFaqQuestion }) => {
            setQuestions(prev => prev.map(q => q._id === data.questionId ? data.question : q));
        };

        socket.on('faq_question_created', handleNewQuestion);
        socket.on('faq_new_answer', handleNewAnswer);
        socket.on('faq_best_answer', handleBestAnswer);

        return () => {
            socket.off('faq_question_created', handleNewQuestion);
            socket.off('faq_new_answer', handleNewAnswer);
            socket.off('faq_best_answer', handleBestAnswer);
        };
    }, [socket, isConnected, fetchQuestions]);

    const handleCreateQuestion = async (title: string, content: string, category: string) => {
        if (!token) {
            toast.error('Vui lòng đăng nhập để đặt câu hỏi');
            return;
        }
        const result = await faqApi.createQuestion(token, { title, content, category });
        if (result.success) {
            toast.success(result.message);
            setRefetchKey(prev => prev + 1);
        } else {
            toast.error(result.message || 'Gửi câu hỏi thất bại');
        }
    };

    const handleHelpful = async (questionId: string, helpful: boolean) => {
        if (!token) return;
        await faqApi.markHelpful(token, questionId, helpful);
    };

    const handleSearch = () => {
        setSearch(searchInput);
        setPage(1);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hỏi đáp & Giải đáp</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Hỏi bất cứ điều gì về lập trình, AI sẽ trả lời bạn ngay lập tức!
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mb-6">
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
                    <div className="text-xs text-gray-500">Chờ trả lời</div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Tìm kiếm câu hỏi..."
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-main"
                        />
                    </div>
                </div>
                <div className="w-40">
                    <CustomSelect
                        value={selectedCategory}
                        onChange={setSelectedCategory}
                        options={CATEGORIES}
                        placeholder="Danh mục"
                    />
                </div>
                <div className="w-40">
                    <CustomSelect
                        value={selectedStatus}
                        onChange={setSelectedStatus}
                        options={STATUS_FILTERS}
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

            {/* Ask Button */}
            <div className="flex justify-end mb-6">
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-main to-main/80 text-white rounded-xl hover:shadow-lg transition-all"
                >
                    <Plus size={18} />
                    <span>Đặt câu hỏi mới</span>
                </button>
            </div>

            {/* Questions List */}
            {loading && page === 1 ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-main" />
                </div>
            ) : questions.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200">
                    <MessageCircle size={48} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">Chưa có câu hỏi nào</p>
                    <p className="text-sm text-gray-400 mt-1">Hãy là người đầu tiên đặt câu hỏi!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {questions.map(question => (
                        <QuestionCard key={question._id} question={question} onHelpful={handleHelpful} onLikeAnswer={() => { }} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
                    >
                        Trước
                    </button>
                    <span className="px-3 py-1">
                        {page} / {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
                    >
                        Sau
                    </button>
                </div>
            )}

            {/* Create Modal */}
            <CreateQuestionModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateQuestion}
            />
        </div>
    );
}