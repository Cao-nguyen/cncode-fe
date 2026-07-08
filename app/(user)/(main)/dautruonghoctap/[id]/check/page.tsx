'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trophy, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import * as dautruongApi from '@/lib/api/dautruong.api';
import { UserAnswer as UserAnswerType } from '@/lib/api/dautruong.api';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';

export default function ContestCheckPage() {
    const params = useParams();
    const router = useRouter();
    const { token } = useAuthStore();
    const contestId = params.id as string;

    const [userAnswer, setUserAnswer] = useState<UserAnswerType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            router.push('/login');
            return;
        }
        loadResult();
    }, [contestId, token]);

    const loadResult = async () => {
        try {
            setLoading(true);
            const data = await dautruongApi.getUserAnswer(contestId);
            setUserAnswer(data);
        } catch (error: any) {
            toast.error(error.message || 'Không thể tải kết quả');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!userAnswer) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Không tìm thấy kết quả
                    </h2>
                    <button onClick={() => router.back()} className="text-blue-500 hover:text-blue-600">
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    const contest = userAnswer.contestId as any;
    const correctCount = userAnswer.answers.filter(a => a.isCorrect).length;
    const totalQuestions = userAnswer.answers.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Quay lại
                    </button>
                </div>

                {/* Score Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {contest?.title || 'Kết quả cuộc thi'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Nộp bài: {new Date(userAnswer.submittedAt).toLocaleString('vi-VN')}
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                            <Trophy className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                            <div className="text-3xl font-bold text-blue-500">
                                {userAnswer.totalScore}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Điểm số</div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                            <div className="text-3xl font-bold text-green-500">
                                {correctCount}/{totalQuestions}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Câu đúng</div>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                            <Clock className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                            <div className="text-3xl font-bold text-purple-500">
                                {Math.floor(userAnswer.timeSpent / 60)}:{(userAnswer.timeSpent % 60).toString().padStart(2, '0')}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Thời gian</div>
                        </div>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                        <div
                            className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                    <p className="text-center mt-2 text-gray-600 dark:text-gray-400">
                        {percentage}% đúng
                    </p>
                </div>

                {/* Answers Detail */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            Chi tiết câu trả lời
                        </h2>
                    </div>
                    <div className="divide-y dark:divide-gray-700">
                        {userAnswer.answers.map((answer, index) => {
                            const question = (answer as any).question;
                            return (
                                <div
                                    key={index}
                                    className={`p-6 ${answer.isCorrect ? 'bg-green-50 dark:bg-green-900/10' : 'bg-red-50 dark:bg-red-900/10'}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                            answer.isCorrect ? 'bg-green-500' : 'bg-red-500'
                                        }`}>
                                            {answer.isCorrect ? (
                                                <CheckCircle className="h-5 w-5 text-white" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-white" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    Câu {index + 1}
                                                </span>
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                                    answer.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {answer.isCorrect ? `+${answer.points} điểm` : '0 điểm'}
                                                </span>
                                                {question && (
                                                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                        {question.type === 'multiple-choice' ? 'Trắc nghiệm' :
                                                         question.type === 'true-false' ? 'Đúng/Sai' : 'Trả lời ngắn'}
                                                    </span>
                                                )}
                                            </div>

                                            {question && (
                                                <p className="text-gray-900 dark:text-white mb-4">
                                                    {question.question}
                                                </p>
                                            )}

                                            {/* Multiple Choice */}
                                            {question?.type === 'multiple-choice' && question.options && (
                                                <div className="space-y-2 mb-4">
                                                    {question.options.map((opt: any, i: number) => {
                                                        const isSelected = answer.selectedOption === (opt._id || i.toString());
                                                        const isCorrect = opt.isCorrect;
                                                        return (
                                                            <div
                                                                key={i}
                                                                className={`p-3 rounded-lg border-2 ${
                                                                    isSelected && isCorrect
                                                                        ? 'border-green-500 bg-green-100 dark:bg-green-900/20'
                                                                        : isSelected && !isCorrect
                                                                        ? 'border-red-500 bg-red-100 dark:bg-red-900/20'
                                                                        : isCorrect
                                                                        ? 'border-green-300 bg-green-50 dark:bg-green-900/10'
                                                                        : 'border-gray-200 dark:border-gray-700'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-medium">
                                                                        {isSelected ? '✓ Bạn chọn' : isCorrect ? '✓ Đáp án đúng' : String.fromCharCode(65 + i)}
                                                                    </span>
                                                                    <span className="text-gray-700 dark:text-gray-300">{opt.text || `Option ${i + 1}`}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* True/False */}
                                            {question?.type === 'true-false' && question.trueFalseOptions && (
                                                <div className="space-y-2 mb-4">
                                                    {question.trueFalseOptions.map((opt: any, i: number) => {
                                                        const userAnswerTF = answer.trueFalseAnswers?.[i];
                                                        const isCorrect = opt.isCorrect;
                                                        const userSelected = userAnswerTF?.isTrue === true;
                                                        const userSelectedFalse = userAnswerTF?.isTrue === false;
                                                        return (
                                                            <div
                                                                key={i}
                                                                className={`p-3 rounded-lg border-2 ${
                                                                    (userSelected && isCorrect) || (userSelectedFalse && !isCorrect)
                                                                        ? 'border-green-500 bg-green-100 dark:bg-green-900/20'
                                                                        : (userSelected || userSelectedFalse)
                                                                        ? 'border-red-500 bg-red-100 dark:bg-red-900/20'
                                                                        : isCorrect
                                                                        ? 'border-green-300 bg-green-50 dark:bg-green-900/10'
                                                                        : 'border-gray-200 dark:border-gray-700'
                                                                }`}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-gray-700 dark:text-gray-300">{opt.text || `Câu ${i + 1}`}</span>
                                                                    <div className="flex gap-2">
                                                                        <span className={`px-2 py-1 text-xs rounded ${
                                                                            userSelected ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
                                                                        }`}>
                                                                            {userSelected ? 'Đúng' : 'Đúng'}
                                                                        </span>
                                                                        <span className={`px-2 py-1 text-xs rounded ${
                                                                            userSelectedFalse ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
                                                                        }`}>
                                                                            {userSelectedFalse ? 'Sai' : 'Sai'}
                                                                        </span>
                                                                        {isCorrect && (
                                                                            <span className="px-2 py-1 text-xs rounded bg-green-500 text-white">
                                                                                Đáp án đúng
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Short Answer */}
                                            {question?.type === 'short-answer' && (
                                                <div className="space-y-2 mb-4">
                                                    <div className={`p-3 rounded-lg border-2 ${
                                                        answer.isCorrect
                                                            ? 'border-green-500 bg-green-100 dark:bg-green-900/20'
                                                            : 'border-red-500 bg-red-100 dark:bg-red-900/20'
                                                    }`}>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-700 dark:text-gray-300">
                                                                Bạn trả lời: <span className="font-medium">{answer.shortAnswer}</span>
                                                            </span>
                                                            <span className="text-gray-500 dark:text-gray-400">
                                                                Đáp án đúng: <span className="font-medium">{question.correctAnswer}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Explanation */}
                                            {question?.explanation && (
                                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                    <div className="flex items-start gap-2">
                                                        <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                                                        <div>
                                                            <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                                                                Lời giải chi tiết:
                                                            </p>
                                                            <p className="text-blue-800 dark:text-blue-200 text-sm">
                                                                {question.explanation}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
