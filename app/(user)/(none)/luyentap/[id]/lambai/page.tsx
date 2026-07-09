'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Check, X, ChevronRight, Trophy } from 'lucide-react';
import { LUYENTAP_DATA } from '@/lib/data/luyentap.data';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';
import { addHistoryItem, LuyentapHistoryItem } from '@/lib/utils/luyentapHistory';

interface AnswerRecord {
    questionId: string;
    answer: string | string[];
    isCorrect: boolean;
}

export default function LuyentapLamBaiPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { token, user } = useAuthStore();
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
    const [submitted, setSubmitted] = useState(false);

    const exercise = useMemo(() => {
        if (!id) return null;
        return LUYENTAP_DATA.find(ex => ex._id === id) || null;
    }, [id]);

    const totalQuestions = exercise?.questions.length || 0;
    const timeLimit = exercise?.duration || 30;
    const questions = exercise?.questions || [];

    // Reset timer when exercise changes
    useEffect(() => {
        setTimeLeft(timeLimit * 60);
    }, [timeLimit]);

    // Timer countdown
    useEffect(() => {
        if (submitted || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [submitted, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: value,
        }));
    };

    const handleSubmit = () => {
        if (!token) {
            toast.error('Vui lòng đăng nhập để làm bài');
            router.push('/login');
            return;
        }

        if (Object.keys(answers).length < questions.length) {
            if (!confirm('Bạn chưa trả lời hết các câu hỏi. Bạn có chắc muốn nộp bài?')) {
                return;
            }
        }

        setSubmitted(true);

        // Tính điểm
        const results = questions.map((q) => {
            const userAnswer = answers[q.id] || '';
            const isCorrect = Array.isArray(q.correctAnswer)
                ? (userAnswer as string[]).every(a => (q.correctAnswer as string[]).includes(a)) && (q.correctAnswer as string[]).length === (userAnswer as string[]).length
                : userAnswer === q.correctAnswer;
            return {
                questionId: q.id,
                question: q,
                userAnswer,
                correctAnswer: q.correctAnswer,
                isCorrect,
            };
        });

        const correctCount = results.filter(r => r.isCorrect).length;
        const percentage = (correctCount / questions.length) * 100;
        const randomCoins = percentage >= 80 ? Math.floor(Math.random() * 51) : 0;

        // Lưu vào localStorage
        const historyItem: LuyentapHistoryItem = {
            id: `${id}_${Date.now()}`,
            exerciseId: id as string,
            exerciseTitle: exercise?.title || '',
            score: percentage,
            totalQuestions: questions.length,
            correctCount,
            wrongCount: questions.length - correctCount,
            timestamp: new Date().toISOString(),
            answers: results.map(r => ({
                questionId: r.questionId,
                questionContent: r.question.content,
                userAnswer: r.userAnswer,
                correctAnswer: r.correctAnswer,
                isCorrect: r.isCorrect,
                questionType: r.question.type,
            })),
            passed: percentage >= 80,
            coinsEarned: randomCoins,
        };
        addHistoryItem(historyItem);

        if (percentage >= 80) {
            // Gửi request lên backend để cập nhật coins
            fetch('/api/user/add-coins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    coins: randomCoins,
                    exerciseId: id,
                    score: percentage,
                }),
            }).then(res => res.json()).then(data => {
                toast.success(`Bài làm xuất sắc! Bạn nhận được ${randomCoins} xu mới!`);
            }).catch(err => {
                console.error('Failed to add coins:', err);
                toast.success('Bài làm xuất sắc! Nhưng không thể thêm xu');
            });
        }

        router.push(`/luyentap/${id}/check?score=${percentage}&total=${questions.length}&passed=${percentage >= 80}&coins=${randomCoins}`);
    };

    if (!exercise) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400">Không tìm thấy bài tập</p>
                    <button
                        onClick={() => router.push('/luyentap')}
                        className="text-blue-500 hover:underline mt-2"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => router.push(`/luyentap/${id}`)}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Quay lại</span>
                    </button>

                    <div className={`flex items-center gap-2 font-mono font-bold text-lg ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                        <Clock className={`w-5 h-5 ${timeLeft < 60 ? 'animate-pulse' : ''}`} />
                        <span>{formatTime(timeLeft)}</span>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={Object.keys(answers).length < questions.length}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${Object.keys(answers).length >= questions.length
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Nộp bài
                    </button>
                </div>
            </div>

            {/* Progress bar */}
            <div className="bg-blue-500 h-1">
                <div
                    className="h-full bg-white transition-all duration-300"
                    style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
                />
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    {exercise.title}
                </h1>

                <div className="space-y-6">
                    {questions.map((q, index) => (
                        <div
                            key={q.id}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
                        >
                            <div className="flex items-start gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
                                    {index + 1}
                                </span>
                                <div className="flex-1">
                                    <p className="text-gray-900 dark:text-white font-medium mb-4">
                                        {q.content}
                                    </p>

                                    {q.options && (
                                        <div className="space-y-3">
                                            {q.options.map((option, optIndex) => {
                                                const isSelected = answers[q.id] === option;
                                                return (
                                                    <button
                                                        key={optIndex}
                                                        onClick={() => handleAnswerChange(q.id, option)}
                                                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${isSelected
                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected
                                                                ? 'border-blue-500 bg-blue-500'
                                                                : 'border-gray-300'
                                                                }`}>
                                                                {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                                            </div>
                                                            <span className={isSelected ? 'text-blue-900 dark:text-blue-100 font-medium' : 'text-gray-700 dark:text-gray-300'}>
                                                                {option}
                                                            </span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <button
                        onClick={handleSubmit}
                        disabled={Object.keys(answers).length < questions.length}
                        className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${Object.keys(answers).length >= questions.length
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                            : 'bg-gray-300 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Nộp bài ngay
                    </button>
                </div>
            </div>
        </div>
    );
}