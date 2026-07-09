'use client';

import React from 'react';
import StaticContent from '@/components/common/StaticContent';
import type { PracticeQuestion, PracticeAnswer } from '@/types/luyentap.type';

interface QuestionTakerProps {
    question: PracticeQuestion;
    index: number;
    answer?: PracticeAnswer['answer'];
    onChange: (answer: PracticeAnswer['answer']) => void;
    disabled?: boolean;
    showResult?: boolean;
    isCorrect?: boolean;
}

export default function QuestionTaker({
    question,
    index,
    answer,
    onChange,
    disabled = false,
    showResult = false,
    isCorrect,
}: QuestionTakerProps) {
    const qId = question._id || String(index);

    return (
        <div className={`rounded-2xl border p-4 sm:p-6 ${showResult ? (isCorrect ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50') : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'}`}>
            <div className="flex items-start gap-3 mb-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                    <StaticContent content={question.question} className="prose prose-sm max-w-none dark:prose-invert" />
                    <span className="text-xs text-gray-400 mt-1 inline-block">{question.points || 1} điểm</span>
                </div>
            </div>

            {question.type === 'quiz' && (
                <div className="space-y-2 ml-11">
                    {(question.options || []).map((opt, oi) => {
                        const selected = answer === oi;
                        return (
                            <button
                                key={oi}
                                type="button"
                                disabled={disabled}
                                onClick={() => onChange(oi)}
                                className={`w-full text-left px-4 py-3 rounded-xl border transition text-sm ${
                                    selected
                                        ? 'border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
                                } ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
                            >
                                <span className="font-semibold mr-2">{String.fromCharCode(65 + oi)}.</span>
                                <StaticContent content={opt.text} className="inline prose prose-sm" />
                            </button>
                        );
                    })}
                </div>
            )}

            {question.type === 'true-false' && (
                <div className="space-y-3 ml-11">
                    {(question.trueFalseOptions || []).map((opt, oi) => {
                        const optId = opt._id || String(oi);
                        const current = (answer as Array<{ optionId: string; answer: boolean }>) || [];
                        const entry = current.find(a => a.optionId === optId);
                        return (
                            <div key={optId} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                                <div className="flex-1 text-sm">
                                    <StaticContent content={opt.text} className="prose prose-sm" />
                                </div>
                                <div className="flex gap-2">
                                    {[true, false].map(val => (
                                        <button
                                            key={String(val)}
                                            type="button"
                                            disabled={disabled}
                                            onClick={() => {
                                                const next = current.filter(a => a.optionId !== optId);
                                                next.push({ optionId: optId, answer: val });
                                                onChange(next);
                                            }}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold border ${
                                                entry?.answer === val
                                                    ? val ? 'bg-green-100 border-green-400 text-green-800' : 'bg-red-100 border-red-400 text-red-800'
                                                    : 'border-gray-200 text-gray-600'
                                            }`}
                                        >
                                            {val ? 'Đúng' : 'Sai'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {question.type === 'short-answer' && (
                <div className="ml-11">
                    <input
                        type="text"
                        maxLength={question.maxLength || 4}
                        value={(answer as string) || ''}
                        onChange={e => onChange(e.target.value)}
                        disabled={disabled}
                        placeholder={`Tối đa ${question.maxLength || 4} ký tự (số, -, ,)`}
                        className="w-full max-w-xs px-4 py-3 rounded-xl border border-gray-200 font-mono text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
                    />
                </div>
            )}

            {question.type === 'essay' && (
                <div className="ml-11">
                    <textarea
                        value={(answer as string) || ''}
                        onChange={e => onChange(e.target.value)}
                        disabled={disabled}
                        rows={5}
                        placeholder="Nhập câu trả lời tự luận..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 resize-y min-h-[120px]"
                    />
                </div>
            )}

            {question.type === 'code' && (
                <div className="ml-0 sm:ml-11">
                    <textarea
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 resize-y min-h-[200px] font-mono text-sm"
                        value={(answer as string) ?? question.starterCode ?? ''}
                        onChange={e => onChange(e.target.value)}
                        disabled={disabled}
                        placeholder="Nhập code của bạn..."
                    />
                </div>
            )}
        </div>
    );
}
