'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import QuestionTaker from '@/components/luyentap/QuestionTaker';
import { submitExercise } from '@/lib/api/khoahoc.api';
import {
    buildCourseExerciseSubmitPayload,
    buildInitialCourseExerciseAnswers,
    exerciseQuestionsToPracticeQuestions,
    isCourseExerciseAnswerReady,
} from '@/lib/khoahoc/course-exercise-answer.utils';
import type { Exercise, ExerciseSubmitResult } from '@/types/khoahoc.type';
import type { PracticeAnswer } from '@/types/luyentap.type';
import { toast } from 'sonner';

interface CourseExercisePanelProps {
    exercise: Exercise;
    onSubmitSuccess?: (result: ExerciseSubmitResult) => void;
}

export default function CourseExercisePanel({ exercise, onSubmitSuccess }: CourseExercisePanelProps) {
    const questions = useMemo(
        () => exerciseQuestionsToPracticeQuestions(exercise.questions || []),
        [exercise.questions],
    );

    const [answers, setAnswers] = useState<Record<string, PracticeAnswer['answer']>>(() =>
        buildInitialCourseExerciseAnswers(questions),
    );
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<ExerciseSubmitResult | null>(null);

    const resultByQuestionId = useMemo(() => {
        const map = new Map<string, boolean>();
        result?.results?.forEach((item) => {
            map.set(String(item.questionId), item.isCorrect);
        });
        return map;
    }, [result]);

    const allAnswered = useMemo(
        () => questions.every((question) => isCourseExerciseAnswerReady(question, answers[question._id!])),
        [answers, questions],
    );

    const handleAnswerChange = useCallback((questionId: string, value: PracticeAnswer['answer']) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
        setResult(null);
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!allAnswered || submitting) return;

        setSubmitting(true);
        try {
            const payload = buildCourseExerciseSubmitPayload(questions, answers);
            const response = await submitExercise(exercise._id, { answers: payload });
            setResult(response);
            onSubmitSuccess?.(response);

            if (response.isCorrect) {
                toast.success('Tuyệt vời! Bạn đã hoàn thành đúng bài tập.');
            } else if (exercise.mustPassToNext) {
                toast.error('Một số câu chưa đúng. Hãy xem lại và thử lại.');
            } else {
                toast.info('Đã nộp bài. Bạn có thể tiếp tục sang bài học kế tiếp.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Nộp bài tập thất bại, vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    }, [allAnswered, answers, exercise._id, exercise.mustPassToNext, onSubmitSuccess, questions, submitting]);

    if (questions.length === 0) {
        return <div className="text-sm text-gray-600">Chưa có bài tập cho bài học này.</div>;
    }

    const correctCount = result?.results?.filter((item) => item.isCorrect).length ?? 0;

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 sm:gap-6">
            {exercise.mustPassToNext && !result?.canProceed && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Bạn cần trả lời đúng tất cả câu hỏi để chuyển sang bài tiếp theo.
                </div>
            )}

            <div className="space-y-4 sm:space-y-6">
                {questions.map((question, index) => (
                    <QuestionTaker
                        key={question._id}
                        question={question}
                        index={index}
                        answer={answers[question._id!]}
                        onChange={(value) => handleAnswerChange(question._id!, value)}
                        disabled={submitting}
                        showResult={Boolean(result)}
                        isCorrect={resultByQuestionId.get(String(question._id))}
                    />
                ))}
            </div>

            {result && (
                <div
                    className={`flex items-start gap-3 rounded-2xl border p-4 text-sm ${
                        result.isCorrect
                            ? 'border-green-200 bg-green-50 text-green-700'
                            : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                >
                    {result.isCorrect ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                    ) : (
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                    )}
                    <div>
                        <p className="font-semibold">
                            {result.isCorrect
                                ? 'Tuyệt vời! Bạn đã hoàn thành đúng bài tập.'
                                : `Bạn trả lời đúng ${correctCount}/${questions.length} câu.`}
                        </p>
                        {result.totalScore !== undefined && result.maxScore !== undefined && (
                            <p className="mt-1 text-xs opacity-80">
                                Điểm: {result.totalScore}/{result.maxScore}
                            </p>
                        )}
                    </div>
                </div>
            )}

            <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !allAnswered}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Nộp bài tập
            </button>
        </div>
    );
}
