'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Clock, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import * as dautruongApi from '@/lib/api/dautruong.api';
import { Contest, Question } from '@/lib/api/dautruong.api';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';

interface UserAnswer {
    questionId: string;
    selectedOption?: string;
    trueFalseAnswers?: Array<{ optionIndex: number; isTrue: boolean }>;
    shortAnswer?: string;
}

export default function ContestTestPage() {
    const params = useParams();
    const router = useRouter();
    const { token } = useAuthStore();
    const contestId = params.id as string;

    const [contest, setContest] = useState<Contest | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [answers, setAnswers] = useState<UserAnswer[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [confirmSubmit, setConfirmSubmit] = useState(false);

    useEffect(() => {
        if (!token) {
            router.push('/login');
            return;
        }
        loadContest();
    }, [contestId, token]);

    useEffect(() => {
        if (contest && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [contest, timeLeft]);

    const loadContest = async () => {
        try {
            setLoading(true);
            const data = await dautruongApi.getContestForTaking(contestId);
            console.log('loadContest data:', data);
            console.log('loadContest data.questions:', data.questions);
            setContest(data);
            setTimeLeft(data.duration * 60);

            // Initialize answers
            if (!data.questions || data.questions.length === 0) {
                throw new Error('Cuộc thi không có câu hỏi');
            }

            const initialAnswers = data.questions.map((q: Question) => ({
                questionId: q._id || '',
                selectedOption: undefined,
                trueFalseAnswers: q.type === 'true-false' ?
                    q.trueFalseOptions?.map((_: any, i: number) => ({ optionIndex: i, isTrue: false })) : undefined,
                shortAnswer: undefined,
            }));
            setAnswers(initialAnswers);
        } catch (error: any) {
            toast.error(error.message || 'Không thể tải cuộc thi');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleMultipleChoiceAnswer = (questionId: string, optionId: string) => {
        if (!questionId) return;
        setAnswers(prev => prev.map(ans => 
            ans.questionId === questionId ? { ...ans, selectedOption: optionId } : ans
        ));
    };

    const handleTrueFalseAnswer = (questionId: string, optionIndex: number, isTrue: boolean) => {
        if (!questionId) return;
        setAnswers(prev => prev.map(ans => {
            if (ans.questionId === questionId) {
                const newAnswers = ans.trueFalseAnswers?.map(a => 
                    a.optionIndex === optionIndex ? { ...a, isTrue } : a
                ) || [];
                return { ...ans, trueFalseAnswers: newAnswers };
            }
            return ans;
        }));
    };

    const handleShortAnswer = (questionId: string, value: string) => {
        if (!questionId) return;
        // Only allow numbers 0-9, -, and comma, max 4 chars
        const sanitized = value.replace(/[^0-9,\-]/g, '').slice(0, 4);
        setAnswers(prev => prev.map(ans => 
            ans.questionId === questionId ? { ...ans, shortAnswer: sanitized } : ans
        ));
    };

    const handleSubmit = async () => {
        if (!contest) return;

        try {
            setSubmitting(true);
            const timeSpent = contest.duration * 60 - timeLeft;
            
            await dautruongApi.submitContestAnswer(contestId, {
                answers,
                timeSpent,
            });

            toast.success('Đã nộp bài thành công!');
            router.push(`/dautruonghoctap/${contestId}/check`);
        } catch (error: any) {
            toast.error(error.message || 'Không thể nộp bài');
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!contest) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Không tìm thấy cuộc thi
                    </h2>
                    <button onClick={() => router.back()} className="text-blue-500 hover:text-blue-600">
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    if (!contest.questions || contest.questions.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Cuộc thi không có câu hỏi
                    </h2>
                    <button onClick={() => router.back()} className="text-blue-500 hover:text-blue-600">
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = contest.questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestionIndex];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header with timer */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Thoát
                        </button>
                        <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg ${
                                timeLeft < 60 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                                <Clock className="h-5 w-5" />
                                {formatTime(timeLeft)}
                            </div>
                            <button
                                onClick={() => setConfirmSubmit(true)}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                            >
                                Nộp bài
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Question navigation */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {contest.questions.map((_, index) => {
                        const answered = answers[index]?.selectedOption || 
                                       answers[index]?.shortAnswer ||
                                       answers[index]?.trueFalseAnswers?.some(a => a.isTrue);
                        return (
                            <button
                                key={index}
                                onClick={() => setCurrentQuestionIndex(index)}
                                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                                    currentQuestionIndex === index
                                        ? 'bg-blue-500 text-white'
                                        : answered
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                }`}
                            >
                                {index + 1}
                            </button>
                        );
                    })}
                </div>

                {/* Question card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                            Câu {currentQuestionIndex + 1}/{contest.questions.length}
                        </span>
                        <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
                            {currentQuestion.type === 'multiple-choice' ? 'Trắc nghiệm' :
                             currentQuestion.type === 'true-false' ? 'Đúng/Sai' : 'Trả lời ngắn'}
                        </span>
                    </div>

                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                        {currentQuestion.question}
                    </h2>

                    {currentQuestion.type === 'multiple-choice' && (
                        <div className="space-y-3">
                            {currentQuestion.options?.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleMultipleChoiceAnswer(currentQuestion._id || currentQuestionIndex.toString(), option._id || index.toString())}
                                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                                        currentAnswer?.selectedOption === (option._id || index.toString())
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                            currentAnswer?.selectedOption === (option._id || index.toString())
                                                ? 'border-blue-500 bg-blue-500'
                                                : 'border-gray-300 dark:border-gray-600'
                                        }`}>
                                            {currentAnswer?.selectedOption === (option._id || index.toString()) && (
                                                <CheckCircle className="h-4 w-4 text-white" />
                                            )}
                                        </div>
                                        <span className="text-gray-900 dark:text-white">{option.text || `Option ${index + 1}`}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {currentQuestion.type === 'true-false' && (
                        <div className="space-y-3">
                            {currentQuestion.trueFalseOptions?.map((option, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700"
                                >
                                    <p className="text-gray-900 dark:text-white mb-3">{option.text || `Câu ${index + 1}`}</p>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleTrueFalseAnswer(currentQuestion._id || currentQuestionIndex.toString(), index, true)}
                                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                                                currentAnswer?.trueFalseAnswers?.[index]?.isTrue
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/20'
                                            }`}
                                        >
                                            Đúng
                                        </button>
                                        <button
                                            onClick={() => handleTrueFalseAnswer(currentQuestion._id || currentQuestionIndex.toString(), index, false)}
                                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                                                currentAnswer?.trueFalseAnswers?.[index]?.isTrue === false
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/20'
                                            }`}
                                        >
                                            Sai
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {currentQuestion.type === 'short-answer' && (
                        <div>
                            <input
                                type="text"
                                value={currentAnswer?.shortAnswer || ''}
                                onChange={(e) => handleShortAnswer(currentQuestion._id || currentQuestionIndex.toString(), e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-mono"
                                placeholder="Nhập đáp án (0-9, -, ,)"
                                maxLength={4}
                            />
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Chỉ chấp nhận số 0-9, dấu -, dấu ,. Tối đa 4 ký tự.
                            </p>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                    <button
                        onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                        Câu trước
                    </button>
                    <button
                        onClick={() => setCurrentQuestionIndex(Math.min(contest.questions.length - 1, currentQuestionIndex + 1))}
                        disabled={currentQuestionIndex === contest.questions.length - 1}
                        className="px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                        Câu sau
                    </button>
                </div>
            </div>

            {/* Confirm submit modal */}
            {confirmSubmit && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="h-6 w-6 text-yellow-500" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                Xác nhận nộp bài
                            </h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Bạn có chắc chắn muốn nộp bài? Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmSubmit(false)}
                                className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                            >
                                {submitting ? 'Đang nộp...' : 'Nộp bài'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
