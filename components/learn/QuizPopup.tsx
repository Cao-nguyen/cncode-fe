'use client';

import React, { useMemo } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { CustomButton } from '../custom/CustomButton';
import RichContent from './RichContent';
import VideoQuizQuestionAnswer from './VideoQuizQuestionAnswer';
import {
    isVideoQuizAnswerReady,
    normalizeVideoQuizPlaybackQuestion,
    type VideoQuizPlaybackQuestion,
} from '@/lib/khoahoc/video-quiz-answer.utils';

interface QuizPopupProps {
    question: VideoQuizPlaybackQuestion;
    answer: string | null;
    answered: boolean;
    correct: boolean | null;
    submitting?: boolean;
    onAnswerChange: (answer: string) => void;
    onSubmit: () => void;
    onContinue: () => void;
}

const TYPE_LABEL: Record<string, string> = {
    'multiple-choice': 'Trắc nghiệm',
    'multiple-select': 'Trắc nghiệm nhiều lựa chọn',
    'true-false': 'Đúng / Sai',
    matching: 'Nối câu',
    'short-answer': 'Trả lời ngắn',
    essay: 'Tự luận',
    code: 'Lập trình',
};

function getTypeLabel(question: VideoQuizPlaybackQuestion) {
    if (question.type === 'code') {
        return question.codeMode === 'web' ? 'Code web' : 'Code thuật toán';
    }
    return TYPE_LABEL[question.type] || question.type;
}

export default function QuizPopup({
    question,
    answer,
    answered,
    correct,
    submitting = false,
    onAnswerChange,
    onSubmit,
    onContinue,
}: QuizPopupProps) {
    const normalizedQuestion = useMemo(
        () => normalizeVideoQuizPlaybackQuestion(question),
        [question],
    );
    const canSubmit = isVideoQuizAnswerReady(normalizedQuestion, answer);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="border-b border-gray-200 p-4 sm:p-6">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900 sm:text-xl">Câu hỏi trong video</h3>
                        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                            {getTypeLabel(normalizedQuestion)}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500">Hãy trả lời câu hỏi để tiếp tục xem video</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <VideoQuizQuestionAnswer
                        question={normalizedQuestion}
                        answer={answer}
                        answered={answered}
                        correct={correct}
                        onAnswerChange={onAnswerChange}
                    />

                    {answered && correct !== null ? (
                        <div
                            className={`mt-6 flex items-start gap-3 rounded-xl p-4 ${
                                correct ? 'border-2 border-green-200 bg-green-50' : 'border-2 border-red-200 bg-red-50'
                            }`}
                        >
                            {correct ? (
                                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                            ) : (
                                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                            )}
                            <div className="flex-1">
                                <p className={`font-semibold ${correct ? 'text-green-900' : 'text-red-900'}`}>
                                    {correct ? 'Chính xác!' : 'Chưa chính xác'}
                                </p>
                                {normalizedQuestion.explanation ? (
                                    <div className={`mt-1 text-sm ${correct ? 'text-green-700' : 'text-red-700'}`}>
                                        <RichContent content={normalizedQuestion.explanation} />
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="border-t border-gray-200 p-4 sm:p-6">
                    {!answered ? (
                        <CustomButton
                            onClick={onSubmit}
                            variant="primary"
                            size="large"
                            className="w-full"
                            disabled={!canSubmit || submitting}
                        >
                            {submitting ? 'Đang kiểm tra...' : 'Kiểm tra kết quả'}
                        </CustomButton>
                    ) : (
                        <CustomButton onClick={onContinue} variant="primary" size="large" className="w-full">
                            Tiếp tục xem video
                        </CustomButton>
                    )}
                </div>
            </div>
        </div>
    );
}
