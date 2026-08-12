'use client';

import React from 'react';
import { ArrowDownToLine, ArrowUpFromLine, ArrowRight } from 'lucide-react';
import StaticContent from '@/components/common/StaticContent';
import { parseAlgorithmQuestionDisplay } from '@/lib/luyentap/algorithm-question-display';

interface AlgorithmQuestionPanelProps {
    question: string;
    /** Hiển thị intro (tiêu đề + yêu cầu) */
    showIntro?: boolean;
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
                <Icon className="w-4 h-4 shrink-0" strokeWidth={2.25} />
                <span className="text-sm font-bold tracking-wide">{label}</span>
            </div>
            <div className={`p-3 ${bodyBg}`}>
                <pre
                    className={`text-sm font-mono leading-relaxed whitespace-pre-wrap text-gray-800 rounded-lg border px-3 py-2.5 ${codeBg}`}
                >
                    {content}
                </pre>
            </div>
        </div>
    );
}

export default function AlgorithmQuestionPanel({
    question,
    showIntro = true,
    className = '',
}: AlgorithmQuestionPanelProps) {
    const parsed = parseAlgorithmQuestionDisplay(question);
    const hasIo = Boolean(parsed.inputDesc?.trim() || parsed.outputDesc?.trim());

    return (
        <div className={`space-y-5 ${className}`}>
            {showIntro && parsed.intro && (
                <StaticContent
                    content={parsed.intro}
                    className="prose prose-sm max-w-none text-gray-800 dark:prose-invert"
                />
            )}

            {hasIo && (
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                        Dữ liệu vào / ra
                    </p>
                    <div className="flex flex-col lg:flex-row lg:items-stretch gap-3">
                        {parsed.inputDesc?.trim() && (
                            <div className="flex-1 min-w-0">
                                <IoBlock kind="input" content={parsed.inputDesc} />
                            </div>
                        )}
                        {parsed.inputDesc?.trim() && parsed.outputDesc?.trim() && (
                            <div className="hidden lg:flex items-center justify-center shrink-0 px-1">
                                <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                                    <ArrowRight className="w-4 h-4 text-gray-500" />
                                </div>
                            </div>
                        )}
                        {parsed.outputDesc?.trim() && (
                            <div className="flex-1 min-w-0">
                                <IoBlock kind="output" content={parsed.outputDesc} />
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
            <p className="text-xs font-bold uppercase tracking-wider text-violet-600 mb-3">
                Test case mẫu
            </p>
            <div className="space-y-4">
                {samples.map((tc, i) => (
                    <div
                        key={i}
                        className="rounded-xl border border-violet-200 bg-violet-50/40 overflow-hidden"
                    >
                        <div className="px-4 py-2 bg-violet-600 text-white text-sm font-semibold">
                            Ví dụ {i + 1}
                        </div>
                        <div className="p-3 grid sm:grid-cols-2 gap-3">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700 mb-1.5">
                                    Input
                                </p>
                                <pre className="text-sm font-mono whitespace-pre-wrap bg-white border border-emerald-100 rounded-lg px-3 py-2 text-gray-800 min-h-[2.5rem]">
                                    {tc.input?.trim() || '(trống)'}
                                </pre>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wide text-sky-700 mb-1.5">
                                    Output
                                </p>
                                <pre className="text-sm font-mono whitespace-pre-wrap bg-white border border-sky-100 rounded-lg px-3 py-2 text-gray-800 min-h-[2.5rem]">
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
