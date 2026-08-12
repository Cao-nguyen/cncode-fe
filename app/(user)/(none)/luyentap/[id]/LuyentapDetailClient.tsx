'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, PlayCircle, Clock, BookOpen, Trophy, History, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { luyentapApi } from '@/lib/api/luyentap.api';
import { mapBackendExercise } from '@/lib/utils/luyentap.mapper';
import { CustomButton } from '@/components/custom/CustomButton';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';
import { getQuestionTypeLabel } from '@/types/luyentap.type';

interface LuyentapDetailClientProps {
    exerciseId: string;
}

export default function LuyentapDetailClient({ exerciseId }: LuyentapDetailClientProps) {
    const router = useRouter();
    const { token } = useAuthStore();
    const [exercise, setExercise] = useState<ReturnType<typeof mapBackendExercise> | null>(null);
    const [history, setHistory] = useState<Array<{ _id: string; percentage: number; submittedAt: string; coinsAwarded: number }>>([]);
    const [loading, setLoading] = useState(true);
    const [showHistory, setShowHistory] = useState(false);

    const fetchData = useCallback(async () => {
        if (!exerciseId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const data = await luyentapApi.getPublicExerciseById(exerciseId);
            if (!data?._id) {
                setExercise(null);
                return;
            }
            setExercise(mapBackendExercise(data));

            if (token) {
                try {
                    const histRes = await luyentapApi.getUserExerciseHistory(exerciseId);
                    setHistory(histRes.data || histRes || []);
                } catch {
                    setHistory([]);
                }
            }
        } catch {
            toast.error('Không tải được bài tập');
            setExercise(null);
        } finally {
            setLoading(false);
        }
    }, [exerciseId, token]);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
    }

    if (!exercise) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500">Không tìm thấy bài tập</p>
                    <Link href="/luyentap" className="text-blue-500 hover:underline mt-2 inline-block">Quay lại danh sách</Link>
                </div>
            </div>
        );
    }

    const questionTypes = (exercise.questions || []).reduce((acc, q) => {
        acc[q.type] = (acc[q.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const bestScore = history.length > 0 ? Math.max(...history.map((h) => h.percentage)) : 0;
    const passThreshold = exercise.passThreshold || 80;

    const handleStart = () => {
        if (!token) {
            toast.error('Vui lòng đăng nhập để làm bài');
            router.push('/login');
            return;
        }
        router.push(`/luyentap/${exerciseId}/lambai`);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <Link href="/luyentap" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
                    <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
                </Link>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-4 flex-wrap">
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                {exercise.tier === 'pro' ? 'VIP' : 'Free'}
                            </span>
                            {history.length > 0 && (
                                <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                                    Đã làm {history.length} lần
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{exercise.title}</h1>
                        {exercise.description && <p className="text-gray-600 dark:text-gray-400 mb-8">{exercise.description}</p>}

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
                                <BookOpen className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                                <p className="text-2xl font-bold">{exercise.questionCount || exercise.questions?.length || 0}</p>
                                <p className="text-sm text-gray-500">Câu hỏi</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
                                <Clock className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                                <p className="text-2xl font-bold">{exercise.duration || exercise.timeLimit}</p>
                                <p className="text-sm text-gray-500">Phút</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
                                <Trophy className="w-6 h-6 mx-auto mb-2 text-green-500" />
                                <p className="text-2xl font-bold">{passThreshold}%</p>
                                <p className="text-sm text-gray-500">Đạt</p>
                            </div>
                            {history.length > 0 && (
                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center border-2 border-purple-200">
                                    <Trophy className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                                    <p className="text-2xl font-bold text-purple-900">{Math.round(bestScore)}%</p>
                                    <p className="text-sm text-purple-700">Cao nhất</p>
                                </div>
                            )}
                        </div>

                        {Object.keys(questionTypes).length > 0 && (
                            <div className="mb-8">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Loại câu hỏi</h3>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(questionTypes).map(([type, count]) => (
                                        <span key={type} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300">
                                            {getQuestionTypeLabel(type)}: {count}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <CustomButton onClick={handleStart} className="w-full sm:w-auto">
                            <PlayCircle className="w-5 h-5" />
                            {history.length > 0 ? 'Làm lại bài tập' : 'Bắt đầu làm bài'}
                        </CustomButton>
                    </div>
                </div>

                {history.length > 0 && (
                    <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl p-6">
                        <button onClick={() => setShowHistory(!showHistory)} className="w-full flex items-center justify-between">
                            <h3 className="font-bold flex items-center gap-2"><History className="w-5 h-5" /> Lịch sử ({history.length})</h3>
                            {showHistory ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                        {showHistory && (
                            <div className="mt-4 space-y-2">
                                {history.map((item, i) => (
                                    <Link key={item._id} href={`/luyentap/${exerciseId}/check?answerId=${item._id}`}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700">
                                        <span className="text-sm text-gray-600">Lần {history.length - i}</span>
                                        <span className={`font-bold ${item.percentage >= passThreshold ? 'text-green-600' : 'text-orange-500'}`}>
                                            {Math.round(item.percentage)}%
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
