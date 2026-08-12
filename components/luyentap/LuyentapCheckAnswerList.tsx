'use client';

import React, { useMemo } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import StaticContent from '@/components/common/StaticContent';
import CodeQuestionDisplay from '@/components/luyentap/CodeQuestionDisplay';
import MatchingQuestionReview from '@/components/luyentap/MatchingQuestionReview';
import WebCodeAnswerReview from '@/components/luyentap/WebCodeAnswerReview';
import { formatGroupTitleDisplay } from '@/lib/luyentap/exercise-display.utils';
import { cn } from '@/lib/utils';

export interface CheckAnswerItem {
    questionId?: string;
    isCorrect: boolean;
    points: number;
    feedback?: string;
    selectedOption?: string;
    selectedOptions?: string[];
    matchingAnswers?: Array<{ leftIndex: number; rightIndex: number }>;
    trueFalseAnswers?: Array<{ optionIndex: number; isTrue: boolean }>;
    shortAnswer?: string;
    essayAnswer?: string;
    codeAnswer?: string;
    needsManualGrading?: boolean;
    question?: {
        _id?: string;
        type?: string;
        question?: string;
        explanation?: string;
        groupTitle?: string;
        options?: Array<{ _id?: string; text: string; isCorrect?: boolean }>;
        trueFalseOptions?: Array<{ _id?: string; text: string; isCorrect?: boolean }>;
        correctAnswer?: string;
        leftItems?: Array<{ text: string }>;
        rightItems?: Array<{ text: string }>;
        matchingPairs?: Array<{ leftIndex: number; rightIndex: number }>;
        sampleAnswer?: string;
        codeMode?: 'algorithm' | 'web';
        starterCode?: string;
        language?: string;
        testCases?: Array<{ _id?: string; input?: string; expectedOutput?: string; isSample?: boolean }>;
        webRequirements?: Array<{
            type: 'has-tag' | 'has-text' | 'has-style' | 'contains';
            selector?: string;
            tag?: string;
            property?: string;
            value?: string;
            text?: string;
        }>;
    };
}

interface ExerciseQuestion {
    _id?: string;
    type?: string;
    question?: string;
    groupTitle?: string;
    options?: Array<{ _id?: string; text: string; isCorrect?: boolean }>;
    trueFalseOptions?: Array<{ _id?: string; text: string; isCorrect?: boolean }>;
    correctAnswer?: string;
    leftItems?: Array<{ text: string }>;
    rightItems?: Array<{ text: string }>;
    matchingPairs?: Array<{ leftIndex: number; rightIndex: number }>;
    explanation?: string;
    sampleAnswer?: string;
    codeMode?: 'algorithm' | 'web';
    starterCode?: string;
    language?: string;
    testCases?: Array<{ _id?: string; input?: string; expectedOutput?: string; isSample?: boolean }>;
    webRequirements?: Array<{
        type: 'has-tag' | 'has-text' | 'has-style' | 'contains';
        selector?: string;
        tag?: string;
        property?: string;
        value?: string;
        text?: string;
    }>;
}

interface LuyentapCheckAnswerListProps {
    answers: CheckAnswerItem[];
    exerciseQuestions?: ExerciseQuestion[];
    correctCount: number;
    wrongCount: number;
    totalQuestions: number;
    desktopFill?: boolean;
}

function optionLetter(index: number) {
    return String.fromCharCode(65 + index);
}

function subLetter(index: number) {
    return String.fromCharCode(97 + index);
}

function formatQuestionId(id?: string) {
    if (!id) return '—';
    const raw = String(id);
    return raw.length > 9 ? raw.slice(-9) : raw;
}

function normalizeQuestionType(type?: string) {
    if (type === 'quiz' || type === 'multiple-choice') return 'multiple-choice';
    return type || '';
}

function isWebCodeSubmission(codeAnswer?: string, codeMode?: string) {
    if (codeMode === 'web') return true;
    const trimmed = codeAnswer?.trim();
    if (!trimmed?.startsWith('{')) return false;
    try {
        const parsed = JSON.parse(trimmed) as Record<string, unknown>;
        return 'html' in parsed || 'css' in parsed || 'js' in parsed;
    } catch {
        return false;
    }
}

function resolveOrderedAnswers(
    answers: CheckAnswerItem[],
    exerciseQuestions?: ExerciseQuestion[],
): CheckAnswerItem[] {
    if (!exerciseQuestions?.length) return answers;

    const byId = new Map(
        answers.map((item) => [String(item.questionId), item]),
    );

    return exerciseQuestions
        .map((question) => {
            const answer = byId.get(String(question._id));
            if (!answer) {
                return {
                    questionId: question._id,
                    isCorrect: false,
                    points: 0,
                    question: { ...question },
                } satisfies CheckAnswerItem;
            }
            return {
                ...answer,
                question: {
                    ...question,
                    ...(answer.question || {}),
                },
            };
        });
}

function groupAnswers(items: CheckAnswerItem[]) {
    const groups: Array<{ title: string; items: CheckAnswerItem[] }> = [];
    let currentTitle = '';
    let currentItems: CheckAnswerItem[] = [];

    items.forEach((item) => {
        const title = item.question?.groupTitle?.trim() || '';
        if (title !== currentTitle) {
            if (currentItems.length) {
                groups.push({ title: currentTitle, items: currentItems });
            }
            currentTitle = title;
            currentItems = [item];
            return;
        }
        currentItems.push(item);
    });

    if (currentItems.length) {
        groups.push({ title: currentTitle, items: currentItems });
    }

    return groups;
}

function StudentAnswerHighlight({
    isCorrect,
    children,
    className,
}: {
    isCorrect: boolean;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'mt-4 rounded-lg px-3.5 py-2.5',
                isCorrect ? 'bg-emerald-50/90' : 'bg-red-50/90',
                className,
            )}
        >
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--cn-text-muted)]">
                Bài làm
            </p>
            {children}
        </div>
    );
}

function MultipleChoiceSummary({
    options,
    selectedOption,
    isCorrect,
}: {
    options: Array<{ _id?: string; text: string; isCorrect?: boolean }>;
    selectedOption?: string;
    isCorrect: boolean;
}) {
    const correctIndex = options.findIndex((opt) => opt.isCorrect);
    const selectedIndex = options.findIndex(
        (opt) => String(opt._id) === String(selectedOption),
    );
    const correctLabel = correctIndex >= 0 ? optionLetter(correctIndex) : '—';
    const tone = isCorrect ? 'success' : 'danger';

    return (
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <span className={cn(
                'text-sm font-semibold',
                tone === 'success' ? 'text-emerald-600' : 'text-red-600',
            )}>
                Đáp án đúng: {correctLabel}
            </span>
            <div className={cn(
                'inline-flex items-center gap-2 rounded border px-2.5 py-1 text-sm font-semibold tracking-wide',
                tone === 'success'
                    ? 'border-emerald-300 text-emerald-700'
                    : 'border-red-300 text-red-700',
            )}>
                {options.map((opt, index) => {
                    const label = optionLetter(index);
                    const isCorrectOpt = Boolean(opt.isCorrect);
                    const isSelected = index === selectedIndex;
                    const showWrongMark = isSelected && !isCorrectOpt;

                    return (
                        <span key={opt._id || index} className="inline-flex items-center gap-0.5">
                            {isCorrectOpt && (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                            )}
                            <span>{label}</span>
                            {showWrongMark && (
                                <X className="h-3.5 w-3.5 text-red-600" aria-hidden />
                            )}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}

function MultipleSelectSummary({
    options,
    selectedOptions,
    isCorrect,
}: {
    options: Array<{ _id?: string; text: string; isCorrect?: boolean }>;
    selectedOptions?: string[];
    isCorrect: boolean;
}) {
    const selectedSet = new Set((selectedOptions || []).map(String));
    const correctLabels = options
        .map((opt, index) => (opt.isCorrect ? optionLetter(index) : null))
        .filter(Boolean)
        .join(', ') || '—';
    const tone = isCorrect ? 'success' : 'danger';

    return (
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <span className={cn(
                'text-sm font-semibold',
                tone === 'success' ? 'text-emerald-600' : 'text-red-600',
            )}>
                Đáp án đúng: {correctLabels}
            </span>
            <div className={cn(
                'inline-flex flex-wrap items-center gap-2 rounded border px-2.5 py-1 text-sm font-semibold tracking-wide',
                tone === 'success'
                    ? 'border-emerald-300 text-emerald-700'
                    : 'border-red-300 text-red-700',
            )}>
                {options.map((opt, index) => {
                    const label = optionLetter(index);
                    const isCorrectOpt = Boolean(opt.isCorrect);
                    const isSelected = selectedSet.has(String(opt._id));
                    const showWrongMark = isSelected && !isCorrectOpt;
                    const showMissed = !isSelected && isCorrectOpt;

                    return (
                        <span key={opt._id || index} className="inline-flex items-center gap-0.5">
                            {(isCorrectOpt && isSelected) && (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                            )}
                            <span className={cn(
                                showMissed && 'text-amber-600',
                                showWrongMark && 'text-red-600',
                            )}>
                                {label}
                            </span>
                            {showWrongMark && (
                                <X className="h-3.5 w-3.5 text-red-600" aria-hidden />
                            )}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}

function TrueFalseSummary({
    options,
    userAnswers,
}: {
    options: Array<{ text: string; isCorrect?: boolean }>;
    userAnswers?: Array<{ optionIndex: number; isTrue: boolean }>;
}) {
    const answerMap = new Map(
        (userAnswers || []).map((entry) => [entry.optionIndex, entry.isTrue]),
    );

    const wrongLabels: string[] = [];

    return (
        <div className="space-y-1 text-right text-sm">
            <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                <span className="font-semibold text-[var(--cn-text-main)]">Đáp án đúng:</span>
                {options.map((opt, index) => (
                    <span key={index} className="font-semibold text-emerald-600">
                        {subLetter(index)}) {opt.isCorrect ? 'Đúng' : 'Sai'}
                    </span>
                ))}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                <span className="font-semibold text-[var(--cn-text-main)]">Thí sinh chọn:</span>
                {options.map((opt, index) => {
                    const userChoice = answerMap.get(index);
                    const correct = opt.isCorrect;
                    const isItemCorrect = userChoice === correct;
                    if (!isItemCorrect) wrongLabels.push(`${subLetter(index)})`);

                    return (
                        <span
                            key={index}
                            className={cn(
                                'font-semibold',
                                isItemCorrect ? 'text-emerald-600' : 'text-red-600',
                            )}
                        >
                            {subLetter(index)}) {userChoice === true ? 'Đúng' : userChoice === false ? 'Sai' : '—'}
                        </span>
                    );
                })}
            </div>
            {wrongLabels.length > 0 && (
                <div className="flex flex-wrap items-center justify-end gap-x-2">
                    <span className="font-semibold text-[var(--cn-text-main)]">Câu làm sai:</span>
                    {wrongLabels.map((label) => (
                        <span key={label} className="font-semibold text-red-600">{label}</span>
                    ))}
                </div>
            )}
        </div>
    );
}

function CheckQuestionCard({
    item,
    index,
}: {
    item: CheckAnswerItem;
    index: number;
}) {
    const question = item.question;
    const type = normalizeQuestionType(question?.type);
    const options = question?.options || [];
    const tfOptions = question?.trueFalseOptions || [];

    return (
        <article className="border-b border-[var(--cn-border)] px-4 py-5 last:border-b-0 md:px-6">
            <div className="mb-3 flex flex-wrap items-baseline gap-2">
                <h3 className="text-sm font-bold text-[var(--cn-text-main)]">
                    Câu {index + 1}
                </h3>
                <span className="text-xs text-[var(--cn-text-muted)]">
                    ID: {formatQuestionId(item.questionId || question?._id)}
                </span>
            </div>

            {question?.question && (
                type === 'code' ? (
                    <CodeQuestionDisplay
                        question={question.question}
                        codeMode={question.codeMode}
                        testCases={question.testCases}
                        webRequirements={question.webRequirements}
                        variant="cards"
                        showSampleTests
                    />
                ) : (
                    <StaticContent
                        content={question.question}
                        className="prose prose-sm max-w-none text-[var(--cn-text-main)]"
                    />
                )
            )}

            {type === 'multiple-choice' && options.length > 0 && (
                <div className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                    {options.map((opt, optIndex) => (
                        <div key={opt._id || optIndex} className="text-sm text-[var(--cn-text-main)]">
                            <span className="font-semibold">{optionLetter(optIndex)}.</span>{' '}
                            <StaticContent content={opt.text} className="inline prose prose-sm max-w-none" />
                        </div>
                    ))}
                </div>
            )}

            {type === 'multiple-select' && options.length > 0 && (
                <div className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                    {options.map((opt, optIndex) => (
                        <div key={opt._id || optIndex} className="text-sm text-[var(--cn-text-main)]">
                            <span className="font-semibold">{optionLetter(optIndex)}.</span>{' '}
                            <StaticContent content={opt.text} className="inline prose prose-sm max-w-none" />
                        </div>
                    ))}
                </div>
            )}

            {type === 'true-false' && tfOptions.length > 0 && (
                <div className="mt-4 space-y-2">
                    {tfOptions.map((opt, optIndex) => (
                        <div key={optIndex} className="text-sm text-[var(--cn-text-main)]">
                            <span className="font-semibold">{subLetter(optIndex)})</span>{' '}
                            <StaticContent content={opt.text} className="inline prose prose-sm max-w-none" />
                        </div>
                    ))}
                </div>
            )}

            {type === 'matching' && (
                <MatchingQuestionReview
                    leftItems={question?.leftItems || []}
                    rightItems={question?.rightItems || []}
                    userPairs={item.matchingAnswers || []}
                    correctPairs={question?.matchingPairs || []}
                />
            )}

            {type === 'short-answer' && (
                <StudentAnswerHighlight isCorrect={item.isCorrect}>
                    <p className={cn(
                        'text-base font-semibold tracking-wide',
                        item.isCorrect ? 'text-emerald-700' : 'text-red-700',
                    )}>
                        {item.shortAnswer || '—'}
                    </p>
                    {!item.isCorrect && question?.correctAnswer && (
                        <p className="mt-2 text-sm text-emerald-700">
                            Đáp án đúng: <span className="font-semibold">{question.correctAnswer}</span>
                        </p>
                    )}
                </StudentAnswerHighlight>
            )}

            {(type === 'essay' || type === 'code') && (
                <StudentAnswerHighlight isCorrect={item.isCorrect}>
                    {type === 'essay' && item.essayAnswer && (
                        <StaticContent
                            content={item.essayAnswer}
                            className="prose prose-sm max-w-none text-[var(--cn-text-main)]"
                            compact
                        />
                    )}
                    {type === 'code' && item.codeAnswer && (
                        isWebCodeSubmission(item.codeAnswer, question?.codeMode) ? (
                            <WebCodeAnswerReview
                                codeAnswer={item.codeAnswer}
                                starterCode={question?.starterCode}
                            />
                        ) : (
                            <pre className={cn(
                                'max-w-full overflow-x-auto whitespace-pre-wrap font-mono text-base font-semibold leading-relaxed',
                                item.isCorrect ? 'text-emerald-800' : 'text-red-800',
                            )}>
                                {item.codeAnswer}
                            </pre>
                        )
                    )}
                    {!item.essayAnswer && !item.codeAnswer && (
                        <p className="text-sm italic text-[var(--cn-text-muted)]">Chưa trả lời</p>
                    )}
                </StudentAnswerHighlight>
            )}

            {(type === 'essay' || type === 'code') && (item.feedback || item.needsManualGrading) && (
                <div className="mt-3">
                    {item.feedback && type === 'essay' && !item.needsManualGrading
                        && !['Chờ giáo viên chấm tự luận', 'Chưa trả lời'].includes(item.feedback) && (
                        <div className="rounded-xl border border-violet-100 bg-violet-50/60 px-3.5 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-700">
                                Nhận xét câu này
                            </p>
                            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                                {item.feedback}
                            </p>
                        </div>
                    )}
                    {item.feedback && (type !== 'essay' || item.needsManualGrading
                        || ['Chờ giáo viên chấm tự luận', 'Chưa trả lời'].includes(item.feedback)) && (
                        <p className={cn(
                            'text-sm font-medium',
                            item.isCorrect ? 'text-emerald-600' : 'text-[var(--cn-text-sub)]',
                        )}>
                            {item.feedback}
                        </p>
                    )}
                    {item.needsManualGrading && (
                        <p className="mt-2 text-sm font-medium text-amber-700">Chờ giáo viên chấm</p>
                    )}
                </div>
            )}

            <div className="mt-5">
                {type === 'multiple-choice' && (
                    <MultipleChoiceSummary
                        options={options}
                        selectedOption={item.selectedOption}
                        isCorrect={item.isCorrect}
                    />
                )}
                {type === 'multiple-select' && (
                    <MultipleSelectSummary
                        options={options}
                        selectedOptions={item.selectedOptions}
                        isCorrect={item.isCorrect}
                    />
                )}
                {type === 'true-false' && (
                    <TrueFalseSummary
                        options={tfOptions}
                        userAnswers={item.trueFalseAnswers}
                    />
                )}
                {(type === 'matching' || type === 'short-answer' || type === 'essay' || type === 'code') && (
                    <div className="text-right">
                        <span className={cn(
                            'text-sm font-semibold',
                            item.isCorrect ? 'text-emerald-600' : 'text-red-600',
                        )}>
                            {item.isCorrect ? 'Đúng' : 'Sai'}
                            {item.points > 0 && ` · ${item.points} điểm`}
                        </span>
                    </div>
                )}
            </div>

            {question?.explanation && (
                <div className="mt-4 rounded-lg bg-[var(--cn-bg-section)] px-3 py-2.5">
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--cn-text-muted)]">
                        Giải thích
                    </p>
                    <StaticContent
                        content={question.explanation}
                        className="prose prose-sm max-w-none text-[var(--cn-text-main)]"
                        compact
                    />
                </div>
            )}
        </article>
    );
}

export default function LuyentapCheckAnswerList({
    answers,
    exerciseQuestions,
    correctCount,
    wrongCount,
    totalQuestions,
    desktopFill = false,
}: LuyentapCheckAnswerListProps) {
    const orderedAnswers = useMemo(
        () => resolveOrderedAnswers(answers, exerciseQuestions),
        [answers, exerciseQuestions],
    );

    const groups = useMemo(
        () => groupAnswers(orderedAnswers),
        [orderedAnswers],
    );

    const sectionClass = cn(
        'overflow-hidden rounded-2xl border border-[var(--cn-border)] bg-[var(--cn-bg-card)] shadow-sm',
        desktopFill && 'lg:flex lg:h-full lg:flex-col',
    );
    const headerClass = cn(
        'border-b border-[var(--cn-border)] px-5 py-4 md:px-6',
        desktopFill && 'lg:shrink-0',
    );
    const bodyClass = cn(desktopFill && 'lg:min-h-0 lg:flex-1 lg:overflow-y-auto');

    if (orderedAnswers.length === 0) {
        return (
            <section className={sectionClass}>
                <div className={headerClass}>
                    <h2 className="text-base font-semibold text-[var(--cn-text-main)]">
                        Chi tiết đáp án
                    </h2>
                </div>
                <p className="px-5 py-10 text-center text-sm text-[var(--cn-text-muted)] md:px-6">
                    Không có dữ liệu chi tiết câu trả lời
                </p>
            </section>
        );
    }

    let questionCounter = 0;

    return (
        <section className={sectionClass}>
            <div className={headerClass}>
                <h2 className="text-base font-semibold text-[var(--cn-text-main)]">
                    Chi tiết đáp án
                </h2>
                <p className="mt-0.5 text-xs text-[var(--cn-text-muted)]">
                    {correctCount} đúng · {wrongCount} sai · {totalQuestions} câu
                </p>
            </div>

            <div className={bodyClass}>
                {groups.map((group, groupIndex) => (
                    <div key={`${group.title}-${groupIndex}`}>
                        {group.title && (
                            <div className="border-b border-[var(--cn-border)] bg-[var(--cn-bg-section)] px-4 py-2.5 md:px-6">
                                <h3 className="text-sm font-bold text-[var(--cn-text-main)]">
                                    {formatGroupTitleDisplay(group.title)} ({group.items.length} câu)
                                </h3>
                            </div>
                        )}
                        {group.items.map((item) => {
                            const index = questionCounter;
                            questionCounter += 1;
                            return (
                                <CheckQuestionCard
                                    key={String(item.questionId || index)}
                                    item={item}
                                    index={index}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </section>
    );
}
