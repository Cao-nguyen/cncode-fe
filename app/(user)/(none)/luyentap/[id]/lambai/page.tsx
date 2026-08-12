'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Loader2 } from 'lucide-react';
import { luyentapApi } from '@/lib/api/luyentap.api';
import { mapBackendQuestion, buildSubmitPayload } from '@/lib/utils/luyentap.mapper';
import type { PracticeQuestion, PracticeAnswer } from '@/types/luyentap.type';
import QuestionTaker from '@/components/luyentap/QuestionTaker';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';

export default function LuyentapLamBaiPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { token } = useAuthStore();
    const startTimeRef = useRef(Date.now());

    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
    const [timeLimit, setTimeLimit] = useState(30);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [answers, setAnswers] = useState<Record<string, unknown>>({});

    const fetchExercise = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await luyentapApi.getExerciseForTaking(id);
            const data = res.data || res;
            setTitle(data.title);
            setTimeLimit(data.duration || 30);
            setTimeLeft((data.duration || 30) * 60);
            setQuestions((data.questions || []).map(mapBackendQuestion));
        } catch {
            toast.error('Không thể tải bài tập');
            router.push(`/luyentap/${id}`);
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        if (!token) {
            toast.error('Vui lòng đăng nhập để làm bài');
            router.push('/login');
            return;
        }
        fetchExercise();
    }, [token, fetchExercise, router]);

    const handleSubmit = useCallback(async () => {
        if (!id || submitting) return;

        const answered = Object.keys(answers).length;
        if (answered < questions.length) {
            if (!confirm('Bạn chưa trả lời hết các câu hỏi. Bạn có chắc muốn nộp bài?')) return;
        }

        setSubmitting(true);
        try {
            const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
            const payload = buildSubmitPayload(questions, answers);
            const res = await luyentapApi.submitExerciseAnswer(id, { answers: payload, timeSpent });
            const result = res.data || res;
            const answerId = result._id;
            const percentage = result.percentage ?? 0;
            const coins = result.coinsAwarded ?? 0;
            const passed = percentage >= 80;

            router.push(`/luyentap/${id}/check?answerId=${answerId}&score=${percentage}&passed=${passed}&coins=${coins}&total=${questions.length}`);
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Nộp bài thất bại');
        } finally {
            setSubmitting(false);
        }
    }, [id, submitting, answers, questions, router]);

    useEffect(() => {
        if (loading || timeLeft <= 0) return;
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
    }, [loading, timeLeft, handleSubmit]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 border-b sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button onClick={() => router.push(`/luyentap/${id}`)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="w-5 h-5" /> Quay lại
                    </button>
                    <div className={`flex items-center gap-2 font-mono font-bold text-lg ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
                        <Clock className="w-5 h-5" />
                        {formatTime(timeLeft)}
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-6 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 disabled:opacity-50"
                    >
                        {submitting ? 'Đang nộp...' : 'Nộp bài'}
                    </button>
                </div>
            </div>

            <div className="bg-blue-500 h-1">
                <div className="h-full bg-white transition-all" style={{ width: `${(Object.keys(answers).length / Math.max(questions.length, 1)) * 100}%` }} />
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{title}</h1>
                <div className="space-y-6">
                    {questions.map((q, index) => (
                        <QuestionTaker
                            key={q._id || index}
                            question={q}
                            index={index}
                            answer={answers[q._id!] as PracticeAnswer['answer']}
                            onChange={(val) => setAnswers((prev) => ({ ...prev, [q._id!]: val }))}
                        />
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg disabled:opacity-50"
                    >
                        {submitting ? 'Đang nộp bài...' : 'Nộp bài ngay'}
                    </button>
                </div>
            </div>
        </div>
    );
}
