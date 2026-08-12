'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import WebCodeIdeOverlay from './WebCodeIdeOverlay';
import AlgorithmCodeIdeOverlay from './AlgorithmCodeIdeOverlay';
import CodeQuestionDisplay from './CodeQuestionDisplay';
import MatchingQuestionPanel from './MatchingQuestionPanel';
import StaticContent from '@/components/common/StaticContent';
import type { PracticeQuestion, PracticeAnswer } from '@/types/luyentap.type';
import { parseWebProject, serializeWebProject } from '@/lib/luyentap/web-project';
import { Monitor, Code2, Loader2 } from 'lucide-react';

const CustomEditor = dynamic(() => import('@/components/custom/CustomEditor'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-[200px] rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
    ),
});

function resolveCodeAnswerValue(answer: unknown, starterCode?: string): string {
    if (typeof answer === 'string') return answer;
    if (answer && typeof answer === 'object' && ('html' in answer || 'css' in answer || 'js' in answer)) {
        const project = answer as { html?: string; css?: string; js?: string };
        return serializeWebProject({
            html: typeof project.html === 'string' ? project.html : '',
            css: typeof project.css === 'string' ? project.css : '',
            js: typeof project.js === 'string' ? project.js : '',
        });
    }
    return typeof starterCode === 'string' ? starterCode : '';
}

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
    const isWebCode = question.type === 'code' && question.codeMode === 'web';
    const [ideOpen, setIdeOpen] = useState(false);
    const codeValue = resolveCodeAnswerValue(answer, question.starterCode);
    const webProject = isWebCode ? parseWebProject(codeValue, question.starterCode) : null;
    const hasWebCode = webProject
        ? Boolean(webProject.html.trim() || webProject.css.trim() || webProject.js.trim())
        : Boolean(codeValue.trim());
    const hasAlgoCode = Boolean(codeValue.trim());
    const essayEditorId = `essay-${question._id ?? index}`;

    return (
        <div className={`rounded-2xl border p-4 sm:p-6 ${showResult ? (isCorrect ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50') : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'}`}>
            <div className="flex items-start gap-3 mb-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                    {question.type === 'code' ? (
                        <CodeQuestionDisplay
                            question={question.question}
                            codeMode={question.codeMode}
                            testCases={question.testCases}
                            webRequirements={question.webRequirements}
                            variant="cards"
                            showSampleTests
                        />
                    ) : (
                        <StaticContent content={question.question} className="prose prose-sm max-w-none dark:prose-invert" />
                    )}
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

            {question.type === 'multiple-select' && (
                <div className="space-y-2 ml-11">
                    {(question.options || []).map((opt, oi) => {
                        const selected = Array.isArray(answer) && (answer as number[]).includes(oi);
                        return (
                            <button
                                key={oi}
                                type="button"
                                disabled={disabled}
                                onClick={() => {
                                    const current = Array.isArray(answer) ? [...(answer as number[])] : [];
                                    const next = current.includes(oi)
                                        ? current.filter((i) => i !== oi)
                                        : [...current, oi];
                                    onChange(next);
                                }}
                                className={`w-full text-left px-4 py-3 rounded-xl border transition text-sm ${
                                    selected
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-600'
                                } ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
                            >
                                <span className={`inline-flex w-5 h-5 mr-2 align-middle items-center justify-center rounded border text-xs font-bold ${selected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300'}`}>
                                    {selected ? '✓' : ''}
                                </span>
                                <span className="font-semibold mr-2">{String.fromCharCode(65 + oi)}.</span>
                                <StaticContent content={opt.text} className="inline prose prose-sm" />
                            </button>
                        );
                    })}
                </div>
            )}

            {question.type === 'matching' && (
                <div className="ml-0 sm:ml-11">
                    <MatchingQuestionPanel
                        leftItems={question.leftItems || []}
                        rightItems={question.rightItems || []}
                        value={(answer as Array<{ leftIndex: number; rightIndex: number }>) || []}
                        onChange={onChange}
                        disabled={disabled}
                    />
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
                <div className="ml-0 sm:ml-11">
                    {disabled || showResult ? (
                        <StaticContent
                            content={(answer as string) || '<p class="text-gray-400 italic">Chưa trả lời</p>'}
                            className="prose prose-sm max-w-none dark:prose-invert rounded-xl border border-gray-200 p-4 dark:border-gray-700"
                        />
                    ) : (
                        <CustomEditor
                            key={essayEditorId}
                            editorId={essayEditorId}
                            initialValue={(answer as string) || ''}
                            onChange={(content) => onChange(content)}
                            placeholder="Nhập câu trả lời tự luận..."
                        />
                    )}
                </div>
            )}

            {question.type === 'code' && (
                <div className="ml-0 sm:ml-11">
                    {isWebCode ? (
                        <>
                            <button
                                type="button"
                                onClick={() => setIdeOpen(true)}
                                disabled={disabled}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold disabled:opacity-50 transition-colors"
                            >
                                <Monitor className="w-4 h-4" />
                                {hasWebCode ? 'Mở IDE (đã có code)' : 'Mở IDE'}
                            </button>
                            <WebCodeIdeOverlay
                                open={ideOpen}
                                onClose={() => setIdeOpen(false)}
                                question={question}
                                value={codeValue}
                                onChange={onChange}
                                disabled={disabled}
                            />
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={() => setIdeOpen(true)}
                                disabled={disabled}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50 transition-colors"
                            >
                                <Code2 className="w-4 h-4" />
                                {hasAlgoCode ? 'Mở IDE (đã có code)' : 'Mở IDE'}
                            </button>
                            <AlgorithmCodeIdeOverlay
                                open={ideOpen}
                                onClose={() => setIdeOpen(false)}
                                question={question}
                                value={codeValue}
                                onChange={onChange}
                                disabled={disabled}
                            />
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
