
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Eye, MessageCircle, Heart, Clock, Search,
    Lock, CheckCircle, Trash2, Edit,
    ChevronLeft, ChevronRight, ShieldCheck,
    BarChart3, FileQuestion, X, Plus, Award
} from 'lucide-react';
import { faqApi, getErrorMessage } from '@/lib/api/faq.api';
import { Question, StatisticsData, Answer } from '@/types/faq.type';
import CustomEditor, { CustomEditorRef } from '@/components/custom/CustomEditor';
import StaticContent from '@/components/common/StaticContent';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomInputSearch } from '@/components/custom/CustomInputSearch';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import { DashboardCard } from '@/components/custom/DashboardCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/utils/imageUrl';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const GRADE_LABELS: Record<string, string> = {
    grade10: 'Tin học 10',
    grade11: 'Tin học 11',
    grade12: 'Tin học 12',
    other: 'Khác',
};

const GRADE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
const STATUS_OPTIONS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'open', label: 'Chờ trả lời' },
    { value: 'answered', label: 'Đã có câu trả lời' },
    { value: 'solved', label: 'Đã giải đáp' },
];

interface GradeStat { _id: string; count: number; }
interface MonthlyStat { _id: number; count: number; }

const ViewQuestionModal = ({ isOpen, onClose, question }: { isOpen: boolean; onClose: () => void; question: Question | null }) => {
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAnswers = useCallback(async () => {
        if (!question) return;
        setLoading(true);
        try {
            const res = await faqApi.getQuestionBySlug(question.slug);
            if (res.success) setAnswers(res.data.answers);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    }, [question]);

    useEffect(() => {
        if (isOpen && question) fetchAnswers();
    }, [isOpen, question, fetchAnswers]);

    const handleDeleteAnswer = async (answerId: string) => {
        try {
            setAnswers(prev => prev.filter(a => a._id !== answerId));
            await faqApi.deleteAnswer(answerId);
            toast.success('Đã xóa câu trả lời');
        } catch (error) {
            toast.error(getErrorMessage(error));
            fetchAnswers();
        }
    };

    if (!isOpen || !question) return null;
    const formatDate = (date: string) => new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const displayName = question.isAnonymous ? 'Ẩn danh' : question.userId?.fullName || 'Người dùng';

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
                <div className="bg-[var(--cn-bg-card)] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between p-5 border-b border-[var(--cn-border)] sticky top-0 bg-[var(--cn-bg-card)] z-10">
                        <h2 className="text-lg font-bold text-[var(--cn-text-main)]">Chi tiết câu hỏi</h2>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--cn-hover)]"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="p-6">
                        <div className="mb-8 pb-6 border-b border-[var(--cn-border)]">
                            <div className="flex items-center gap-3 mb-4">
                                <Avatar className="w-12 h-12 border-2 border-gray-200">
                                    {!question.isAnonymous && question.userId?.avatar ? <AvatarImage src={getImageUrl(question.userId.avatar)} /> : null}
                                    <AvatarFallback className={question.isAnonymous ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white font-bold'}>{question.isAnonymous ? '?' : displayName.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold text-[var(--cn-text-main)] text-lg">{displayName}</p>
                                    <p className="text-xs text-[var(--cn-text-muted)]">{formatDate(question.createdAt)}</p>
                                </div>
                            </div>
                            <h3 className="text-2xl font-extrabold text-[var(--cn-text-main)] mb-4 leading-tight">{question.title}</h3>
                            <StaticContent content={question.content} className="mb-5" />
                            <div className="flex items-center gap-4 text-xs font-bold text-[var(--cn-text-muted)]">
                                <div className="flex items-center gap-1.5 bg-[var(--cn-bg-section)] px-3 py-1.5 rounded-full"><Eye className="w-3.5 h-3.5" /><span>{question.viewCount}</span></div>
                                <div className="flex items-center gap-1.5 bg-[var(--cn-bg-section)] px-3 py-1.5 rounded-full"><MessageCircle className="w-3.5 h-3.5" /><span>{answers.length}</span></div>
                                <div className="flex items-center gap-1.5 bg-[var(--cn-bg-section)] px-3 py-1.5 rounded-full text-red-500"><Heart className="w-3.5 h-3.5" /><span>{question.likeCount}</span></div>
                            </div>
                        </div>

                        <h4 className="font-bold text-[var(--cn-text-main)] mb-4 flex items-center gap-2"><MessageCircle className="w-4 h-4 text-blue-500" />Câu trả lời ({answers.length})</h4>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="p-5 rounded-2xl border border-[var(--cn-border)] bg-white">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                                <div className="h-3 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : answers.length === 0 ? (
                                <p className="text-center text-[var(--cn-text-muted)] py-10 bg-[var(--cn-bg-section)] rounded-xl italic">Chưa có câu trả lời nào</p>
                            ) : (
                                answers.map((answer) => (
                                    <div key={answer._id} className={`p-5 rounded-2xl border transition-all ${answer.isBestAnswer ? 'border-green-500 bg-green-50/20' : 'border-[var(--cn-border)] bg-white'}`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm text-[var(--cn-text-main)]">{answer.userId?.fullName}</span>
                                                {answer.userId?.role === 'admin' && <Badge className="bg-purple-100 text-purple-700 border-none text-[10px]">Admin</Badge>}
                                                {answer.isBestAnswer && <Badge className="bg-green-100 text-green-700 border-none text-[10px] font-bold">Hữu ích nhất</Badge>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleDeleteAnswer(answer._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                                                <span className="text-[10px] text-[var(--cn-text-muted)]">{formatDate(answer.createdAt)}</span>
                                            </div>
                                        </div>
                                        <StaticContent content={answer.content} className="mb-3" />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const AnswerQuestionModal = ({ isOpen, onClose, question, onSuccess }: { isOpen: boolean; onClose: () => void; question: Question | null; onSuccess: () => void }) => {
    const editorRef = useRef<CustomEditorRef>(null);
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen || !question) return null;

    const handleSubmit = async () => {
        const content = editorRef.current?.getContent() || '';
        if (!content.trim() || content === '<p><br></p>') { toast.error('Vui lòng nhập nội dung'); return; }
        setSubmitting(true);
        try {
            await faqApi.createAnswer({ questionId: question._id, content });
            toast.success('Đã gửi câu trả lời');
            onSuccess();
            onClose();
        } catch (error) { toast.error(getErrorMessage(error)); }
        finally { setSubmitting(false); }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div key={question._id} className="bg-[var(--cn-bg-card)] rounded-2xl w-full max-w-2xl shadow-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-[var(--cn-border)] sticky top-0 bg-[var(--cn-bg-card)] z-10">
                    <h2 className="text-lg font-bold text-[var(--cn-text-main)]">Gửi câu trả lời</h2>
                    <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-[var(--cn-hover)]"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-3 bg-[var(--cn-bg-section)] border-b border-[var(--cn-border)]">
                    <p className="text-[10px] font-bold text-[var(--cn-text-muted)] uppercase mb-0.5">Câu hỏi:</p>
                    <p className="font-medium text-[var(--cn-text-main)] line-clamp-2 text-sm">{question.title}</p>
                </div>
                <div className="p-6">
                    <CustomEditor ref={editorRef} />
                    <div className="flex justify-end gap-3 mt-6">
                        <CustomButton variant="secondary" onClick={onClose}>Hủy bỏ</CustomButton>
                        <CustomButton onClick={handleSubmit} loading={submitting}>Xác nhận trả lời</CustomButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminQuestionRow = ({
    question,
    onView,
    onAnswer,
    onToggleLock,
    onDelete
}: {
    question: Question;
    onView: (q: Question) => void;
    onAnswer: (q: Question) => void;
    onToggleLock: (id: string) => void;
    onDelete: (q: Question) => void;
}) => {
    const getStatusLabel = () => {
        if (question.isLocked) return 'Đã khóa';
        if (question.isSolved) return 'Đã giải';
        if (question.answerCount > 0) return 'Đã trả lời';
        return 'Chờ xử lý';
    };
    const getStatusColor = () => {
        if (question.isLocked) return 'bg-gray-100 text-gray-700';
        if (question.isSolved) return 'bg-green-100 text-green-700';
        if (question.answerCount > 0) return 'bg-blue-100 text-blue-700';
        return 'bg-amber-100 text-amber-700';
    };

    return (
        <tr className="hover:bg-[var(--cn-hover)] transition-colors group">
            <td className="px-5 py-4">
                <div className="max-w-md">
                    <p className="font-bold text-[var(--cn-text-main)] line-clamp-1">{question.title}</p>
                    <p className="text-[10px] font-bold text-[var(--cn-text-muted)] mt-1 uppercase">{GRADE_LABELS[question.grade]}</p>
                </div>
            </td>
            <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8 border border-white shadow-sm border-2 border-gray-200">
                        {!question.isAnonymous && question.userId?.avatar ? <AvatarImage src={getImageUrl(question.userId.avatar)} /> : null}
                        <AvatarFallback className="bg-[var(--cn-primary)]/10 text-[10px] font-bold">
                            {question.isAnonymous ? '?' : question.userId?.fullName?.charAt(0) || '?'}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-[var(--cn-text-main)]">
                        {question.isAnonymous ? 'Ẩn danh' : question.userId?.fullName || '?'}
                    </span>
                </div>
            </td>
            <td className="px-5 py-4 text-center">
                <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase ${getStatusColor()}`}>
                    {getStatusLabel()}
                </span>
            </td>
            <td className="px-5 py-4 text-center font-bold text-slate-400 text-sm">{question.viewCount}</td>
            <td className="px-5 py-4 text-center font-bold text-[var(--cn-primary)] text-sm">{question.answerCount}</td>
            <td className="px-5 py-4 text-center">
                <div className="flex items-center justify-center gap-1">
                    <button onClick={() => onView(question)} className="p-2 rounded-xl text-blue-500 hover:bg-blue-50 transition-all"><Eye size={16} /></button>
                    <button onClick={() => onAnswer(question)} className="p-2 rounded-xl text-green-600 hover:bg-green-50 transition-all"><MessageCircle size={16} /></button>
                    <button onClick={() => onToggleLock(question._id)} className={`p-2 rounded-xl transition-all ${question.isLocked ? 'text-red-500 bg-red-50' : 'text-slate-400 hover:bg-slate-100'}`}><Lock size={16} /></button>
                    <button onClick={() => onDelete(question)} className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={16} /></button>
                </div>
            </td>
        </tr>
    );
};

export default function AdminFAQPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [statistics, setStatistics] = useState<StatisticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState('all');
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [viewModal, setViewModal] = useState<{ open: boolean; question: Question | null }>({ open: false, question: null });
    const [answerModal, setAnswerModal] = useState<{ open: boolean; question: Question | null }>({ open: false, question: null });
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; question: Question | null }>({ open: false, question: null });

    const fetchStatistics = async () => {
        try {
            const res = await faqApi.getStatistics();
            if (res.success && res.data) setStatistics(res.data);
        } catch (error) { console.error(error); }
    };

    const fetchQuestions = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const res = await faqApi.getQuestions({
                page,
                limit: 15,
                status: status !== 'all' ? status : undefined,
                search: searchTerm || undefined
            });
            setQuestions(res.questions || []);
            setTotalPages(res.totalPages || 1);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    }, [page, status, searchTerm]);

    useEffect(() => { fetchStatistics(); }, []);
    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => { setSearchTerm(searchInput); setPage(1); }, 500);
        return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
    }, [searchInput]);

    useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

    const handleToggleLock = async (id: string) => {
        try {
            await faqApi.toggleLockQuestion(id);
            toast.success('Đã cập nhật trạng thái');
            fetchQuestions(true);
        } catch (error) { toast.error(getErrorMessage(error)); }
    };

    const handleDelete = async () => {
        if (!deleteModal.question) return;
        try {
            await faqApi.deleteQuestion(deleteModal.question._id);
            toast.success('Đã xóa câu hỏi');
            setDeleteModal({ open: false, question: null });
            fetchQuestions(true);
            fetchStatistics();
        } catch (error) { toast.error(getErrorMessage(error)); }
    };

    const gradeChartData = statistics?.gradeStats?.map((item: GradeStat) => ({
        name: GRADE_LABELS[item._id] || item._id,
        value: item.count
    })) || [];
    const monthlyChartData = statistics?.monthlyStats?.map((item: MonthlyStat) => ({
        name: `Tháng ${item._id}`,
        "câu hỏi": item.count
    })) || [];

    return (
        <div className="space-y-6 pb-8 px-3 sm:px-4">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Quản lý hỏi đáp</h1>
                <p className="text-sm text-gray-500 mt-1">Quản lý câu hỏi và câu trả lời</p>
            </div>

            {statistics && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <DashboardCard title="Tổng câu hỏi" value={statistics.totalQuestions} icon={<FileQuestion size={18} />} iconBgColor="#EFF6FF" iconColor="#3B82F6" />
                    <DashboardCard title="Đã trả lời" value={statistics.answeredQuestions} icon={<CheckCircle size={18} />} iconBgColor="#F0FDF4" iconColor="#22C55E" />
                    <DashboardCard title="Chờ xử lý" value={statistics.pendingQuestions} icon={<Clock size={18} />} iconBgColor="#FFF7ED" iconColor="#F97316" />
                    <DashboardCard title="Câu trả lời" value={statistics.totalAnswers} icon={<MessageCircle size={18} />} iconBgColor="#F5F3FF" iconColor="#8B5CF6" />
                    <DashboardCard title="Tương tác" value={statistics.totalLikes} icon={<Heart size={18} />} iconBgColor="#FDF2F8" iconColor="#EC4899" />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[var(--cn-bg-card)] rounded-2xl border border-[var(--cn-border)] p-6 shadow-sm">
                    <h3 className="font-bold text-[var(--cn-text-main)] mb-6 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-500" /> Xu hướng tháng</h3>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                <Bar dataKey="câu hỏi" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-[var(--cn-bg-card)] rounded-2xl border border-[var(--cn-border)] p-6 shadow-sm">
                    <h3 className="font-bold text-[var(--cn-text-main)] mb-6 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-500" /> Khối lớp</h3>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={gradeChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} stroke="none">
                                    {gradeChartData.map((_entry, index) => <Cell key={`cell-${index}`} fill={GRADE_COLORS[index % GRADE_COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-[var(--cn-border)] flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[280px]">
                    <CustomInputSearch placeholder="Tìm câu hỏi..." value={searchInput} onChange={setSearchInput} size="medium" />
                </div>
                <div className="w-48">
                    <CustomSelect options={STATUS_OPTIONS} value={status} onChange={setStatus} placeholder="Trạng thái" />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative">
                {loading && (
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-50 overflow-hidden z-20">
                        <div className="h-full bg-blue-500 animate-[loading_1s_infinite_linear]" style={{ width: '40%' }} />
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className={`w-full transition-opacity duration-200 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                        <thead className="bg-[var(--cn-bg-section)] border-b border-[var(--cn-border)]">
                            <tr className="text-[11px] font-bold text-[var(--cn-text-muted)] uppercase tracking-wider">
                                <th className="px-5 py-4 text-left">Nội dung câu hỏi</th>
                                <th className="px-5 py-4 text-left">Tác giả</th>
                                <th className="px-5 py-4 text-center w-[120px]">Trạng thái</th>
                                <th className="px-5 py-4 text-center w-[80px]">Xem</th>
                                <th className="px-5 py-4 text-center w-[80px]">Trả lời</th>
                                <th className="px-5 py-4 text-center w-[140px]">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--cn-border)]">
                            {questions.length === 0 && !loading ? (
                                <tr><td colSpan={6} className="py-20 text-center text-slate-400 italic font-medium">Không tìm thấy câu hỏi nào</td></tr>
                            ) : (
                                questions.map((q) => (
                                    <AdminQuestionRow
                                        key={q._id}
                                        question={q}
                                        onView={(question: Question) => setViewModal({ open: true, question })}
                                        onAnswer={(question: Question) => setAnswerModal({ open: true, question })}
                                        onToggleLock={handleToggleLock}
                                        onDelete={(question: Question) => setDeleteModal({ open: true, question })}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-between items-center px-6 py-4 border-t border-[var(--cn-border)] bg-slate-50/50">
                        <span className="text-xs font-bold text-slate-400 uppercase">Trang {page} / {totalPages}</span>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border rounded-xl bg-white disabled:opacity-30"><ChevronLeft size={16} /></button>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 border rounded-xl bg-white disabled:opacity-30"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                )}
            </div>
            <ViewQuestionModal
                key={`v-${viewModal.question?._id}`}
                isOpen={viewModal.open}
                onClose={() => setViewModal({ open: false, question: null })}
                question={viewModal.question}
            />
            <AnswerQuestionModal
                key={`a-${answerModal.question?._id}`}
                isOpen={answerModal.open}
                onClose={() => setAnswerModal({ open: false, question: null })}
                question={answerModal.question}
                onSuccess={() => { fetchQuestions(true); fetchStatistics(); }}
            />
            <ConfirmModalDelete
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, question: null })}
                onConfirm={handleDelete}
                title="Xóa câu hỏi"
                message={`Xóa câu hỏi "${deleteModal.question?.title}"?`}
            />

            <style jsx global>{`
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(300%); }
                }
            `}</style>
        </div>
    );
}
