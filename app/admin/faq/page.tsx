
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
import { ImagePreviewModal } from '@/components/custom/ImagePreviewModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
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

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) => (
    <div className="bg-[var(--cn-bg-card)] rounded-xl p-4 border border-[var(--cn-border)] hover:shadow-md transition-all">
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>{icon}</div>
            <div>
                <p className="text-2xl font-bold text-[var(--cn-text-main)]">{value.toLocaleString()}</p>
                <p className="text-[10px] uppercase font-bold text-[var(--cn-text-muted)] tracking-wider">{label}</p>
            </div>
        </div>
    </div>
);

const ViewQuestionModal = ({ isOpen, onClose, question }: { isOpen: boolean; onClose: () => void; question: Question | null }) => {
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

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
                                <Avatar className="w-12 h-12 border-2 border-[var(--cn-primary)]/10">
                                    {!question.isAnonymous && question.userId?.avatar ? <AvatarImage src={question.userId.avatar} /> : null}
                                    <AvatarFallback className={question.isAnonymous ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white font-bold'}>{question.isAnonymous ? '?' : displayName.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold text-[var(--cn-text-main)] text-lg">{displayName}</p>
                                    <p className="text-xs text-[var(--cn-text-muted)]">{formatDate(question.createdAt)}</p>
                                </div>
                            </div>
                            <h3 className="text-2xl font-extrabold text-[var(--cn-text-main)] mb-4 leading-tight">{question.title}</h3>
                            <div onClick={(e) => { const t = e.target as HTMLElement; if (t.tagName === 'IMG') setPreviewImage(t.getAttribute('src')); }}>
                                <StaticContent content={question.content} className="mb-5" />
                            </div>
                            <div className="flex items-center gap-4 text-xs font-bold text-[var(--cn-text-muted)]">
                                <div className="flex items-center gap-1.5 bg-[var(--cn-bg-section)] px-3 py-1.5 rounded-full"><Eye className="w-3.5 h-3.5" /><span>{question.viewCount}</span></div>
                                <div className="flex items-center gap-1.5 bg-[var(--cn-bg-section)] px-3 py-1.5 rounded-full"><MessageCircle className="w-3.5 h-3.5" /><span>{answers.length}</span></div>
                                <div className="flex items-center gap-1.5 bg-[var(--cn-bg-section)] px-3 py-1.5 rounded-full text-red-500"><Heart className="w-3.5 h-3.5" /><span>{question.likeCount}</span></div>
                            </div>
                        </div>

                        <h4 className="font-bold text-[var(--cn-text-main)] mb-4 flex items-center gap-2"><MessageCircle className="w-4 h-4 text-blue-500" />Câu trả lời ({answers.length})</h4>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="py-12 text-center"><div className="w-8 h-8 border-4 border-[var(--cn-primary)] border-t-transparent rounded-full animate-spin mx-auto" /></div>
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
                                        <div onClick={(e) => { const t = e.target as HTMLElement; if (t.tagName === 'IMG') setPreviewImage(t.getAttribute('src')); }}><StaticContent content={answer.content} className="mb-3" /></div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ImagePreviewModal src={previewImage} isOpen={!!previewImage} onClose={() => setPreviewImage(null)} />
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
                    <Avatar className="w-8 h-8 border border-white shadow-sm">
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
        <div className="min-h-screen p-6 space-y-6 bg-[var(--cn-bg-main)]">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-[var(--cn-primary)]" />
                    <h1 className="text-3xl font-extrabold text-[var(--cn-text-main)] tracking-tight">Quản lý hỏi đáp</h1>
                </div>

                {statistics && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <StatCard icon={<FileQuestion size={20} className="text-blue-600" />} label="Tổng câu hỏi" value={statistics.totalQuestions} color="bg-blue-50 border border-blue-100" />
                        <StatCard icon={<CheckCircle size={20} className="text-green-600" />} label="Đã trả lời" value={statistics.answeredQuestions} color="bg-green-50 border border-green-100" />
                        <StatCard icon={<Clock size={20} className="text-amber-600" />} label="Chờ xử lý" value={statistics.pendingQuestions} color="bg-amber-50 border border-amber-100" />
                        <StatCard icon={<MessageCircle size={20} className="text-purple-600" />} label="Câu trả lời" value={statistics.totalAnswers} color="bg-purple-50 border border-purple-100" />
                        <StatCard icon={<Heart size={20} className="text-red-600" />} label="Tương tác" value={statistics.totalLikes} color="bg-red-50 border border-red-100" />
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

                <div className="bg-white rounded-2xl shadow-sm border border-[var(--cn-border)] overflow-hidden relative">
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
