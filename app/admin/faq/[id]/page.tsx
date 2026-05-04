// app/(user)/(public)/faq/[id]/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/providers/socket.provider';
import { faqApi, IFaqQuestion, IFaqAnswer } from '@/lib/api/faq.api';
import { Loader2, Heart, ThumbsDown, ThumbsUp, Bot, Shield, CheckCircle, ChevronLeft, Send, MessageCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import CustomTextarea from '@/components/custom/CustomTextarea';

function formatTime(date: string) {
    return format(new Date(date), 'HH:mm, dd/MM/yyyy', { locale: vi });
}

function AnswerItem({
    answer,
    questionId,
    isOwner,
    isAdmin,
    onLike,
    onMarkBest,
    currentUserId
}: {
    answer: IFaqAnswer;
    questionId: string;
    isOwner: boolean;
    isAdmin: boolean;
    onLike: (answerId: string) => void;
    onMarkBest: (answerId: string) => void;
    currentUserId?: string;
}) {
    const [liked, setLiked] = useState(answer.likedBy?.includes(currentUserId || ''));
    const [likes, setLikes] = useState(answer.likes);

    const handleLike = () => {
        setLiked(!liked);
        setLikes(prev => liked ? prev - 1 : prev + 1);
        onLike(answer._id);
    };

    const isBest = answer.isBest;
    const isAi = answer.isAiGenerated;

    return (
        <div className={`p-4 rounded-xl border ${isBest ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50/50 dark:bg-yellow-950/20' : 'border-gray-200 dark:border-gray-700'} ${isAi ? 'bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-950/20' : ''}`}>
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-main/10 overflow-hidden">
                        {answer.userId?.avatar ? (
                            <Image src={answer.userId.avatar} alt="" width={40} height={40} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-main font-semibold">
                                {answer.userId?.fullName?.charAt(0)?.toUpperCase() || (isAi ? 'A' : 'U')}
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {answer.userId?.fullName || (isAi ? 'AI Assistant' : 'Người dùng')}
                            </p>
                            {answer.userType === 'admin' && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-main/10 text-main flex items-center gap-1">
                                    <Shield size={10} /> Admin
                                </span>
                            )}
                            {isAi && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 flex items-center gap-1">
                                    <Bot size={10} /> AI
                                </span>
                            )}
                            {isBest && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
                                    <CheckCircle size={10} /> Hay nhất
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{formatTime(answer.createdAt)}</p>
                    </div>
                </div>
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm transition ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                >
                    <Heart size={14} className={liked ? 'fill-red-500' : ''} />
                    <span>{likes}</span>
                </button>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap ml-[52px]">
                {answer.content}
            </p>
            {!isBest && !isAi && (isOwner || isAdmin) && (
                <div className="flex justify-end mt-3">
                    <button
                        onClick={() => onMarkBest(answer._id)}
                        className="text-xs text-yellow-600 hover:text-yellow-700 flex items-center gap-1"
                    >
                        <CheckCircle size={12} />
                        Đánh dấu hay nhất
                    </button>
                </div>
            )}
        </div>
    );
}

export default function FAQDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { token, user } = useAuthStore();
    const { socket, isConnected } = useSocket();
    const [question, setQuestion] = useState<IFaqQuestion | null>(null);
    const [loading, setLoading] = useState(true);
    const [answerContent, setAnswerContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [helpful, setHelpful] = useState(false);
    const [notHelpful, setNotHelpful] = useState(false);

    const fetchQuestion = useCallback(async () => {
        try {
            setLoading(true);
            const result = await faqApi.getQuestionById(params.id as string);
            if (result.success && result.data) {
                setQuestion(result.data as IFaqQuestion);
            } else {
                toast.error('Không tìm thấy câu hỏi');
                router.push('/faq');
            }
        } catch (error) {
            console.error('Fetch question error:', error);
        } finally {
            setLoading(false);
        }
    }, [params.id, router]);

    useEffect(() => {
        fetchQuestion();
    }, [fetchQuestion]);

    // Socket listeners
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleNewAnswer = (data: { questionId: string; question: IFaqQuestion }) => {
            if (data.questionId === params.id) {
                setQuestion(data.question);
            }
        };

        const handleBestAnswer = (data: { questionId: string; question: IFaqQuestion }) => {
            if (data.questionId === params.id) {
                setQuestion(data.question);
            }
        };

        const handleAnswerLiked = (data: { questionId: string; answerId: string; likes: number }) => {
            if (data.questionId === params.id && question) {
                setQuestion({
                    ...question,
                    answers: question.answers.map(a =>
                        a._id === data.answerId ? { ...a, likes: data.likes } : a
                    )
                });
            }
        };

        socket.on('faq_new_answer', handleNewAnswer);
        socket.on('faq_best_answer', handleBestAnswer);
        socket.on('faq_answer_liked', handleAnswerLiked);

        return () => {
            socket.off('faq_new_answer', handleNewAnswer);
            socket.off('faq_best_answer', handleBestAnswer);
            socket.off('faq_answer_liked', handleAnswerLiked);
        };
    }, [socket, isConnected, params.id, question]);

    const handleSubmitAnswer = async () => {
        if (!token) {
            toast.error('Vui lòng đăng nhập để trả lời');
            return;
        }
        if (!answerContent.trim()) {
            toast.warning('Vui lòng nhập nội dung câu trả lời');
            return;
        }

        setSubmitting(true);
        const result = await faqApi.addAnswer(token, params.id as string, answerContent);
        if (result.success) {
            toast.success('Đã thêm câu trả lời');
            setAnswerContent('');
            fetchQuestion();
        } else {
            toast.error(result.message || 'Thêm câu trả lời thất bại');
        }
        setSubmitting(false);
    };

    const handleLikeAnswer = async (answerId: string) => {
        if (!token) {
            toast.error('Vui lòng đăng nhập');
            return;
        }
        await faqApi.likeAnswer(token, params.id as string, answerId);
    };

    const handleMarkBestAnswer = async (answerId: string) => {
        if (!token) return;
        const result = await faqApi.markBestAnswer(token, params.id as string, answerId);
        if (result.success) {
            toast.success('Đã đánh dấu câu trả lời hay nhất');
            fetchQuestion();
        }
    };

    const handleMarkHelpful = async (isHelpful: boolean) => {
        if (!token) {
            toast.error('Vui lòng đăng nhập để đánh giá');
            return;
        }
        if (isHelpful) {
            setHelpful(true);
        } else {
            setNotHelpful(true);
        }
        await faqApi.markHelpful(token, params.id as string, isHelpful);
        fetchQuestion();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-main" />
            </div>
        );
    }

    if (!question) return null;

    const isOwner = user?._id === question.userId?._id;
    const isAdmin = user?.role === 'admin';
    const canAnswer = question.status !== 'resolved';
    const hasBestAnswer = question.answers?.some(a => a.isBest);
    const aiAnswer = question.answers?.find(a => a.isAiGenerated);

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Back button */}
            <Link href="/faq" className="inline-flex items-center gap-1 text-gray-500 hover:text-main mb-6 transition">
                <ChevronLeft size={16} />
                <span>Quay lại danh sách câu hỏi</span>
            </Link>

            {/* Question */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-main/10 overflow-hidden">
                        {question.userId?.avatar ? (
                            <Image src={question.userId.avatar} alt="" width={48} height={48} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-main font-semibold text-lg">
                                {question.userId?.fullName?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-900 dark:text-white">{question.userId?.fullName || 'Người dùng'}</p>
                            <span className="text-xs text-gray-400">{formatTime(question.createdAt)}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
                                {question.views || 0} lượt xem
                            </span>
                            {question.status === 'resolved' && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Đã giải quyết</span>
                            )}
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{question.title}</h1>
                    </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
                    {question.content}
                </p>

                {/* Helpful buttons */}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={() => handleMarkHelpful(true)}
                        disabled={helpful || notHelpful}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition ${helpful ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-700'}`}
                    >
                        <ThumbsUp size={12} />
                        Hữu ích ({question.helpful || 0})
                    </button>
                    <button
                        onClick={() => handleMarkHelpful(false)}
                        disabled={helpful || notHelpful}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition ${notHelpful ? 'bg-red-100 text-red-700' : 'bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-700'}`}
                    >
                        <ThumbsDown size={12} />
                        Không hữu ích ({question.notHelpful || 0})
                    </button>
                </div>
            </div>

            {/* AI Answer Highlight */}
            {aiAnswer && !hasBestAnswer && (
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-3">
                        <Bot size={18} className="text-purple-500" />
                        <span className="font-semibold text-purple-700 dark:text-purple-400">Câu trả lời từ AI</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {aiAnswer.content}
                    </p>
                </div>
            )}

            {/* Answers */}
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Câu trả lời ({question.answers?.length || 0})
                </h2>
                <div className="space-y-4">
                    {question.answers?.filter(a => !a.isAiGenerated || hasBestAnswer).map(answer => (
                        <AnswerItem
                            key={answer._id}
                            answer={answer}
                            questionId={question._id}
                            isOwner={isOwner}
                            isAdmin={isAdmin}
                            onLike={handleLikeAnswer}
                            onMarkBest={handleMarkBestAnswer}
                            currentUserId={user?._id}
                        />
                    ))}
                    {(!question.answers || question.answers.filter(a => !a.isAiGenerated || hasBestAnswer).length === 0) && (
                        <div className="text-center py-8 text-gray-400">
                            <MessageCircle size={40} className="mx-auto mb-3 opacity-50" />
                            <p>Chưa có câu trả lời nào</p>
                            <p className="text-sm mt-1">Hãy là người đầu tiên trả lời!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Answer form */}
            {canAnswer && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Câu trả lời của bạn</h3>
                    <CustomTextarea
                        value={answerContent}
                        onChange={setAnswerContent}
                        placeholder="Chia sẻ câu trả lời của bạn..."
                        rows={4}
                        maxLength={2000}
                    />
                    <div className="flex justify-end mt-3">
                        <button
                            onClick={handleSubmitAnswer}
                            disabled={submitting || !answerContent.trim()}
                            className="flex items-center gap-2 px-5 py-2.5 bg-main text-white rounded-xl hover:bg-main/80 transition disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={16} />}
                            {submitting ? 'Đang gửi...' : 'Gửi câu trả lời'}
                        </button>
                    </div>
                </div>
            )}

            {!canAnswer && (
                <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-4 text-center text-green-700 dark:text-green-400">
                    <CheckCircle size={20} className="inline mr-2" />
                    Câu hỏi đã được giải quyết. Cảm ơn bạn đã quan tâm!
                </div>
            )}
        </div>
    );
}