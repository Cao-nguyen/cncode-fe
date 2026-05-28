
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Eye, MessageCircle, Clock, Heart, Send, Award,
    FileQuestion, Lock, Pin, CheckCircle, Flag, Edit2, Trash2, X
} from 'lucide-react';
import { faqApi, getErrorMessage } from '@/lib/api/faq.api';
import { Question, Answer } from '@/types/faq.type';
import CustomEditor, { CustomEditorRef } from '@/components/custom/CustomEditor';
import StaticContent from '@/components/common/StaticContent';
import { AlertTriangle } from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import { toast } from 'sonner';

const getUserId = (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem('auth-storage');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed?.state?.token) return null;
        return parsed?.state?.user?._id || null;
    } catch {
        return null;
    }
};

const GRADE_LABELS: Record<string, string> = {
    grade10: 'Tin học 10',
    grade11: 'Tin học 11',
    grade12: 'Tin học 12',
    other: 'Khác',
};

const ReportModal = ({
    isOpen,
    onClose,
    onSubmit,
    title
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string, description: string) => void;
    title: string;
}) => {
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const reportReasonOptions = [
        { value: '', label: 'Chọn lý do' },
        { value: 'spam', label: 'Spam - Nội dung quảng cáo, lặp lại' },
        { value: 'harassment', label: 'Quấy rối - Xúc phạm, đe dọa' },
        { value: 'offensive', label: 'Nội dung không phù hợp' },
        { value: 'misinformation', label: 'Thông tin sai lệch' },
        { value: 'other', label: 'Khác' },
    ];

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!reason) {
            toast.error('Vui lòng chọn lý do báo cáo');
            return;
        }
        setSubmitting(true);
        try {
            await onSubmit(reason, description);
            setReason('');
            setDescription('');
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="bg-[var(--cn-bg-card)] rounded-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-[var(--cn-border)]">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-[var(--cn-text-main)]">Báo cáo: {title}</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--cn-hover)]">
                        <X className="w-5 h-5 text-[var(--cn-text-muted)]" />
                    </button>
                </div>
                <div className="p-5 space-y-4">
                    <CustomSelect label="Lý do báo cáo" options={reportReasonOptions} value={reason} onChange={setReason} placeholder="Chọn lý do" required />
                    <CustomInput label="Mô tả thêm (không bắt buộc)" placeholder="Nhập mô tả chi tiết..." value={description} onChange={(e) => setDescription(e.target.value)} textarea rows={3} />
                </div>
                <div className="flex justify-end gap-4 p-4 pt-2 border-t border-[var(--cn-border)]">
                    <CustomButton variant="secondary" onClick={onClose}>Hủy</CustomButton>
                    <CustomButton onClick={handleSubmit} loading={submitting}>Gửi báo cáo</CustomButton>
                </div>
            </div>
        </div>
    );
};

const EditAnswerModal = ({
    isOpen,
    onClose,
    onSubmit,
    initialContent
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (content: string) => void;
    initialContent: string;
}) => {
    const editorRef = useRef<CustomEditorRef>(null);
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        const newContent = editorRef.current?.getContent() || '';
        if (!newContent.trim() || newContent === '<p><br></p>') {
            toast.error('Vui lòng nhập nội dung câu trả lời');
            return;
        }
        setSubmitting(true);
        try {
            await onSubmit(newContent);
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div key={initialContent} className="bg-[var(--cn-bg-card)] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-[var(--cn-border)] sticky top-0 bg-[var(--cn-bg-card)] z-10">
                    <h2 className="text-lg font-semibold text-[var(--cn-text-main)]">Chỉnh sửa câu trả lời</h2>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--cn-hover)] transition-colors"><X className="w-5 h-5 text-[var(--cn-text-muted)]" /></button>
                </div>
                <div className="p-5"><CustomEditor ref={editorRef} initialValue={initialContent} /></div>
                <div className="flex justify-end gap-3 p-4 pt-2 border-t border-[var(--cn-border)] mt-4">
                    <CustomButton variant="secondary" onClick={onClose}>Hủy</CustomButton>
                    <CustomButton onClick={handleSubmit} loading={submitting}>Cập nhật</CustomButton>
                </div>
            </div>
        </div>
    );
};

const EditQuestionModal = ({
    isOpen,
    onClose,
    onSubmit,
    initialTitle,
    initialContent
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (title: string, content: string) => void;
    initialTitle: string;
    initialContent: string;
}) => {
    const editorRef = useRef<CustomEditorRef>(null);
    const [title, setTitle] = useState(initialTitle);
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!title.trim()) { toast.error('Vui lòng nhập tiêu đề'); return; }
        const content = editorRef.current?.getContent() || '';
        if (!content.trim() || content === '<p><br></p>') { toast.error('Vui lòng nhập nội dung câu hỏi'); return; }
        setSubmitting(true);
        try {
            await onSubmit(title, content);
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div key={initialTitle} className="bg-[var(--cn-bg-card)] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-[var(--cn-border)] sticky top-0 bg-[var(--cn-bg-card)] z-10">
                    <h2 className="text-lg font-semibold text-[var(--cn-text-main)]">Chỉnh sửa câu hỏi</h2>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--cn-hover)] transition-colors"><X className="w-5 h-5 text-[var(--cn-text-muted)]" /></button>
                </div>
                <div className="p-5 space-y-4">
                    <CustomInput label="Tiêu đề" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tiêu đề câu hỏi..." required />
                    <div>
                        <label className="block text-sm font-medium text-[var(--cn-text-sub)] mb-2">Nội dung</label>
                        <CustomEditor ref={editorRef} initialValue={initialContent} />
                    </div>
                </div>
                <div className="flex justify-end gap-3 p-4 pt-2 border-t border-[var(--cn-border)] mt-4">
                    <CustomButton variant="secondary" onClick={onClose}>Hủy</CustomButton>
                    <CustomButton onClick={handleSubmit} loading={submitting}>Cập nhật</CustomButton>
                </div>
            </div>
        </div>
    );
};

export default function QuestionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const editorRef = useRef<CustomEditorRef>(null);
    const [question, setQuestion] = useState<Question | null>(null);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [isLiked, setIsLiked] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [reportTarget, setReportTarget] = useState<{ type: 'question' | 'answer'; id: string; title: string } | null>(null);
    const [editAnswerTarget, setEditAnswerTarget] = useState<Answer | null>(null);
    const [editQuestionTarget, setEditQuestionTarget] = useState<Question | null>(null);
    const [deleteAnswerTarget, setDeleteAnswerTarget] = useState<Answer | null>(null);
    const [deleteQuestionConfirm, setDeleteQuestionConfirm] = useState(false);

    useEffect(() => { setCurrentUserId(getUserId()); }, []);

    const fetchData = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const res = await faqApi.getQuestionBySlug(params.slug as string);
            if (res.success) {
                setQuestion(res.data.question);
                setAnswers(res.data.answers);
                setIsLiked(res.data.isLiked);
            }
        } catch (error) {
            console.error('Error:', getErrorMessage(error));
        } finally {
            if (!isSilent) setLoading(false);
        }
    }, [params.slug]);

    useEffect(() => {
        if (params.slug) fetchData();
    }, [params.slug, fetchData]);

    const handleLikeQuestion = async () => {
        if (!question) return;
        try {
            const res = await faqApi.toggleLikeQuestion(question._id);
            if (res.success) {
                setIsLiked(res.action === 'added');
                setQuestion(prev => prev ? { ...prev, likeCount: res.likeCount } : null);
            }
        } catch (error) { toast.error(getErrorMessage(error)); }
    };

    const handleLikeAnswer = async (answerId: string) => {
        try {
            const res = await faqApi.toggleLikeAnswer(answerId);
            if (res.success) {
                setAnswers(prev => prev.map(answer =>
                    answer._id === answerId
                        ? { ...answer, likeCount: res.likeCount, isLiked: res.action === 'added' }
                        : answer
                ));
            }
        } catch (error) { toast.error(getErrorMessage(error)); }
    };

    const handleSubmitAnswer = async () => {
        if (!question) return;
        const content = editorRef.current?.getContent() || '';
        if (!content.trim() || content === '<p><br></p>') {
            toast.error('Vui lòng nhập nội dung trả lời');
            return;
        }
        setSubmitting(true);
        try {
            const res = await faqApi.createAnswer({ questionId: question._id, content });
            if (res.success) {
                editorRef.current?.setContent('');
                await fetchData(true);
            }
        } catch (error) { toast.error(getErrorMessage(error)); }
        finally { setSubmitting(false); }
    };

    const handleUpdateQuestion = async (title: string, content: string) => {
        if (!question) return;
        try {
            await faqApi.updateQuestion(question._id, { title, content });
            toast.success('Cập nhật câu hỏi thành công');
            await fetchData(true);
        } catch (error) { toast.error(getErrorMessage(error)); }
    };

    const handleDeleteQuestion = async () => {
        if (!question) return;
        setDeleting(true);
        try {
            await faqApi.deleteQuestion(question._id);
            toast.success('Câu hỏi đã được xóa.');
            router.push('/faq');
        } catch (error) { toast.error(getErrorMessage(error)); }
        finally { setDeleting(false); }
    };

    const handleUpdateAnswer = async (answerId: string, content: string) => {
        try {
            await faqApi.updateAnswer(answerId, content);
            toast.success('Cập nhật câu trả lời thành công');
            await fetchData(true);
        } catch (error) { toast.error(getErrorMessage(error)); }
    };

    const handleDeleteAnswer = async () => {
        if (!deleteAnswerTarget) return;
        setDeleting(true);

        const oldAnswers = [...answers];
        setAnswers(prev => prev.filter(a => a._id !== deleteAnswerTarget._id));

        try {
            await faqApi.deleteAnswer(deleteAnswerTarget._id);
            toast.success('Câu trả lời đã được xóa.');
            setDeleteAnswerTarget(null);
        } catch (error) {
            setAnswers(oldAnswers);
            toast.error(getErrorMessage(error));
        } finally {
            setDeleting(false);
        }
    };

    const handleReport = async (reason: string, description: string) => {
        if (!reportTarget) return;
        try {
            await faqApi.report(reportTarget.type, reportTarget.id, reason, description);
            toast.success('Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét.');
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setReportTarget(null);
        }
    };

    const formatDate = (date: string) => new Date(date).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    if (loading) return (
        <div className="min-h-screen bg-[var(--cn-bg-main)] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-[var(--cn-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!question) return (
        <div className="min-h-screen bg-[var(--cn-bg-main)] flex items-center justify-center">
            <div className="text-center">
                <FileQuestion className="w-16 h-16 mx-auto text-[var(--cn-text-muted)] mb-4 opacity-50" />
                <p className="text-[var(--cn-text-sub)] mb-4">Không tìm thấy câu hỏi</p>
                <Link href="/faq"><CustomButton>Quay lại</CustomButton></Link>
            </div>
        </div>
    );

    const displayName = question.isAnonymous ? 'Ẩn danh' : question.userId?.fullName || 'Người dùng';
    const isQuestionOwner = currentUserId === question.userId?._id;

    return (
        <div className="min-h-screen bg-gradient-to-b from-[var(--cn-bg-main)] to-[var(--cn-bg-section)] py-8 lg:py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link href="/faq" className="inline-flex items-center gap-2 text-[var(--cn-text-muted)] hover:text-[var(--cn-primary)] mb-6 transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Quay lại danh sách câu hỏi</span>
                </Link>

                <div className="bg-[var(--cn-bg-card)] rounded-2xl border border-[var(--cn-border)] p-6 lg:p-8 mb-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        {question.isPinned && <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none"><Pin className="w-3 h-3 mr-1" />Góc giải đáp</Badge>}
                        {question.isLocked && <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-none"><Lock className="w-3 h-3 mr-1" />Đã khóa</Badge>}
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-none">{GRADE_LABELS[question.grade]}</Badge>
                    </div>

                    <h1 className="text-2xl lg:text-3xl font-bold text-[var(--cn-text-main)] mb-4 leading-tight">{question.title}</h1>

                    <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-[var(--cn-border)]">
                        <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 ring-2 ring-[var(--cn-primary)]/20">
                                {!question.isAnonymous && question.userId?.avatar ? <AvatarImage src={question.userId.avatar} alt={displayName} /> : null}
                                <AvatarFallback className={question.isAnonymous ? 'bg-gray-200 text-gray-500' : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'}>{question.isAnonymous ? '?' : displayName.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-[var(--cn-text-main)]">{displayName}</span>
                                    {question.userId?.role === 'admin' && !question.isAnonymous && <Badge className="bg-purple-100 text-purple-700 border-none text-xs">Admin</Badge>}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-[var(--cn-text-muted)] mt-0.5"><Clock className="w-3 h-3" /><span>{formatDate(question.createdAt)}</span></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {isQuestionOwner && (
                                <>
                                    <button onClick={() => setEditQuestionTarget(question)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors" title="Chỉnh sửa"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={() => setDeleteQuestionConfirm(true)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Xóa" disabled={deleting}>{deleting ? <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}</button>
                                </>
                            )}
                            <button onClick={() => setReportTarget({ type: 'question', id: question._id, title: question.title })} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Báo cáo"><Flag className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <StaticContent content={question.content} />

                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[var(--cn-border)]">
                        <div className="flex items-center gap-1.5 text-[var(--cn-text-muted)] bg-[var(--cn-bg-section)] px-3 py-1.5 rounded-full"><Eye className="w-4 h-4" /><span className="text-sm">{question.viewCount} lượt xem</span></div>
                        <div className="flex items-center gap-1.5 text-[var(--cn-text-muted)] bg-[var(--cn-bg-section)] px-3 py-1.5 rounded-full"><MessageCircle className="w-4 h-4" /><span className="text-sm">{answers.length} câu trả lời</span></div>
                        <button onClick={handleLikeQuestion} className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all duration-300 ${isLiked ? 'bg-red-50 text-red-500' : 'bg-[var(--cn-bg-section)] text-[var(--cn-text-muted)] hover:bg-red-50 hover:text-red-500'}`}>
                            <Heart className={`w-4 h-4 transition-all duration-300 ${isLiked ? 'scale-110' : ''}`} data-filled={isLiked ? "true" : "false"} fill={isLiked ? "currentColor" : "none"} />
                            <span className="text-sm font-medium">{isLiked ? 'Đã hữu ích' : 'Hữu ích'}{question.likeCount > 0 && ` (${question.likeCount})`}</span>
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold text-[var(--cn-text-main)]">{answers.length} câu trả lời</h2>
                    <div className="text-xs text-[var(--cn-text-muted)] bg-[var(--cn-bg-section)] px-3 py-1 rounded-full">Sắp xếp theo: Hữu ích nhất</div>
                </div>

                <div className="space-y-4 mb-8">
                    {answers.map((answer) => {
                        const answerDisplayName = answer.userId?.fullName || 'Người dùng';
                        const isAnswerOwner = currentUserId === answer.userId?._id;
                        return (
                            <div key={answer._id} className={`bg-[var(--cn-bg-card)] rounded-xl border p-5 transition-all duration-300 ${answer.isBestAnswer ? 'border-green-500 bg-gradient-to-r from-green-50/50 to-transparent shadow-sm' : 'border-[var(--cn-border)] hover:shadow-md'}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-10 h-10 flex-shrink-0">
                                            {answer.userId?.avatar ? <AvatarImage src={answer.userId.avatar} alt={answerDisplayName} /> : null}
                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">{answerDisplayName.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold text-[var(--cn-text-main)]">{answerDisplayName}</span>
                                                {answer.userId?.role === 'admin' && <Badge className="bg-purple-100 text-purple-700 border-none text-xs">Admin</Badge>}
                                                {answer.isBestAnswer && <Badge className="bg-green-100 text-green-700 border-none text-xs"><Award className="w-3 h-3 mr-1" />Câu trả lời hữu ích nhất</Badge>}
                                            </div>
                                            <div className="text-xs text-[var(--cn-text-muted)] mt-0.5">{formatDate(answer.createdAt)}{answer.isEdited && <span className="ml-2">• Đã chỉnh sửa</span>}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {isAnswerOwner && (
                                            <>
                                                <button onClick={() => setEditAnswerTarget(answer)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors" title="Chỉnh sửa"><Edit2 className="w-4 h-4" /></button>
                                                <button onClick={() => setDeleteAnswerTarget(answer)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Xóa" disabled={deleting}><Trash2 className="w-4 h-4" /></button>
                                            </>
                                        )}
                                        <button onClick={() => setReportTarget({ type: 'answer', id: answer._id, title: `Câu trả lời của ${answerDisplayName}` })} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Báo cáo"><Flag className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <StaticContent content={answer.content} />
                                <div className="flex items-center gap-3 pt-2 border-t border-[var(--cn-border)]">
                                    <button onClick={() => handleLikeAnswer(answer._id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all duration-300 ${answer.isLiked ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500'}`}>
                                        <Heart className={`w-3.5 h-3.5 transition-all duration-300 ${answer.isLiked ? 'scale-110' : ''}`} data-filled={answer.isLiked ? "true" : "false"} fill={answer.isLiked ? "currentColor" : "none"} />
                                        <span>Hữu ích {answer.likeCount > 0 ? `(${answer.likeCount})` : ''}</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {answers.length === 0 && (
                        <div className="text-center py-12 bg-[var(--cn-bg-card)] rounded-xl border border-[var(--cn-border)]">
                            <MessageCircle className="w-12 h-12 mx-auto text-[var(--cn-text-muted)] mb-3 opacity-50" />
                            <p className="text-[var(--cn-text-sub)]">Chưa có câu trả lời nào</p>
                            <p className="text-sm text-[var(--cn-text-muted)] mt-1">Hãy là người đầu tiên trả lời câu hỏi này!</p>
                        </div>
                    )}
                </div>

                {!question.isLocked ? (
                    <div className="bg-[var(--cn-bg-card)] rounded-xl border border-[var(--cn-border)] p-6 lg:p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Avatar className="w-8 h-8"><AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm">{currentUserId?.charAt(0).toUpperCase() || '?'}</AvatarFallback></Avatar>
                            <h3 className="font-semibold text-[var(--cn-text-main)]">Câu trả lời của bạn</h3>
                        </div>
                        <CustomEditor ref={editorRef} />
                        <div className="flex justify-end mt-5">
                            <CustomButton onClick={handleSubmitAnswer} loading={submitting} className="!px-6"><Send className="w-4 h-4" />Gửi câu trả lời</CustomButton>
                        </div>
                    </div>
                ) : (
                    <div className="bg-[var(--cn-bg-card)] rounded-xl border border-[var(--cn-border)] p-8 text-center">
                        <Lock className="w-10 h-10 mx-auto text-[var(--cn-text-muted)] mb-3" />
                        <p className="text-[var(--cn-text-sub)]">Câu hỏi này đã bị khóa</p>
                        <p className="text-sm text-[var(--cn-text-muted)] mt-1">Không thể thêm câu trả lời mới</p>
                    </div>
                )}
            </div>

            <ReportModal key={reportTarget?.id} isOpen={!!reportTarget} onClose={() => setReportTarget(null)} onSubmit={handleReport} title={reportTarget?.title || ''} />
            <EditAnswerModal key={editAnswerTarget?._id} isOpen={!!editAnswerTarget} onClose={() => setEditAnswerTarget(null)} onSubmit={(content) => handleUpdateAnswer(editAnswerTarget!._id, content)} initialContent={editAnswerTarget?.content || ''} />
            <EditQuestionModal key={editQuestionTarget?._id} isOpen={!!editQuestionTarget} onClose={() => setEditQuestionTarget(null)} onSubmit={handleUpdateQuestion} initialTitle={editQuestionTarget?.title || ''} initialContent={editQuestionTarget?.content || ''} />
            <ConfirmModalDelete isOpen={deleteQuestionConfirm} onClose={() => setDeleteQuestionConfirm(false)} onConfirm={handleDeleteQuestion} title="Xóa câu hỏi" message={`Bạn có chắc chắn muốn xóa câu hỏi "${question?.title}"?`} warning="Tất cả câu trả lời sẽ bị xóa vĩnh viễn." />
            <ConfirmModalDelete isOpen={!!deleteAnswerTarget} onClose={() => setDeleteAnswerTarget(null)} onConfirm={handleDeleteAnswer} title="Xóa câu trả lời" message="Bạn có chắc chắn muốn xóa câu trả lời này?" warning="Hành động này không thể hoàn tác." />
        </div>
    );
}
