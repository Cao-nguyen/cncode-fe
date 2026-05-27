
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, MessageCircle, Heart, Clock, Search, Sparkles, PlusCircle, FileQuestion, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { faqApi, getErrorMessage } from '@/lib/api/faq.api';
import { Question, StatisticsData } from '@/types/faq.type';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const GRADE_LABELS: Record<string, string> = {
    grade10: 'Tin học 10',
    grade11: 'Tin học 11',
    grade12: 'Tin học 12',
    other: 'Khác',
};

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) => (
    <div className="bg-[var(--cn-bg-card)] rounded-xl p-4 border border-[var(--cn-border)] hover:shadow-md transition-all">
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>{icon}</div>
            <div>
                <p className="text-2xl font-bold text-[var(--cn-text-main)]">{value.toLocaleString()}</p>
                <p className="text-xs text-[var(--cn-text-muted)]">{label}</p>
            </div>
        </div>
    </div>
);

const QuestionCard = ({ question, onLike, isLiked }: { question: Question; onLike: (id: string) => void; isLiked: boolean }) => {
    const formatDate = (date: string) => {
        const now = new Date();
        const created = new Date(date);
        const diffMins = Math.floor((now.getTime() - created.getTime()) / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        return `${diffDays} ngày trước`;
    };

    const displayName = question.isAnonymous ? 'Ẩn danh' : question.userId?.fullName || 'Người dùng';
    const gradeVariant = question.grade;

    return (
        <div className="bg-[var(--cn-bg-card)] rounded-xl border border-[var(--cn-border)] p-5 hover:shadow-md transition-all">
            {}
            <div className="flex items-center gap-3 mb-3">
                <Avatar className="w-8 h-8">
                    {!question.isAnonymous && question.userId?.avatar ? (
                        <AvatarImage src={question.userId.avatar} alt={displayName} />
                    ) : null}
                    <AvatarFallback className={question.isAnonymous ? 'bg-gray-200 text-gray-500 text-xs' : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs'}>
                        {question.isAnonymous ? '?' : displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <span className="font-medium text-[var(--cn-text-main)] text-sm">{displayName}</span>
                <Badge variant="secondary" className="text-xs">
                    {GRADE_LABELS[gradeVariant]}
                </Badge>
                <Badge className={`text-xs ${question.isSolved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {question.isSolved ? 'Đã giải' : 'Chưa giải'}
                </Badge>
            </div>

            {}
            <Link href={`/faq/${question.slug}`}>
                <h3 className="text-base lg:text-lg font-semibold text-[var(--cn-text-main)] hover:text-[var(--cn-primary)] transition-colors line-clamp-1 mb-3">
                    {question.title}
                </h3>
            </Link>

            {}
            <div className="flex items-center gap-5 text-sm">
                <div className="flex items-center gap-1.5 text-[var(--cn-text-muted)] group cursor-default">
                    <div className="p-1 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                    </div>
                    <span>{question.viewCount.toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-1.5 text-[var(--cn-text-muted)] group cursor-default">
                    <div className="p-1 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors">
                        <MessageCircle className="w-3.5 h-3.5" />
                    </div>
                    <span>{question.answerCount}</span>
                </div>

                <button
                    onClick={() => onLike(question._id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 ${isLiked
                        ? 'bg-red-50 text-red-500'
                        : 'bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500'
                        }`}
                >
                    <Heart
                        className={`w-4 h-4 transition-all duration-300 ${isLiked ? 'scale-110' : ''}`}
                        data-filled={isLiked ? "true" : "false"}
                        fill={isLiked ? "currentColor" : "none"}
                    />
                    <span className="font-medium">
                        {isLiked ? 'Đã hữu ích' : 'Hữu ích'}
                        {question.likeCount > 0 && ` (${question.likeCount})`}
                    </span>
                </button>

                <div className="flex items-center gap-1.5 text-[var(--cn-text-muted)] ml-auto">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs">{formatDate(question.createdAt)}</span>
                </div>
            </div>
        </div>
    );
};

export default function FAQPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [statistics, setStatistics] = useState<StatisticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [grade, setGrade] = useState('all');
    const [search, setSearch] = useState('');
    const [likedQuestions, setLikedQuestions] = useState<Set<string>>(new Set());

    useEffect(() => { fetchStatistics(); }, []);
    useEffect(() => { fetchQuestions(); }, [page, grade, search]);

    const fetchStatistics = async () => {
        try {
            const res = await faqApi.getStatistics();
            if (res.success && res.data) setStatistics(res.data);
        } catch (error) { console.error(error); }
    };

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const res = await faqApi.getQuestions({
                page,
                limit: 10,
                grade: grade !== 'all' ? grade : undefined,
                search: search || undefined
            });
            setQuestions(res.questions || []);
            setTotalPages(res.totalPages || 1);

            const likedSet = new Set<string>();
            res.questions?.forEach((q: Question) => {
                if (q.userLiked) {
                    likedSet.add(q._id);
                }
            });
            setLikedQuestions(likedSet);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const handleLike = async (id: string) => {
        try {
            const res = await faqApi.toggleLikeQuestion(id);
            if (res.success) {
                setLikedQuestions(prev => {
                    const newSet = new Set(prev);
                    if (res.action === 'added') {
                        newSet.add(id);
                    } else {
                        newSet.delete(id);
                    }
                    return newSet;
                });
                setQuestions(prev => prev.map(q =>
                    q._id === id ? { ...q, likeCount: res.likeCount } : q
                ));
            }
        } catch (error) { console.error(error); }
    };

    const gradeOptions = [
        { value: 'all', label: 'Tất cả' },
        { value: 'grade10', label: 'Tin học 10' },
        { value: 'grade11', label: 'Tin học 11' },
        { value: 'grade12', label: 'Tin học 12' },
        { value: 'other', label: 'Khác' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-[var(--cn-bg-main)] to-[var(--cn-bg-section)] py-8 lg:py-12">
            <div className="container mx-auto px-4 max-w-5xl">
                {}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--cn-primary)]/10 rounded-full mb-4">
                        <Sparkles className="w-4 h-4 text-[var(--cn-primary)]" />
                        <span className="text-xs font-medium text-[var(--cn-primary)]">Hỏi đáp bài tập</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-[var(--cn-text-main)] mb-3">Góc Hỏi Đáp</h1>
                    <p className="text-sm lg:text-base text-[var(--cn-text-sub)]">Gặp khó khăn với bài tập? Đặt câu hỏi và nhận sự trợ giúp từ cộng đồng</p>
                </div>

                {}
                {statistics && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <StatCard icon={<FileQuestion className="w-5 h-5 text-blue-600" />} label="Tổng câu hỏi" value={statistics.totalQuestions} color="bg-blue-100" />
                        <StatCard icon={<CheckCircle className="w-5 h-5 text-green-600" />} label="Đã có câu trả lời" value={statistics.answeredQuestions} color="bg-green-100" />
                        <StatCard icon={<Clock className="w-5 h-5 text-yellow-600" />} label="Chờ trả lời" value={statistics.pendingQuestions} color="bg-yellow-100" />
                        <StatCard icon={<Heart className="w-5 h-5 text-red-600" />} label="Lượt thích" value={statistics.totalLikes} color="bg-red-100" />
                    </div>
                )}

                {}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <CustomInput
                            placeholder="Tìm kiếm câu hỏi..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            icon={<Search className="w-4 h-4" />}
                        />
                    </div>
                    <div className="sm:w-48">
                        <CustomSelect
                            options={gradeOptions}
                            value={grade}
                            onChange={setGrade}
                            placeholder="Chọn lớp"
                        />
                    </div>
                    <Link href="/faq/ask">
                        <CustomButton className="w-full sm:w-auto">
                            <PlusCircle className="w-4 h-4" />
                            Đặt câu hỏi
                        </CustomButton>
                    </Link>
                </div>

                {}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-10 h-10 border-4 border-[var(--cn-primary)] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : questions.length === 0 ? (
                    <div className="text-center py-16 bg-[var(--cn-bg-card)] rounded-xl border border-[var(--cn-border)]">
                        <FileQuestion className="w-16 h-16 mx-auto text-[var(--cn-text-muted)] mb-4 opacity-50" />
                        <p className="text-[var(--cn-text-sub)] mb-4">Chưa có câu hỏi nào</p>
                        <Link href="/faq/ask">
                            <CustomButton>Đặt câu hỏi đầu tiên</CustomButton>
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            {questions.map(q => (
                                <QuestionCard
                                    key={q._id}
                                    question={q}
                                    onLike={handleLike}
                                    isLiked={likedQuestions.has(q._id)}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 border border-[var(--cn-border)] rounded-lg disabled:opacity-50 hover:bg-[var(--cn-hover)]"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="px-4 py-2 text-sm text-[var(--cn-text-main)]">
                                    Trang {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-2 border border-[var(--cn-border)] rounded-lg disabled:opacity-50 hover:bg-[var(--cn-hover)]"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
