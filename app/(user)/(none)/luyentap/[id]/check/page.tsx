'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Trophy, CheckCircle, XCircle, ArrowLeft, RotateCcw, History, ChevronDown, ChevronUp } from 'lucide-react';
import { LUYENTAP_DATA } from '@/lib/data/luyentap.data';
import { CustomButton } from '@/components/custom/CustomButton';
import { getHistoryByExerciseId, LuyentapHistoryItem } from '@/lib/utils/luyentapHistory';

export default function LuyentapCheckPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const searchParams = useSearchParams();

    const score = parseFloat(searchParams.get('score') || '0');
    const total = parseInt(searchParams.get('total') || '0');
    const passed = searchParams.get('passed') === 'true';
    const coins = parseInt(searchParams.get('coins') || '0');

    const [showHistory, setShowHistory] = useState(false);
    const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

    const exercise = useMemo(() => {
        if (!id) return null;
        return LUYENTAP_DATA.find(ex => ex._id === id) || null;
    }, [id]);

    const history = useMemo(() => {
        if (!id) return [];
        return getHistoryByExerciseId(id as string);
    }, [id]);

    if (!exercise) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400">Không tìm thấy bài tập</p>
                    <Link href="/luyentap" className="text-blue-500 hover:underline mt-2 inline-block">
                        Quay lại danh sách
                    </Link>
                </div>
            </div>
        );
    }

    const correctCount = Math.round((score / 100) * total);
    const wrongCount = total - correctCount;
    const latestAttempt = history[0]; // Most recent attempt from localStorage

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-3xl mx-auto px-4 py-8">
                <Link
                    href={`/luyentap/${id}`}
                    className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại chi tiết bài tập
                </Link>

                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
                    {/* Header với gradient */}
                    <div className={`p-8 text-center ${passed
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                        : 'bg-gradient-to-r from-orange-400 to-red-500'
                        }`}>
                        <div className="flex justify-center mb-4">
                            {passed ? (
                                <Trophy className="w-24 h-24 text-white animate-bounce" />
                            ) : (
                                <RotateCcw className="w-24 h-24 text-white" />
                            )}
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-2">
                            {passed ? 'Xuất sắc!' : 'Cố gắng hơn lần sau!'}
                        </h1>
                        <p className="text-white text-opacity-90">
                            {passed
                                ? 'Bạn đã hoàn thành xuất sắc bài tập này'
                                : 'Đừng nản lòng, hãy thử lại nhé!'}
                        </p>
                    </div>

                    {/* Điểm số */}
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <div className={`inline-block text-7xl font-bold mb-2 ${passed ? 'text-green-500' : 'text-orange-500'
                                }`}>
                                {Math.round(score)}%
                            </div>
                            <p className="text-gray-500 dark:text-gray-400">
                                Điểm số của bạn
                            </p>
                        </div>

                        {/* Thống kê */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 text-center">
                                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                                    {total}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Tổng câu</p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 text-center">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                                        {correctCount}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Đúng</p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 text-center">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                                    <span className="text-3xl font-bold text-red-600 dark:text-red-400">
                                        {wrongCount}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Sai</p>
                            </div>
                        </div>

                        {/* Thông báo phần thưởng */}
                        {passed && coins > 0 && (
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-6 mb-8 border-2 border-yellow-200 dark:border-yellow-800">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-3xl">🎁</span>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">
                                            Phần thưởng đã nhận!
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Bạn đã vượt qua ngưỡng 80% để nhận thưởng
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-bold">
                                    <span className="text-2xl">💰</span>
                                    <span>+ {coins} xu</span>
                                </div>
                            </div>
                        )}

                        {/* Nút hành động */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <CustomButton
                                variant="outline"
                                onClick={() => router.push(`/luyentap/${id}/lambai`)}
                                className="flex-1"
                            >
                                <RotateCcw className="w-5 h-5" />
                                Làm lại
                            </CustomButton>
                            <CustomButton
                                onClick={() => router.push('/luyentap')}
                                className="flex-1"
                            >
                                Về danh sách bài tập
                            </CustomButton>
                        </div>
                    </div>
                </div>

                {/* Chi tiết đáp án của lần làm này */}
                {latestAttempt && (
                    <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl p-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Chi tiết đáp án
                        </h3>
                        <div className="space-y-4">
                            {latestAttempt.answers.map((answer, idx) => (
                                <div
                                    key={answer.questionId}
                                    className={`p-4 rounded-lg border-2 ${answer.isCorrect
                                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                                        : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold">
                                            {idx + 1}
                                        </span>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 dark:text-white mb-2">
                                                {answer.questionContent}
                                            </p>
                                            <div className="space-y-1 text-sm">
                                                <p className="flex items-center gap-2">
                                                    <span className="text-gray-600 dark:text-gray-400">Đáp án của bạn:</span>
                                                    <span className={answer.isCorrect ? 'text-green-700 dark:text-green-300 font-medium' : 'text-red-700 dark:text-red-300 font-medium'}>
                                                        {Array.isArray(answer.userAnswer) ? answer.userAnswer.join(', ') : answer.userAnswer || '(Không trả lời)'}
                                                    </span>
                                                </p>
                                                {!answer.isCorrect && (
                                                    <p className="flex items-center gap-2">
                                                        <span className="text-gray-600 dark:text-gray-400">Đáp án đúng:</span>
                                                        <span className="text-green-700 dark:text-green-300 font-medium">
                                                            {Array.isArray(answer.correctAnswer) ? answer.correctAnswer.join(', ') : answer.correctAnswer}
                                                        </span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {answer.isCorrect ? (
                                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Lịch sử làm bài */}
                {history.length > 0 && (
                    <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl p-6">
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="w-full flex items-center justify-between mb-4"
                        >
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <History className="w-5 h-5" />
                                Lịch sử làm bài ({history.length} lần)
                            </h3>
                            {showHistory ? (
                                <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                        </button>

                        {showHistory && (
                            <div className="space-y-3">
                                {history.map((item, index) => (
                                    <div key={item.id} className="border dark:border-gray-700 rounded-lg">
                                        <button
                                            onClick={() => setExpandedHistoryId(expandedHistoryId === item.id ? null : item.id)}
                                            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4 text-left">
                                                <span className={`text-2xl font-bold ${item.passed ? 'text-green-500' : 'text-orange-500'
                                                    }`}>
                                                    {Math.round(item.score)}%
                                                </span>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        Lần {history.length - index}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {new Date(item.timestamp).toLocaleString('vi-VN')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right text-sm">
                                                    <span className="text-green-600 dark:text-green-400">{item.correctCount}</span>
                                                    <span className="text-gray-400 mx-1">/</span>
                                                    <span className="text-red-600 dark:text-red-400">{item.wrongCount}</span>
                                                </div>
                                                {expandedHistoryId === item.id ? (
                                                    <ChevronUp className="w-4 h-4 text-gray-500" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                                )}
                                            </div>
                                        </button>

                                        {expandedHistoryId === item.id && (
                                            <div className="px-4 pb-4 space-y-2">
                                                {item.answers.map((answer, idx) => (
                                                    <div
                                                        key={answer.questionId}
                                                        className={`p-3 rounded text-sm ${answer.isCorrect
                                                            ? 'bg-green-50 dark:bg-green-900/10'
                                                            : 'bg-red-50 dark:bg-red-900/10'
                                                            }`}
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            <span className="font-medium text-gray-700 dark:text-gray-300">C{idx + 1}:</span>
                                                            <div className="flex-1">
                                                                <p className="text-gray-600 dark:text-gray-400 mb-1">
                                                                    {answer.questionContent.substring(0, 60)}...
                                                                </p>
                                                                <p className="text-xs">
                                                                    <span className="text-gray-500">Bạn chọn: </span>
                                                                    <span className={answer.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                                                        {Array.isArray(answer.userAnswer) ? answer.userAnswer.join(', ') : answer.userAnswer || '(Không trả lời)'}
                                                                    </span>
                                                                    {!answer.isCorrect && (
                                                                        <>
                                                                            <span className="text-gray-500 ml-2">• Đúng: </span>
                                                                            <span className="text-green-600 dark:text-green-400">
                                                                                {Array.isArray(answer.correctAnswer) ? answer.correctAnswer.join(', ') : answer.correctAnswer}
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </p>
                                                            </div>
                                                            {answer.isCorrect ? (
                                                                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                                            ) : (
                                                                <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}