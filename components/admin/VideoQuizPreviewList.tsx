'use client';

import { useMemo } from 'react';
import { Clock, Code2, Link2, ListChecks } from 'lucide-react';
import {
    parseContestQuestions,
    type ContestQuestion,
} from '@/components/custom/CustomEditorContest';
import { formatVideoQuizTime } from '@/lib/khoahoc/video-quiz.utils';
import { cn } from '@/lib/utils';

interface VideoQuizPreviewListProps {
    content: string;
    className?: string;
}

const TYPE_LABEL: Record<ContestQuestion['type'], string> = {
    'multiple-choice': 'Trắc nghiệm',
    'multiple-select': 'Nhiều đáp án',
    'true-false': 'Đúng / Sai',
    matching: 'Nối câu',
    'short-answer': 'Trả lời ngắn',
    essay: 'Tự luận',
    code: 'Code',
};

const TYPE_BADGE_CLASS: Record<ContestQuestion['type'], string> = {
    'multiple-choice': 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    'multiple-select': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
    'true-false': 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
    matching: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
    'short-answer': 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    essay: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    code: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const getTypeLabel = (q: ContestQuestion): string => {
    if (q.type === 'code') {
        return q.codeMode === 'web' ? 'Lập trình Web' : 'Lập trình';
    }
    return TYPE_LABEL[q.type];
};

const getOptionDisplay = (optLine: string) => {
    const cleaned = optLine.trim().replace(/^\*/, '');
    const match = cleaned.match(/^([A-Da-d])([).])\s*(.*)$/);
    if (!match) {
        return { letter: '?', text: optLine };
    }
    return { letter: match[1].toUpperCase(), text: match[3] };
};

const QuestionOptions = ({ question }: { question: ContestQuestion }) => {
    if (!question.options?.length) return null;

    return (
        <ul className="mt-2 space-y-1">
            {question.options.map((opt, index) => {
                const { letter, text } = getOptionDisplay(opt);
                const isCorrect = question.correctAnswers?.some(
                    (a) => a.toUpperCase() === letter || a.toLowerCase() === letter.toLowerCase()
                );

                return (
                    <li
                        key={`${question.id}-opt-${index}`}
                        className={cn(
                            'flex items-start gap-2 rounded-md px-2 py-1 text-sm',
                            isCorrect
                                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : 'text-gray-600 dark:text-gray-300'
                        )}
                    >
                        <span
                            className={cn(
                                'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-semibold',
                                isCorrect
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                            )}
                        >
                            {letter}
                        </span>
                        <span className="min-w-0 flex-1 break-words leading-snug">{text || '—'}</span>
                    </li>
                );
            })}
        </ul>
    );
};

const MatchingSummary = ({ question }: { question: ContestQuestion }) => {
    const pairCount = question.matchingPairs?.length ?? 0;
    const leftCount = question.leftItems?.length ?? 0;
    const rightCount = question.rightItems?.length ?? 0;

    if (!pairCount && !leftCount && !rightCount) return null;

    return (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Link2 className="h-3.5 w-3.5" />
            {leftCount > 0 && <span>{leftCount} mục trái</span>}
            {rightCount > 0 && <span>{rightCount} mục phải</span>}
            {pairCount > 0 && <span>{pairCount} cặp nối</span>}
        </div>
    );
};

const CodeSummary = ({ question }: { question: ContestQuestion }) => {
    const sampleCount = question.testCases?.filter((tc) => tc.isSample).length ?? 0;
    const hiddenCount = question.testCases?.filter((tc) => !tc.isSample).length ?? 0;
    const webCount = question.webRequirements?.length ?? 0;

    return (
        <div className="mt-2 space-y-2">
            {question.codeMode === 'algorithm' && question.algoRequirement ? (
                <p className="rounded-md bg-white/80 px-2.5 py-2 text-xs leading-relaxed text-gray-600 dark:bg-gray-900/60 dark:text-gray-300 line-clamp-4">
                    {question.algoRequirement}
                </p>
            ) : null}
            {question.codeMode === 'algorithm' && (question.algoInputDesc || question.algoOutputDesc) ? (
                <div className="grid gap-1 text-xs text-gray-500 dark:text-gray-400 sm:grid-cols-2">
                    {question.algoInputDesc ? (
                        <p>
                            <span className="font-medium text-gray-600 dark:text-gray-300">Đầu vào:</span>{' '}
                            {question.algoInputDesc}
                        </p>
                    ) : null}
                    {question.algoOutputDesc ? (
                        <p>
                            <span className="font-medium text-gray-600 dark:text-gray-300">Đầu ra:</span>{' '}
                            {question.algoOutputDesc}
                        </p>
                    ) : null}
                </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Code2 className="h-3.5 w-3.5" />
                {question.codeMode === 'web' && webCount > 0 ? (
                    <span>{webCount} yêu cầu web</span>
                ) : null}
                {sampleCount > 0 ? <span>{sampleCount} TC mẫu</span> : null}
                {hiddenCount > 0 ? <span>{hiddenCount} TC ẩn</span> : null}
                {question.language ? <span>Ngôn ngữ: {question.language}</span> : null}
            </div>
        </div>
    );
};

const ShortAnswerHint = ({ question }: { question: ContestQuestion }) => {
    if (question.type !== 'short-answer' || !question.correctAnswers?.length) return null;

    return (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            <ListChecks className="mr-1 inline h-3.5 w-3.5" />
            {question.correctAnswers.length} đáp án chấp nhận
        </p>
    );
};

export default function VideoQuizPreviewList({ content, className }: VideoQuizPreviewListProps) {
    const questions = useMemo(() => parseContestQuestions(content), [content]);

    if (!questions.length) {
        return (
            <p className="text-sm text-gray-400">
                Chưa có câu hỏi nào. Nhấn &quot;Soạn câu hỏi trong video&quot; để thêm.
            </p>
        );
    }

    return (
        <div className={cn('space-y-3', className)}>
            {questions.map((question) => (
                <article
                    key={question.id}
                    className="rounded-lg border border-gray-200 bg-gray-50/70 p-3.5 dark:border-gray-700 dark:bg-gray-800/40"
                >
                    <header className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex h-6 min-w-[1.75rem] items-center justify-center rounded-md bg-blue-600 px-2 text-xs font-bold text-white">
                            {question.number}
                        </span>
                        <span
                            className={cn(
                                'rounded-full px-2 py-0.5 text-xs font-medium',
                                TYPE_BADGE_CLASS[question.type]
                            )}
                        >
                            {getTypeLabel(question)}
                        </span>
                        {question.time != null && question.time > 0 ? (
                            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs text-gray-500 shadow-sm dark:bg-gray-900 dark:text-gray-400">
                                <Clock className="h-3 w-3" />
                                {formatVideoQuizTime(question.time)}
                            </span>
                        ) : null}
                    </header>

                    {question.content ? (
                        <p className="text-sm font-medium leading-relaxed text-gray-900 dark:text-gray-100">
                            {question.content}
                        </p>
                    ) : null}

                    <QuestionOptions question={question} />
                    <MatchingSummary question={question} />
                    <CodeSummary question={question} />
                    <ShortAnswerHint question={question} />
                </article>
            ))}
        </div>
    );
}
