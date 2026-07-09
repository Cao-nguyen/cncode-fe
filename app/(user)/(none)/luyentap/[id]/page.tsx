'use client';

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, PlayCircle, Clock, BookOpen, Trophy, History, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';
import { LUYENTAP_DATA, LuyentapExercise } from '@/lib/data/luyentap.data';
import { CustomButton } from '@/components/custom/CustomButton';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';
import { getHistoryByExerciseId } from '@/lib/utils/luyentapHistory';

export default function LuyentapDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { token } = useAuthStore();
    const [showHistory, setShowHistory] = useState(false);

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

    const questionTypes = exercise.questions.reduce((acc, q) => {
        acc[q.type] = (acc[q.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const bestScore = history.length > 0
        ? Math.max(...history.map(h => h.score))
        : 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <Link
                    href="/luyentap"
                    className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại danh sách
                </Link>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                {exercise.tier === 'tin11' ? 'Tin 11' : 'Tin 10'}
                            </span>
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                {exercise.status}
                            </span>
                            {history.length > 0 && (
                                <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                                    Đã làm {history.length} lần
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            {exercise.title}
                        </h1>

                        {exercise.description && (
                            <p className="text-gray-600 dark:text-gray-400 mb-8">
                                {exercise.description}
                            </p>
                        )}

                        <div className="grid grid-cols-4 gap-4 mb-8">
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
                                <BookOpen className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {exercise.questions.length}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Câu hỏi</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
                                <Clock className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {exercise.duration}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Phút</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
                                <Trophy className="w-6 h-6 mx-auto mb-2 text-green-500" />
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    80%
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Đạt</p>
                            </div>
                            {history.length > 0 && (
                                <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 text-center border-2 border-purple-200 dark:border-purple-800">
                                    <Trophy className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">
                                        {Math.round(bestScore)}%
                                    </p>
                                    <p className="text-sm text-purple-700 dark:text-purple-400">Cao nhất</p>
                                </div>
                            )}
                        </div>

                        <div className="mb-8">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Phân loại câu hỏi:
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(questionTypes).map(([type, count]) => (
                                    <span
                                        key={type}
                                        className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                                    >
                                        {type === 'tracnghiem' ? 'Trắc nghiệm' :
                                            type === 'dungsai' ? 'Đúng/Sai' : 'Trả lời ngắn'}: {count} câu
                                    </span>
                                ))}
                            </div>
                        </div>

                        <CustomButton
                            className="w-full sm:w-auto"
                            onClick={() => {
                                if (!token) {
                                    toast.error('Vui lòng đăng nhập để làm bài');
                                    router.push('/login');
                                    return;
                                }
                                router.push(`/luyentap/${id}/lambai`);
                            }}
                        >
                            <PlayCircle className="w-5 h-5" />
                            {history.length > 0 ? 'Làm lại bài tập' : 'Bắt đầu làm bài'}
                        </CustomButton>
                    </div>
                </div>

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
                                    <div
                                        key={item.id}
                                        className="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <span className={`text-3xl font-bold ${item.passed ? 'text-green-500' : 'text-orange-500'
                                                    }`}>
                                                    {Math.round(item.score)}%
                                                </span>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        Lần {history.length - index} {index === 0 && '(Gần nhất)'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {new Date(item.timestamp).toLocaleString('vi-VN')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                        <span className="text-green-600 dark:text-green-400 font-medium">{item.correctCount}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                                        <span className="text-red-600 dark:text-red-400 font-medium">{item.wrongCount}</span>
                                                    </div>
                                                </div>
                                                {item.coinsEarned && item.coinsEarned > 0 && (
                                                    <div className="px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-medium">
                                                        +{item.coinsEarned} xu
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        📋 Nội dung bài tập
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        {exercise.questions.map((q, idx) => (
                            <div key={q.id} className="flex items-start gap-2">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 flex items-center justify-center text-xs font-medium">
                                    {idx + 1}
                                </span>
                                <span className="flex-1">
                                    {q.content.length > 80 ? q.content.substring(0, 80) + '...' : q.content}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}