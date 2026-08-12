'use client';

import React from 'react';
import { ArrowDownToLine, ArrowUpFromLine, ArrowRight, ClipboardList } from 'lucide-react';
import StaticContent from '@/components/common/StaticContent';
import { parseAlgorithmQuestionDisplay } from '@/lib/luyentap/algorithm-question-display';

interface AlgorithmQuestionPanelProps {
    question: string;
    /** Hiển thị phần intro (tiêu đề đề bài) */
    showIntro?: boolean;
    /** compact: nhãn in đậm; cards: khối màu đầu vào/ra tách biệt */
    variant?: 'compact' | 'cards';
    className?: string;
}

function IoBlock({
    kind,
    content,
}: {
    kind: 'input' | 'output';
    content: string;
}) {
    const isInput = kind === 'input';
    const Icon = isInput ? ArrowDownToLine : ArrowUpFromLine;
    const label = isInput ? 'Đầu vào' : 'Đầu ra';
    const border = isInput ? 'border-emerald-200' : 'border-sky-200';
    const headerBg = isInput ? 'bg-emerald-600' : 'bg-sky-600';
    const bodyBg = isInput ? 'bg-emerald-50/80' : 'bg-sky-50/80';
    const codeBg = isInput ? 'bg-white border-emerald-100' : 'bg-white border-sky-100';

    return (
        <div className={`rounded-xl border-2 ${border} overflow-hidden shadow-sm`}>
            <div className={`flex items-center gap-2 px-4 py-2.5 ${headerBg} text-white`}>
                <Icon className="h-4 w-4 shrink-0" strokeWidth={2.25} />
                <span className="text-sm font-bold tracking-wide">{label}</span>
            </div>
            <div className={`p-3 ${bodyBg}`}>
                <pre
                    className={`whitespace-pre-wrap rounded-lg border px-3 py-2.5 font-mono text-sm leading-relaxed text-gray-800 ${codeBg}`}
                >
                    {content}
                </pre>
            </div>
        </div>
    );
}

function RequirementBlock({ content }: { content: string }) {
    return (
        <div className="rounded-xl border-2 border-amber-200 overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 bg-amber-600 px-4 py-2.5 text-white">
                <ClipboardList className="h-4 w-4 shrink-0" strokeWidth={2.25} />
                <span className="text-sm font-bold tracking-wide">Yêu cầu</span>
            </div>
            <div className="bg-amber-50/80 p-3">
                <pre className="whitespace-pre-wrap rounded-lg border border-amber-100 bg-white px-3 py-2.5 font-mono text-sm leading-relaxed text-gray-800">
                    {content}
                </pre>
            </div>
        </div>
    );
}

export default function AlgorithmQuestionPanel({
    question,
    showIntro = true,
    variant = 'cards',
    className = '',
}: AlgorithmQuestionPanelProps) {
    const parsed = parseAlgorithmQuestionDisplay(question);
    const hasIo = Boolean(parsed.inputDesc?.trim() || parsed.outputDesc?.trim());
    const hasRequirement = Boolean(parsed.requirementDesc?.trim());

    if (variant === 'compact') {
        return (
            <div className={`space-y-4 ${className}`}>
                {showIntro && parsed.intro && (
                    <StaticContent
                        content={parsed.intro}
                        className="prose prose-sm max-w-none text-gray-800 dark:prose-invert"
                    />
                )}
                {hasRequirement && (
                    <RequirementBlock content={parsed.requirementDesc!} />
                )}
                {parsed.inputDesc?.trim() && (
                    <IoBlock kind="input" content={parsed.inputDesc} />
                )}
                {parsed.outputDesc?.trim() && (
                    <IoBlock kind="output" content={parsed.outputDesc} />
                )}
            </div>
        );
    }

    return (
        <div className={`space-y-5 ${className}`}>
            {showIntro && parsed.intro && (
                <StaticContent
                    content={parsed.intro}
                    className="prose prose-sm max-w-none text-gray-800 dark:prose-invert"
                />
            )}

            {(hasRequirement || hasIo) && (
                <div className="border-t border-slate-100 pt-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                        Yêu cầu & dữ liệu
                    </p>
                    <div className="space-y-3">
                        {hasRequirement && (
                            <RequirementBlock content={parsed.requirementDesc!} />
                        )}
                        {hasIo && (
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
                                {parsed.inputDesc?.trim() && (
                                    <div className="min-w-0 flex-1">
                                        <IoBlock kind="input" content={parsed.inputDesc} />
                                    </div>
                                )}
                                {parsed.inputDesc?.trim() && parsed.outputDesc?.trim() && (
                                    <div className="hidden shrink-0 items-center justify-center px-1 lg:flex">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-gray-100">
                                            <ArrowRight className="h-4 w-4 text-gray-500" />
                                        </div>
                                    </div>
                                )}
                                {parsed.outputDesc?.trim() && (
                                    <div className="min-w-0 flex-1">
                                        <IoBlock kind="output" content={parsed.outputDesc} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export function AlgorithmSampleTestPanel({
    testCases,
}: {
    testCases: Array<{ input?: string; expectedOutput?: string; isSample?: boolean }>;
}) {
    const samples = testCases.filter(
        (tc) => tc.isSample === true && Boolean(tc.input?.trim() || tc.expectedOutput?.trim()),
    );
    if (samples.length === 0) return null;

    return (
        <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-violet-600">
                Test case mẫu
            </p>
            <div className="space-y-4">
                {samples.map((tc, i) => (
                    <div
                        key={i}
                        className="overflow-hidden rounded-xl border border-violet-200 bg-violet-50/40"
                    >
                        <div className="bg-violet-600 px-4 py-2 text-sm font-semibold text-white">
                            Ví dụ {i + 1}
                        </div>
                        <div className="grid gap-3 p-3 sm:grid-cols-2">
                            <div>
                                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                                    Đầu vào
                                </p>
                                <pre className="min-h-[2.5rem] whitespace-pre-wrap rounded-lg border border-emerald-100 bg-white px-3 py-2 font-mono text-sm text-gray-800">
                                    {tc.input?.trim() || '(trống)'}
                                </pre>
                            </div>
                            <div>
                                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-sky-700">
                                    Đầu ra
                                </p>
                                <pre className="min-h-[2.5rem] whitespace-pre-wrap rounded-lg border border-sky-100 bg-white px-3 py-2 font-mono text-sm text-gray-800">
                                    {tc.expectedOutput?.trim() || '(trống)'}
                                </pre>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
