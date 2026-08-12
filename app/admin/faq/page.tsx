'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Eye, MessageCircle, Heart, Clock, Search, Lock, CheckCircle,
    ChevronLeft, ChevronRight, Trash2, X, FileQuestion, BarChart3, Award,
} from 'lucide-react';
import { faqApi, getErrorMessage } from '@/lib/api/faq.api';
import { Question, FaqStatistics, Answer, GRADE_LABELS } from '@/types/faq.type';
import CustomEditor, { CustomEditorRef } from '@/components/custom/CustomEditor';
import StaticContent from '@/components/common/StaticContent';
import { CustomInputSearch } from '@/components/custom/CustomInputSearch';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import { DashboardCard } from '@/components/custom/DashboardCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/utils/imageUrl';
import { cn } from '@/lib/utils';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const STATUS_OPTIONS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'open', label: 'Chờ trả lời' },
    { value: 'answered', label: 'Đã trả lời' },
    { value: 'solved', label: 'Đã giải' },
    { value: 'locked', label: 'Đã khóa' },
];

const GRADE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

function ModalShell({ open, onClose, title, children, footer, wide }: {
    open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode; wide?: boolean;
}) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className={cn('flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-xl', wide ? 'max-w-3xl' : 'max-w-2xl')} onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b px-5 py-4">
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100"><X className="h-5 w-5" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-5">{children}</div>
                {footer && <div className="border-t px-5 py-4">{footer}</div>}
            </div>
        </div>
    );
}

function ViewQuestionModal({ question, onClose }: { question: Question | null; onClose: () => void }) {
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!question) return;
        setLoading(true);
        faqApi.adminGetQuestionBySlug(question.slug)
            .then((res) => { if (res.success) setAnswers(res.data.answers); })
            .finally(() => setLoading(false));
    }, [question]);

    if (!question) return null;

    return (
        <ModalShell open={!!question} onClose={onClose} title="Chi tiết câu hỏi" wide>
            <h4 className="mb-3 text-xl font-bold text-gray-900">{question.title}</h4>
            <StaticContent content={question.content} className="mb-4" />
            <p className="mb-4 text-sm font-medium text-gray-700">Câu trả lời ({answers.length})</p>
            {loading ? (
                <div className="py-8 text-center text-gray-400">Đang tải...</div>
            ) : answers.length === 0 ? (
                <p className="py-6 text-center text-gray-400 italic">Chưa có câu trả lời</p>
            ) : (
                <div className="space-y-3">
                    {answers.map((a) => (
                        <div key={a._id} className={cn('rounded-xl border p-4', a.isBestAnswer ? 'border-emerald-400 bg-emerald-50/40' : 'border-gray-200')}>
                            <p className="mb-2 text-sm font-semibold">{a.userId?.fullName}</p>
                            <StaticContent content={a.content} compact />
                        </div>
                    ))}
                </div>
            )}
        </ModalShell>
    );
}

function AnswerModal({ question, onClose, onSuccess }: { question: Question | null; onClose: () => void; onSuccess: () => void }) {
    const editorRef = useRef<CustomEditorRef>(null);
    const [submitting, setSubmitting] = useState(false);
    if (!question) return null;

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
        <ModalShell open={!!question} onClose={onClose} title="Trả lời câu hỏi" footer={
            <div className="flex justify-end gap-2">
                <CustomButton variant="secondary" onClick={onClose}>Hủy</CustomButton>
                <CustomButton onClick={handleSubmit} loading={submitting}>Gửi</CustomButton>
            </div>
        }>
            <p className="mb-3 text-sm text-gray-500 line-clamp-2">{question.title}</p>
            <CustomEditor ref={editorRef} />
        </ModalShell>
    );
}

export default function AdminFAQPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [stats, setStats] = useState<FaqStatistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState('all');
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [viewTarget, setViewTarget] = useState<Question | null>(null);
    const [answerTarget, setAnswerTarget] = useState<Question | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);

    useEffect(() => {
        faqApi.adminGetStatistics().then((res) => { if (res.success) setStats(res.data); }).catch(() => {});
    }, []);

    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => { setSearchTerm(searchInput); setPage(1); }, 400);
        return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
    }, [searchInput]);

    const fetchQuestions = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await faqApi.adminGetQuestions({
                page,
                limit: 15,
                status: status !== 'all' ? status : undefined,
                search: searchTerm || undefined,
            });
            setQuestions(res.data || []);
            setTotalPages(res.pagination?.totalPages || 1);
        } catch {
            toast.error('Không thể tải danh sách');
        } finally {
            setLoading(false);
        }
    }, [page, status, searchTerm]);

    useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

    const handleToggleLock = async (id: string) => {
        try {
            await faqApi.adminToggleLock(id);
            toast.success('Đã cập nhật trạng thái khóa');
            fetchQuestions(true);
        } catch (error) { toast.error(getErrorMessage(error)); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await faqApi.adminDeleteQuestion(deleteTarget._id);
            toast.success('Đã xóa câu hỏi');
            setDeleteTarget(null);
            fetchQuestions(true);
            faqApi.adminGetStatistics().then((res) => { if (res.success) setStats(res.data); });
        } catch (error) { toast.error(getErrorMessage(error)); }
    };

    const gradeChartData = stats?.gradeStats?.map((item) => ({
        name: GRADE_LABELS[item._id] || item._id,
        value: item.count,
    })) || [];

    const monthlyChartData = stats?.monthlyStats?.map((item) => ({
        name: `T${item._id}`,
        count: item.count,
    })) || [];

    const statusLabel = (q: Question) => {
        if (q.isLocked) return { label: 'Đã khóa', cls: 'bg-gray-100 text-gray-700' };
        if (q.isSolved) return { label: 'Đã giải', cls: 'bg-emerald-50 text-emerald-700' };
        if (q.answerCount > 0) return { label: 'Đã trả lời', cls: 'bg-blue-50 text-blue-700' };
        return { label: 'Chờ xử lý', cls: 'bg-amber-50 text-amber-700' };
    };

    return (
        <div className="space-y-6 pb-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">Quản lý hỏi đáp</h1>
                <p className="mt-1 text-sm text-gray-500">Quản lý câu hỏi và câu trả lời từ cộng đồng</p>
            </div>

            {stats && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    <DashboardCard title="Tổng câu hỏi" value={stats.totalQuestions} icon={<FileQuestion size={18} />} iconBgColor="#EFF6FF" iconColor="#3B82F6" />
                    <DashboardCard title="Đã trả lời" value={stats.answeredQuestions} icon={<CheckCircle size={18} />} iconBgColor="#F0FDF4" iconColor="#22C55E" />
                    <DashboardCard title="Chờ xử lý" value={stats.pendingQuestions} icon={<Clock size={18} />} iconBgColor="#FFF7ED" iconColor="#F97316" />
                    <DashboardCard title="Câu trả lời" value={stats.totalAnswers} icon={<MessageCircle size={18} />} iconBgColor="#F5F3FF" iconColor="#8B5CF6" />
                    <DashboardCard title="Tương tác" value={stats.totalLikes} icon={<Heart size={18} />} iconBgColor="#FDF2F8" iconColor="#EC4899" />
                </div>
            )}

            {stats && (gradeChartData.length > 0 || monthlyChartData.length > 0) && (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 bg-white p-5">
                        <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-800"><BarChart3 className="h-4 w-4" />Xu hướng theo tháng</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={monthlyChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white p-5">
                        <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-800"><Award className="h-4 w-4" />Theo khối lớp</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={gradeChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                                    {gradeChartData.map((_, i) => <Cell key={i} fill={GRADE_COLORS[i % GRADE_COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex-1 min-w-[240px]">
                    <CustomInputSearch placeholder="Tìm câu hỏi..." value={searchInput} onChange={setSearchInput} size="medium" />
                </div>
                <div className="w-full sm:w-48">
                    <CustomSelect options={STATUS_OPTIONS} value={status} onChange={(v) => { setStatus(v); setPage(1); }} placeholder="Trạng thái" />
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-5 py-3">Câu hỏi</th>
                                <th className="px-5 py-3">Tác giả</th>
                                <th className="px-5 py-3 text-center">Trạng thái</th>
                                <th className="px-5 py-3 text-center">Xem</th>
                                <th className="px-5 py-3 text-center">Trả lời</th>
                                <th className="px-5 py-3 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className={cn('divide-y', loading && 'opacity-60')}>
                            {questions.length === 0 && !loading ? (
                                <tr><td colSpan={6} className="py-16 text-center text-gray-400">Không có câu hỏi</td></tr>
                            ) : questions.map((q) => {
                                const st = statusLabel(q);
                                const name = q.isAnonymous ? 'Ẩn danh' : q.userId?.fullName || '?';
                                return (
                                    <tr key={q._id} className="hover:bg-gray-50">
                                        <td className="px-5 py-4">
                                            <p className="line-clamp-1 font-medium text-gray-800">{q.title}</p>
                                            <p className="text-[10px] uppercase text-gray-400">{GRADE_LABELS[q.grade]}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    {!q.isAnonymous && q.userId?.avatar ? <AvatarImage src={getImageUrl(q.userId.avatar)} /> : null}
                                                    <AvatarFallback className="text-xs">{name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm">{name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-center"><span className={cn('rounded-md px-2 py-0.5 text-xs font-medium', st.cls)}>{st.label}</span></td>
                                        <td className="px-5 py-4 text-center text-sm text-gray-500">{q.viewCount}</td>
                                        <td className="px-5 py-4 text-center text-sm font-medium text-blue-600">{q.answerCount}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <button type="button" onClick={() => setViewTarget(q)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"><Eye className="h-4 w-4" /></button>
                                                <button type="button" onClick={() => setAnswerTarget(q)} className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"><MessageCircle className="h-4 w-4" /></button>
                                                <button type="button" onClick={() => handleToggleLock(q._id)} className={cn('rounded-lg p-2 hover:bg-gray-100', q.isLocked ? 'text-red-500' : 'text-gray-400')}><Lock className="h-4 w-4" /></button>
                                                <button type="button" onClick={() => setDeleteTarget(q)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t px-5 py-3">
                        <span className="text-xs text-gray-500">Trang {page} / {totalPages}</span>
                        <div className="flex gap-2">
                            <button type="button" disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border p-2 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
                            <button type="button" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border p-2 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
                        </div>
                    </div>
                )}
            </div>

            <ViewQuestionModal question={viewTarget} onClose={() => setViewTarget(null)} />
            <AnswerModal question={answerTarget} onClose={() => setAnswerTarget(null)} onSuccess={() => { fetchQuestions(true); faqApi.adminGetStatistics().then((r) => { if (r.success) setStats(r.data); }); }} />
            <ConfirmModalDelete isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Xóa câu hỏi" message={deleteTarget ? `Xóa "${deleteTarget.title}"?` : ''} />
        </div>
    );
}
