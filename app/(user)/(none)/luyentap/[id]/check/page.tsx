'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Trophy, CheckCircle, XCircle, ArrowLeft, RotateCcw, Loader2 } from 'lucide-react';
import { luyentapApi } from '@/lib/api/luyentap.api';
import { CustomButton } from '@/components/custom/CustomButton';
import StaticContent from '@/components/common/StaticContent';

export default function LuyentapCheckPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const searchParams = useSearchParams();
    const answerId = searchParams.get('answerId');
    const scoreParam = parseFloat(searchParams.get('score') || '0');
    const passedParam = searchParams.get('passed') === 'true';
    const coinsParam = parseInt(searchParams.get('coins') || '0');
    const totalParam = parseInt(searchParams.get('total') || '0');

    const [loading, setLoading] = useState(!!answerId);
    const [result, setResult] = useState<{
        percentage: number;
        passed: boolean;
        coinsAwarded: number;
        totalQuestions: number;
        correctCount: number;
        answers: Array<{
            isCorrect: boolean;
            points: number;
            feedback?: string;
            question?: { question: string; explanation?: string };
            selectedOption?: string;
            shortAnswer?: string;
            essayAnswer?: string;
            codeAnswer?: string;
        }>;
    } | null>(null);

    useEffect(() => {
        if (!answerId || !id) {
            setResult({
                percentage: scoreParam,
                passed: passedParam,
                coinsAwarded: coinsParam,
                totalQuestions: totalParam,
                correctCount: Math.round((scoreParam / 100) * totalParam),
                answers: [],
            });
            setLoading(false);
            return;
        }

        const fetchResult = async () => {
            try {
                const res = await luyentapApi.getUserAnswer(id, answerId);
                const data = res.data || res;
                const answers = data.answers || [];
                const correctCount = answers.filter((a: { isCorrect: boolean }) => a.isCorrect).length;
                setResult({
                    percentage: data.percentage,
                    passed: data.percentage >= 80,
                    coinsAwarded: data.coinsAwarded || 0,
                    totalQuestions: answers.length,
                    correctCount,
                    answers,
                });
            } catch {
                setResult({
                    percentage: scoreParam,
                    passed: passedParam,
                    coinsAwarded: coinsParam,
                    totalQuestions: totalParam,
                    correctCount: Math.round((scoreParam / 100) * totalParam),
                    answers: [],
                });
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [answerId, id, scoreParam, passedParam, coinsParam, totalParam]);

    if (loading || !result) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
    }

    const { percentage, passed, coinsAwarded, totalQuestions, correctCount, answers } = result;
    const wrongCount = totalQuestions - correctCount;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-3xl mx-auto px-4 py-8">
                <Link href={`/luyentap/${id}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
                    <ArrowLeft className="w-4 h-4" /> Quay lại chi tiết bài tập
                </Link>

                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
                    <div className={`p-8 text-center ${passed ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-orange-400 to-red-500'}`}>
                        <Trophy className={`w-24 h-24 text-white mx-auto mb-4 ${passed ? 'animate-bounce' : ''}`} />
                        <h1 className="text-4xl font-bold text-white mb-2">{passed ? 'Xuất sắc!' : 'Cố gắng hơn lần sau!'}</h1>
                        <p className="text-white/90">{passed ? 'Bạn đã hoàn thành xuất sắc bài tập này' : 'Đừng nản lòng, hãy thử lại nhé!'}</p>
                    </div>

                    <div className="p-8">
                        <div className="text-center mb-8">
                            <div className={`text-7xl font-bold mb-2 ${passed ? 'text-green-500' : 'text-orange-500'}`}>
                                {Math.round(percentage)}%
                            </div>
                            <p className="text-gray-500">Điểm số của bạn</p>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="bg-blue-50 rounded-2xl p-6 text-center">
                                <div className="text-3xl font-bold text-blue-600">{totalQuestions}</div>
                                <p className="text-sm text-gray-600">Tổng câu</p>
                            </div>
                            <div className="bg-green-50 rounded-2xl p-6 text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                    <span className="text-3xl font-bold text-green-600">{correctCount}</span>
                                </div>
                                <p className="text-sm text-gray-600">Đúng</p>
                            </div>
                            <div className="bg-red-50 rounded-2xl p-6 text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <XCircle className="w-6 h-6 text-red-600" />
                                    <span className="text-3xl font-bold text-red-600">{wrongCount}</span>
                                </div>
                                <p className="text-sm text-gray-600">Sai</p>
                            </div>
                        </div>

                        {passed && coinsAwarded > 0 && (
                            <div className="bg-yellow-50 rounded-2xl p-6 mb-8 border-2 border-yellow-200 text-center">
                                <p className="font-bold text-gray-900">🎁 Phần thưởng: +{coinsAwarded} xu</p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4">
                            <CustomButton variant="outline" onClick={() => router.push(`/luyentap/${id}/lambai`)} className="flex-1">
                                <RotateCcw className="w-5 h-5" /> Làm lại
                            </CustomButton>
                            <CustomButton onClick={() => router.push('/luyentap')} className="flex-1">
                                Về danh sách
                            </CustomButton>
                        </div>
                    </div>
                </div>

                {answers.length > 0 && (
                    <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl p-6">
                        <h3 className="font-bold mb-4">Chi tiết đáp án</h3>
                        <div className="space-y-4">
                            {answers.map((answer, idx) => (
                                <div key={idx} className={`p-4 rounded-lg border-2 ${answer.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                                    <div className="flex items-start gap-3">
                                        <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                                        <div className="flex-1">
                                            {answer.question?.question && (
                                                <StaticContent content={answer.question.question} className="prose prose-sm mb-2" />
                                            )}
                                            {answer.feedback && <p className="text-xs text-gray-500">{answer.feedback}</p>}
                                        </div>
                                        {answer.isCorrect
                                            ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                            : <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
