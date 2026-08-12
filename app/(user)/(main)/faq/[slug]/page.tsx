'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Eye, MessageCircle, Clock, Heart, Send, Award,
    FileQuestion, Lock, Pin, Edit2, Trash2, X, CheckCircle2,
} from 'lucide-react';
import { faqApi, getErrorMessage } from '@/lib/api/faq.api';
import { Question, Answer, GRADE_LABELS } from '@/types/faq.type';
import CustomEditor, { CustomEditorRef } from '@/components/custom/CustomEditor';
import StaticContent from '@/components/common/StaticContent';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInput } from '@/components/custom/CustomInput';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/utils/imageUrl';
import { getGuestViewerId } from '@/lib/utils/viewerId';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

function fmtDate(date: string) {
    return new Date(date).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

export default function QuestionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const user = useAuthStore((s) => s.user);
    const token = useAuthStore((s) => s.token);
    const editorRef = useRef<CustomEditorRef>(null);
    const editEditorRef = useRef<CustomEditorRef>(null);

    const [question, setQuestion] = useState<Question | null>(null);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [isLiked, setIsLiked] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [deleteOpen, setDeleteOpen] = useState(false);

    const fetchData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await faqApi.getQuestionBySlug(slug);
            if (res.success) {
                setQuestion(res.data.question);
                setAnswers(res.data.answers);
                setIsLiked(res.data.isLiked);
            }
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            if (!silent) setLoading(false);
        }
    }, [slug]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        const sessionKey = `faq_viewed_${slug}`;
        return () => {
            if (sessionStorage.getItem(sessionKey)) return;
            sessionStorage.setItem(sessionKey, '1');
            faqApi.incrementView(slug, token ? undefined : getGuestViewerId()).then((res) => {
                if (res.success && res.data.counted) {
                    setQuestion((prev) => prev ? { ...prev, viewCount: res.data.views } : prev);
                }
            }).catch(() => {});
        };
    }, [slug, token]);

    const handleLikeQuestion = async () => {
        if (!token || !question) {
            toast.error('Vui lòng đăng nhập');
            return;
        }
        try {
            const res = await faqApi.toggleLikeQuestion(question._id);
            if (res.success) {
                setIsLiked(res.data.action === 'added');
                setQuestion({ ...question, likeCount: res.data.likeCount });
            }
        } catch (error) { toast.error(getErrorMessage(error)); }
    };

    const handleLikeAnswer = async (answerId: string) => {
        if (!token) { toast.error('Vui lòng đăng nhập'); return; }
        try {
            const res = await faqApi.toggleLikeAnswer(answerId);
            if (res.success) {
                setAnswers((prev) => prev.map((a) => (
                    a._id === answerId
                        ? { ...a, likeCount: res.data.likeCount, isLiked: res.data.action === 'added' }
                        : a
                )));
            }
        } catch (error) { toast.error(getErrorMessage(error)); }
    };

    const handleSubmitAnswer = async () => {
        if (!question || !token) { toast.error('Vui lòng đăng nhập'); return; }
        const content = editorRef.current?.getContent() || '';
        if (!content.trim() || content === '<p><br></p>') {
            toast.error('Vui lòng nhập nội dung trả lời');
            return;
        }
        setSubmitting(true);
        try {
            await faqApi.createAnswer({ questionId: question._id, content });
            editorRef.current?.setContent('');
            await fetchData(true);
            toast.success('Đã gửi câu trả lời');
        } catch (error) { toast.error(getErrorMessage(error)); }
        finally { setSubmitting(false); }
    };

    const handleMarkBest = async (answerId: string) => {
        if (!question) return;
        try {
            await faqApi.markBestAnswer(answerId, question._id);
            toast.success('Đã đánh dấu câu trả lời hữu ích nhất');
            await fetchData(true);
        } catch (error) { toast.error(getErrorMessage(error)); }
    };

    const handleUpdateQuestion = async () => {
        if (!question) return;
        const content = editEditorRef.current?.getContent() || question.content;
        try {
            await faqApi.updateQuestion(question._id, { title: editTitle, content });
            toast.success('Cập nhật câu hỏi thành công');
            setEditOpen(false);
            await fetchData(true);
        } catch (error) { toast.error(getErrorMessage(error)); }
    };

    const handleDeleteQuestion = async () => {
        if (!question) return;
        setDeleting(true);
        try {
            await faqApi.deleteQuestion(question._id);
            toast.success('Đã xóa câu hỏi');
            router.push('/faq');
        } catch (error) { toast.error(getErrorMessage(error)); }
        finally { setDeleting(false); }
    };

    const handleDeleteAnswer = async (answerId: string) => {
        try {
            await faqApi.deleteAnswer(answerId);
            toast.success('Đã xóa câu trả lời');
            await fetchData(true);
        } catch (error) { toast.error(getErrorMessage(error)); }
    };

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    if (!question) {
        return (
            <div className="container mx-auto max-w-5xl px-4 py-16 text-center" style={{ backgroundColor: 'var(--cn-bg-main)' }}>
                <FileQuestion className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <p className="mb-4 text-gray-500">Không tìm thấy câu hỏi</p>
                <CustomButton onClick={() => router.push('/faq')}>Quay lại</CustomButton>
            </div>
        );
    }

    const displayName = question.isAnonymous ? 'Ẩn danh' : question.userId?.fullName || 'Người dùng';
    const isOwner = user?._id === question.userId?._id;

    return (
        <div className="min-h-screen pb-8 pt-16 md:pt-14 lg:pt-8" style={{ backgroundColor: 'var(--cn-bg-main)' }}>
            <div className="container mx-auto max-w-5xl px-4">
                <Link href="/faq" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600">
                    <ArrowLeft className="h-4 w-4" />Quay lại danh sách
                </Link>

                <article className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
                    <div className="mb-3 flex flex-wrap gap-2">
                        {question.isPinned && <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-0.5 text-xs text-orange-700"><Pin className="h-3 w-3" />Ghim</span>}
                        {question.isLocked && <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600"><Lock className="h-3 w-3" />Đã khóa</span>}
                        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs text-blue-700">{GRADE_LABELS[question.grade]}</span>
                        <span className={cn('rounded-md px-2 py-0.5 text-xs font-medium', question.isSolved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>
                            {question.isSolved ? 'Đã giải' : 'Chờ trả lời'}
                        </span>
                    </div>

                    <div className="mb-4 flex items-start justify-between gap-3">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{question.title}</h1>
                        {isOwner && (
                            <div className="flex shrink-0 gap-1">
                                <button type="button" onClick={() => { setEditTitle(question.title); setEditOpen(true); }} className="rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600"><Edit2 className="h-4 w-4" /></button>
                                <button type="button" onClick={() => setDeleteOpen(true)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                            </div>
                        )}
                    </div>

                    <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4">
                        <Avatar className="h-10 w-10">
                            {!question.isAnonymous && question.userId?.avatar ? <AvatarImage src={getImageUrl(question.userId.avatar)} /> : null}
                            <AvatarFallback>{question.isAnonymous ? '?' : displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium text-gray-800">{displayName}</p>
                            <p className="text-xs text-gray-500">{fmtDate(question.createdAt)}</p>
                        </div>
                    </div>

                    <StaticContent content={question.content} />

                    <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" />{question.viewCount} lượt xem</span>
                        <span className="inline-flex items-center gap-1"><MessageCircle className="h-4 w-4" />{answers.length} trả lời</span>
                        <button type="button" onClick={handleLikeQuestion} className={cn('inline-flex items-center gap-1 rounded-full px-3 py-1', isLiked ? 'bg-red-50 text-red-500' : 'hover:bg-red-50 hover:text-red-500')}>
                            <Heart
                                className="h-4 w-4"
                                data-filled={isLiked ? 'true' : 'false'}
                                fill={isLiked ? 'currentColor' : 'none'}
                            />
                            Hữu ích {question.likeCount > 0 && `(${question.likeCount})`}
                        </button>
                    </div>
                </article>

                <h2 className="mb-4 text-lg font-semibold text-gray-800">{answers.length} câu trả lời</h2>
                <div className="mb-8 space-y-4">
                    {answers.map((answer) => {
                        const name = answer.userId?.fullName || 'Người dùng';
                        const isAnswerOwner = user?._id === answer.userId?._id;
                        return (
                            <div key={answer._id} className={cn('rounded-xl border bg-white p-5 dark:bg-gray-950', answer.isBestAnswer ? 'border-emerald-400 bg-emerald-50/30' : 'border-gray-200')}>
                                <div className="mb-3 flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            {answer.userId?.avatar ? <AvatarImage src={getImageUrl(answer.userId.avatar)} /> : null}
                                            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-medium text-gray-800">{name}</span>
                                                {answer.userId?.role === 'admin' && <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] text-purple-700">Admin</span>}
                                                {answer.isBestAnswer && <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-700"><Award className="h-3 w-3" />Hữu ích nhất</span>}
                                            </div>
                                            <p className="text-xs text-gray-500">{fmtDate(answer.createdAt)}{answer.isEdited && ' · Đã chỉnh sửa'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        {isOwner && !answer.isBestAnswer && (
                                            <button type="button" onClick={() => handleMarkBest(answer._id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600" title="Đánh dấu hữu ích nhất">
                                                <CheckCircle2 className="h-4 w-4" />
                                            </button>
                                        )}
                                        {isAnswerOwner && (
                                            <button type="button" onClick={() => handleDeleteAnswer(answer._id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                                        )}
                                    </div>
                                </div>
                                <StaticContent content={answer.content} compact />
                                <div className="mt-3 border-t border-gray-100 pt-2">
                                    <button type="button" onClick={() => handleLikeAnswer(answer._id)} className={cn('inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm', answer.isLiked ? 'bg-red-50 text-red-500' : 'text-gray-500 hover:bg-red-50 hover:text-red-500')}>
                                        <Heart
                                            className="h-3.5 w-3.5"
                                            data-filled={answer.isLiked ? 'true' : 'false'}
                                            fill={answer.isLiked ? 'currentColor' : 'none'}
                                        />
                                        Hữu ích {answer.likeCount > 0 && `(${answer.likeCount})`}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {answers.length === 0 && (
                        <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center text-gray-500">
                            Chưa có câu trả lời nào
                        </div>
                    )}
                </div>

                {!question.isLocked ? (
                    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
                        <h3 className="mb-3 font-semibold text-gray-800">Viết câu trả lời</h3>
                        <CustomEditor ref={editorRef} />
                        <div className="mt-4 flex justify-end">
                            <CustomButton onClick={handleSubmitAnswer} loading={submitting}>
                                <Send className="h-4 w-4" />Gửi câu trả lời
                            </CustomButton>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
                        <Lock className="mx-auto mb-2 h-8 w-8" />
                        Câu hỏi này đã bị khóa, không thể thêm câu trả lời
                    </div>
                )}
            </div>

            {editOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditOpen(false)}>
                    <div className="w-full max-w-2xl rounded-xl bg-white p-5 dark:bg-gray-950" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="font-semibold">Chỉnh sửa câu hỏi</h3>
                            <button type="button" onClick={() => setEditOpen(false)}><X className="h-5 w-5" /></button>
                        </div>
                        <CustomInput label="Tiêu đề" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="mb-4" />
                        <CustomEditor ref={editEditorRef} initialValue={question.content} />
                        <div className="mt-4 flex justify-end gap-2">
                            <CustomButton variant="secondary" onClick={() => setEditOpen(false)}>Hủy</CustomButton>
                            <CustomButton onClick={handleUpdateQuestion}>Lưu</CustomButton>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModalDelete
                isOpen={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={handleDeleteQuestion}
                title="Xóa câu hỏi"
                message={`Bạn có chắc muốn xóa "${question.title}"?`}
                warning="Tất cả câu trả lời sẽ bị xóa vĩnh viễn."
                isDeleting={deleting}
            />
        </div>
    );
}
