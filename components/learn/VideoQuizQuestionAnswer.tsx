'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { CheckCircle, Code2, Monitor, XCircle } from 'lucide-react';
import RichContent from '@/components/learn/RichContent';
import CodeQuestionDisplay from '@/components/luyentap/CodeQuestionDisplay';
import MatchingQuestionPanel, { type MatchingPair } from '@/components/luyentap/MatchingQuestionPanel';
import WebCodeIdeOverlay from '@/components/luyentap/WebCodeIdeOverlay';
import AlgorithmCodeIdeOverlay from '@/components/luyentap/AlgorithmCodeIdeOverlay';
import type { WebRequirement } from '@/lib/luyentap/question-markdown';
import {
    getOptionLetter,
    getOptionText,
    getTrueFalseLetter,
    parseMatchingAnswer,
    serializeMatchingAnswer,
    videoQuizQuestionToPracticeStub,
    type VideoQuizPlaybackQuestion,
} from '@/lib/khoahoc/video-quiz-answer.utils';
import { cn } from '@/lib/utils';

const CustomEditor = dynamic(() => import('@/components/custom/CustomEditor'), {
    ssr: false,
    loading: () => (
        <div className="flex h-[160px] items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
            <span className="text-sm text-gray-400">Đang tải trình soạn...</span>
        </div>
    ),
});

interface VideoQuizQuestionAnswerProps {
    question: VideoQuizPlaybackQuestion;
    answer: string | null;
    answered: boolean;
    correct: boolean | null;
    onAnswerChange: (answer: string) => void;
}

function optionButtonClass(active: boolean, answered: boolean, isCorrect: boolean, isWrong: boolean) {
    if (answered) {
        if (isCorrect) return 'border-green-500 bg-green-50';
        if (isWrong) return 'border-red-500 bg-red-50';
        return 'border-gray-200 bg-gray-50';
    }
    if (active) return 'border-blue-500 bg-blue-50';
    return 'border-gray-200 bg-white hover:border-gray-300';
}

function letterClass(active: boolean, answered: boolean, isCorrect: boolean, isWrong: boolean) {
    if (answered) {
        if (isCorrect) return 'bg-green-500 text-white';
        if (isWrong) return 'bg-red-500 text-white';
        return 'bg-gray-200 text-gray-600';
    }
    if (active) return 'bg-blue-600 text-white';
    return 'bg-gray-100 text-gray-600';
}

export default function VideoQuizQuestionAnswer({
    question,
    answer,
    answered,
    correct,
    onAnswerChange,
}: VideoQuizQuestionAnswerProps) {
    const [ideOpen, setIdeOpen] = useState(false);
    const [tfAnswers, setTfAnswers] = useState<Record<string, boolean | null>>({});
    const [shortAnswerChars, setShortAnswerChars] = useState<string[]>([]);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const codeStub = useMemo(
        () => (question.type === 'code' ? videoQuizQuestionToPracticeStub(question) : null),
        [question],
    );

    const codeQuestionText = useMemo(() => {
        if (question.type !== 'code') return '';
        const parts = [question.question];
        if (question.algoRequirement) parts.push(`{yêu cầu: ${question.algoRequirement}}`);
        if (question.algoInputDesc) parts.push(`{đầu vào: ${question.algoInputDesc}}`);
        if (question.algoOutputDesc) parts.push(`{đầu ra: ${question.algoOutputDesc}}`);
        return parts.filter(Boolean).join('\n');
    }, [question]);

    const matchingLeftItems = useMemo(
        () => (question.leftItems || []).map((text) => ({ text })),
        [question.leftItems],
    );
    const matchingRightItems = useMemo(
        () => (question.rightItems || []).map((text) => ({ text })),
        [question.rightItems],
    );

    useEffect(() => {
        if (question.type === 'short-answer') {
            const len = Math.max(question.correctAnswers?.[0]?.length || 4, 1);
            setShortAnswerChars(new Array(len).fill(''));
            inputRefs.current = new Array(len).fill(null);
        }
    }, [question]);

    const handleTfChange = (letter: string, value: boolean) => {
        const next = { ...tfAnswers, [letter]: value };
        setTfAnswers(next);
        const answerStr = Object.entries(next)
            .filter(([, v]) => v !== null)
            .map(([k, v]) => `${k}:${v}`)
            .join(',');
        onAnswerChange(answerStr);
    };

    const handleCharChange = (index: number, value: string) => {
        if (value.length > 1) return;
        if (value && !/^[0-9a-zA-Z\-,]$/.test(value)) return;
        const next = [...shortAnswerChars];
        next[index] = value;
        setShortAnswerChars(next);
        onAnswerChange(next.join(''));
        if (value && index < next.length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleMatchingChange = (pairs: MatchingPair[]) => {
        onAnswerChange(serializeMatchingAnswer(pairs));
    };

    const toggleMultiSelect = (letter: string) => {
        const selected = new Set(
            (answer || '')
                .split(',')
                .map((s) => s.trim().toUpperCase())
                .filter(Boolean),
        );
        if (selected.has(letter)) selected.delete(letter);
        else selected.add(letter);
        onAnswerChange(Array.from(selected).sort().join(','));
    };

    if (question.type === 'code') {
        const codeValue = answer || '';
        const hasCode = codeValue.trim().length > 0;
        const isWeb = question.codeMode === 'web';

        return (
            <div className="space-y-4">
                <CodeQuestionDisplay
                    question={codeQuestionText}
                    codeMode={question.codeMode}
                    testCases={question.testCases}
                    webRequirements={(question.webRequirements || []) as WebRequirement[]}
                    variant="cards"
                    showSampleTests
                />
                <button
                    type="button"
                    onClick={() => !answered && setIdeOpen(true)}
                    disabled={answered}
                    className={cn(
                        'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60',
                        isWeb ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700',
                    )}
                >
                    {isWeb ? <Monitor className="h-4 w-4" /> : <Code2 className="h-4 w-4" />}
                    {hasCode ? 'Mở IDE (đã có code)' : 'Mở IDE làm bài'}
                </button>
                {codeStub && isWeb ? (
                    <WebCodeIdeOverlay
                        open={ideOpen}
                        onClose={() => setIdeOpen(false)}
                        question={codeStub}
                        value={codeValue}
                        onChange={onAnswerChange}
                        disabled={answered}
                    />
                ) : null}
                {codeStub && !isWeb ? (
                    <AlgorithmCodeIdeOverlay
                        open={ideOpen}
                        onClose={() => setIdeOpen(false)}
                        question={codeStub}
                        value={codeValue}
                        onChange={onAnswerChange}
                        disabled={answered}
                    />
                ) : null}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {question.type !== 'matching' && (
                <div className="text-base leading-relaxed text-gray-900">
                    <RichContent content={question.question} />
                </div>
            )}

            {question.type === 'multiple-choice' && question.options ? (
                <div className="space-y-3">
                    {question.options.map((opt, i) => {
                        const letter = getOptionLetter(opt, i);
                        const text = getOptionText(opt);
                        const isSelected = (answer || '').toUpperCase() === letter;
                        const isCorrectAnswer = answered && question.correctAnswers?.some((a) => a.toUpperCase() === letter);
                        const isWrongAnswer = answered && isSelected && !isCorrectAnswer;

                        return (
                            <button
                                key={i}
                                type="button"
                                onClick={() => !answered && onAnswerChange(letter)}
                                disabled={answered}
                                className={cn(
                                    'flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-all',
                                    optionButtonClass(isSelected, answered, !!isCorrectAnswer, !!isWrongAnswer),
                                )}
                            >
                                <span
                                    className={cn(
                                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold',
                                        letterClass(isSelected, answered, !!isCorrectAnswer, !!isWrongAnswer),
                                    )}
                                >
                                    {letter}
                                </span>
                                <span className="flex-1 text-gray-900">
                                    <RichContent content={text} />
                                </span>
                                {answered && isCorrectAnswer ? <CheckCircle className="h-5 w-5 shrink-0 text-green-500" /> : null}
                                {answered && isWrongAnswer ? <XCircle className="h-5 w-5 shrink-0 text-red-500" /> : null}
                            </button>
                        );
                    })}
                </div>
            ) : null}

            {question.type === 'multiple-select' && question.options ? (
                <div className="space-y-3">
                    <p className="text-sm text-gray-500">Chọn tất cả đáp án đúng</p>
                    {question.options.map((opt, i) => {
                        const letter = getOptionLetter(opt, i);
                        const text = getOptionText(opt);
                        const selected = (answer || '')
                            .split(',')
                            .map((s) => s.trim().toUpperCase())
                            .includes(letter);
                        const isCorrectAnswer = answered && question.correctAnswers?.some((a) => a.toUpperCase() === letter);
                        const isWrongAnswer = answered && selected && !isCorrectAnswer;
                        const missed = answered && !selected && isCorrectAnswer;

                        return (
                            <button
                                key={i}
                                type="button"
                                onClick={() => !answered && toggleMultiSelect(letter)}
                                disabled={answered}
                                className={cn(
                                    'flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-all',
                                    answered
                                        ? isCorrectAnswer && selected
                                            ? 'border-green-500 bg-green-50'
                                            : isWrongAnswer || missed
                                              ? 'border-red-500 bg-red-50'
                                              : 'border-gray-200 bg-gray-50'
                                        : selected
                                          ? 'border-indigo-500 bg-indigo-50'
                                          : 'border-gray-200 bg-white hover:border-gray-300',
                                )}
                            >
                                <span
                                    className={cn(
                                        'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs font-bold',
                                        selected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300 bg-white',
                                    )}
                                >
                                    {selected ? '✓' : ''}
                                </span>
                                <span className="font-bold text-gray-700">{letter}.</span>
                                <span className="flex-1 text-gray-900">
                                    <RichContent content={text} />
                                </span>
                            </button>
                        );
                    })}
                </div>
            ) : null}

            {question.type === 'true-false' && question.options ? (
                <div className="space-y-3">
                    {question.options.map((opt, i) => {
                        const letter = getTrueFalseLetter(opt, i);
                        const text = getOptionText(opt);
                        const userAnswer = tfAnswers[letter];

                        let correctValue: boolean | null = null;
                        const correctAnswers = question.correctAnswers || [];
                        if (correctAnswers[0]?.includes(':')) {
                            const entry = correctAnswers.find((ca) => ca.startsWith(`${letter}:`));
                            correctValue = entry ? entry.split(':')[1] === 'true' : null;
                        } else if (correctAnswers.length < 4 && !correctAnswers[0]?.includes('true') && !correctAnswers[0]?.includes('false')) {
                            correctValue = correctAnswers.includes(letter);
                        } else if (i < correctAnswers.length) {
                            correctValue = correctAnswers[i] === 'true';
                        }

                        const isCorrect = answered && userAnswer === correctValue;
                        const isWrong = answered && userAnswer !== null && userAnswer !== correctValue;

                        return (
                            <div
                                key={i}
                                className={cn(
                                    'flex flex-col gap-3 rounded-xl border-2 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4',
                                    answered
                                        ? isCorrect
                                            ? 'border-green-500 bg-green-50'
                                            : isWrong
                                              ? 'border-red-500 bg-red-50'
                                              : 'border-gray-200 bg-gray-50'
                                        : 'border-gray-200 bg-white',
                                )}
                            >
                                <div className="flex flex-1 items-center gap-3">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 font-bold text-gray-600">
                                        {letter.toUpperCase()}
                                    </span>
                                    <div className="flex-1 text-gray-900">
                                        <RichContent content={text} />
                                    </div>
                                </div>
                                <div className="flex gap-2 self-end sm:self-auto">
                                    {[true, false].map((val) => (
                                        <button
                                            key={String(val)}
                                            type="button"
                                            onClick={() => !answered && handleTfChange(letter, val)}
                                            disabled={answered}
                                            className={cn(
                                                'rounded-lg px-4 py-2 text-sm font-semibold transition-all',
                                                answered
                                                    ? correctValue === val
                                                        ? 'bg-green-500 text-white'
                                                        : userAnswer === val
                                                          ? 'bg-red-500 text-white'
                                                          : 'bg-gray-200 text-gray-500'
                                                    : userAnswer === val
                                                      ? val
                                                          ? 'bg-green-600 text-white'
                                                          : 'bg-red-600 text-white'
                                                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300',
                                            )}
                                        >
                                            {val ? 'Đúng' : 'Sai'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : null}

            {question.type === 'short-answer' ? (
                shortAnswerChars.length > 1 ? (
                    <div className="flex justify-center gap-2">
                        {shortAnswerChars.map((char, i) => (
                            <input
                                key={i}
                                ref={(el) => {
                                    inputRefs.current[i] = el;
                                }}
                                type="text"
                                value={char}
                                onChange={(e) => !answered && handleCharChange(i, e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Backspace' && !shortAnswerChars[i] && i > 0) {
                                        inputRefs.current[i - 1]?.focus();
                                    }
                                }}
                                disabled={answered}
                                maxLength={1}
                                className={cn(
                                    'h-14 w-12 rounded-lg border-2 text-center text-xl font-bold focus:outline-none',
                                    answered
                                        ? correct
                                            ? 'border-green-500 bg-green-50 text-green-700'
                                            : 'border-red-500 bg-red-50 text-red-700'
                                        : char
                                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                                          : 'border-gray-300 bg-white text-gray-900',
                                )}
                            />
                        ))}
                    </div>
                ) : (
                    <input
                        type="text"
                        value={answer || ''}
                        onChange={(e) => !answered && onAnswerChange(e.target.value)}
                        disabled={answered}
                        placeholder="Nhập câu trả lời..."
                        className="w-full max-w-md rounded-xl border-2 border-gray-300 px-4 py-3 font-mono text-lg tracking-wide focus:border-blue-500 focus:outline-none"
                    />
                )
            ) : null}

            {question.type === 'matching' ? (
                <div className="space-y-3">
                    <div className="text-base leading-relaxed text-gray-900">
                        <RichContent content={question.question} />
                    </div>
                    <MatchingQuestionPanel
                        leftItems={matchingLeftItems}
                        rightItems={matchingRightItems}
                        value={parseMatchingAnswer(answer)}
                        onChange={handleMatchingChange}
                        disabled={answered}
                    />
                </div>
            ) : null}

            {question.type === 'essay' ? (
                <div>
                    {answered ? (
                        <div className="prose prose-sm max-w-none rounded-xl border border-gray-200 p-4">
                            <RichContent content={answer || '<p class="text-gray-400">Chưa trả lời</p>'} />
                        </div>
                    ) : (
                        <CustomEditor
                            key={`essay-${question.time}`}
                            editorId={`video-quiz-essay-${question.time}`}
                            initialValue={answer || ''}
                            onChange={onAnswerChange}
                            placeholder="Nhập câu trả lời tự luận..."
                        />
                    )}
                </div>
            ) : null}
        </div>
    );
}
