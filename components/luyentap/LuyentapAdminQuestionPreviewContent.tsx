'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import StaticContent from '@/components/common/StaticContent';
import CodeQuestionDisplay from '@/components/luyentap/CodeQuestionDisplay';
import type { AdminQuestionPreview } from '@/lib/api/luyentap.api';
import { cn } from '@/lib/utils';

function optionLetter(index: number) {
    return String.fromCharCode(65 + index);
}

function subLetter(index: number) {
    return String.fromCharCode(97 + index);
}

function questionTypeLabel(type?: string) {
    switch (type) {
        case 'multiple-choice': return 'Trắc nghiệm 1 đáp án';
        case 'multiple-select': return 'Trắc nghiệm nhiều đáp án';
        case 'true-false': return 'Đúng / Sai';
        case 'matching': return 'Ghép cặp';
        case 'short-answer': return 'Trả lời ngắn';
        case 'essay': return 'Tự luận';
        case 'code': return 'Lập trình';
        default: return type || 'Câu hỏi';
    }
}

function SectionBlock({
    title,
    children,
    className,
}: {
    title: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('mt-5', className)}>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">{title}</p>
            {children}
        </div>
    );
}

function CodeTestCasesPanel({
    testCases,
}: {
    testCases: Array<{ input?: string; expectedOutput?: string; isSample?: boolean }>;
}) {
    if (!testCases.length) return null;

    return (
        <SectionBlock title="Test case">
            <div className="space-y-3">
                {testCases.map((testCase, index) => (
                    <div
                        key={index}
                        className="overflow-hidden rounded-xl border border-violet-200 bg-violet-50/30"
                    >
                        <div className="flex items-center justify-between bg-violet-600 px-4 py-2 text-sm font-semibold text-white">
                            <span>Test case {index + 1}</span>
                            {testCase.isSample && (
                                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase">
                                    Mẫu
                                </span>
                            )}
                        </div>
                        <div className="grid gap-3 p-3 sm:grid-cols-2">
                            <div>
                                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                                    Đầu vào
                                </p>
                                <pre className="min-h-[3rem] overflow-x-auto whitespace-pre-wrap rounded-lg border border-emerald-100 bg-white px-3 py-2 font-mono text-sm leading-relaxed text-slate-800">
                                    {testCase.input?.trim() || '(trống)'}
                                </pre>
                            </div>
                            <div>
                                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-sky-700">
                                    Đầu ra mong đợi
                                </p>
                                <pre className="min-h-[3rem] overflow-x-auto whitespace-pre-wrap rounded-lg border border-sky-100 bg-white px-3 py-2 font-mono text-sm leading-relaxed text-slate-800">
                                    {testCase.expectedOutput?.trim() || '(trống)'}
                                </pre>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </SectionBlock>
    );
}

export default function LuyentapAdminQuestionPreviewContent({
    preview,
}: {
    preview: AdminQuestionPreview;
}) {
    const type = preview.type || '';
    const options = preview.options || [];
    const tfOptions = preview.trueFalseOptions || [];

    return (
        <div className="space-y-1">
            <div className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                {questionTypeLabel(type)}
                {preview.points != null && ` · ${preview.points} điểm`}
            </div>

            {preview.question && (
                type === 'code' ? (
                    <div className="mt-3">
                        <CodeQuestionDisplay
                            question={preview.question}
                            codeMode={preview.codeMode}
                            webRequirements={preview.webRequirements}
                            variant="cards"
                            showSampleTests={false}
                        />
                    </div>
                ) : (
                    <StaticContent
                        content={preview.question}
                        className="prose prose-sm mt-3 max-w-none text-slate-800"
                    />
                )
            )}

            {(type === 'multiple-choice' || type === 'multiple-select') && options.length > 0 && (
                <SectionBlock title="Phương án">
                    <div className="space-y-2">
                        {options.map((opt, index) => (
                            <div
                                key={opt._id || index}
                                className={cn(
                                    'flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm',
                                    opt.isCorrect
                                        ? 'border-emerald-200 bg-emerald-50/80 text-emerald-900'
                                        : 'border-slate-200 bg-white text-slate-700',
                                )}
                            >
                                <span className="font-bold">{optionLetter(index)}.</span>
                                <div className="min-w-0 flex-1">
                                    <StaticContent content={opt.text} className="inline prose prose-sm max-w-none" />
                                </div>
                                {opt.isCorrect && (
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                                )}
                            </div>
                        ))}
                    </div>
                </SectionBlock>
            )}

            {type === 'true-false' && tfOptions.length > 0 && (
                <SectionBlock title="Phương án">
                    <div className="space-y-2">
                        {tfOptions.map((opt, index) => (
                            <div
                                key={index}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
                            >
                                <div className="flex flex-wrap items-start gap-2">
                                    <span className="font-bold">{subLetter(index)})</span>
                                    <StaticContent content={opt.text} className="inline prose prose-sm max-w-none flex-1" />
                                </div>
                                <p className={cn(
                                    'mt-2 text-xs font-semibold',
                                    opt.isCorrect ? 'text-emerald-600' : 'text-red-600',
                                )}>
                                    Đáp án đúng: {opt.isCorrect ? 'Đúng' : 'Sai'}
                                </p>
                            </div>
                        ))}
                    </div>
                </SectionBlock>
            )}

            {type === 'matching' && (
                <SectionBlock title="Ghép cặp đúng">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <p className="mb-2 text-xs font-semibold text-slate-500">Cột trái</p>
                            <div className="space-y-1.5">
                                {(preview.leftItems || []).map((item, index) => (
                                    <div key={index} className="rounded-md bg-white px-2.5 py-2 text-sm">
                                        <span className="font-semibold">{index + 1}. </span>
                                        <StaticContent content={item.text} className="inline prose prose-sm max-w-none" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <p className="mb-2 text-xs font-semibold text-slate-500">Cột phải</p>
                            <div className="space-y-1.5">
                                {(preview.rightItems || []).map((item, index) => (
                                    <div key={index} className="rounded-md bg-white px-2.5 py-2 text-sm">
                                        <span className="font-semibold">{String.fromCharCode(65 + index)}. </span>
                                        <StaticContent content={item.text} className="inline prose prose-sm max-w-none" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {(preview.matchingPairs || []).length > 0 && (
                        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-2.5">
                            <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                                Đáp án ghép đúng
                            </p>
                            <div className="flex flex-wrap gap-2 text-sm text-emerald-800">
                                {(preview.matchingPairs || []).map((pair, index) => (
                                    <span key={index} className="rounded-md bg-white px-2 py-1 font-medium">
                                        {pair.leftIndex + 1} → {String.fromCharCode(65 + pair.rightIndex)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </SectionBlock>
            )}

            {type === 'short-answer' && preview.correctAnswer && (
                <SectionBlock title="Đáp án đúng">
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-800">
                        {preview.correctAnswer}
                    </div>
                </SectionBlock>
            )}

            {type === 'essay' && preview.sampleAnswer && (
                <SectionBlock title="Đáp án mẫu">
                    <StaticContent
                        content={preview.sampleAnswer}
                        className="prose prose-sm max-w-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
                    />
                </SectionBlock>
            )}

            {type === 'code' && (
                <>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        {preview.language && (
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                                {preview.language}
                            </span>
                        )}
                        {preview.codeMode && (
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                                {preview.codeMode === 'web' ? 'Web' : 'Thuật toán'}
                            </span>
                        )}
                    </div>

                    {preview.starterCode && (
                        <SectionBlock title="Code khởi tạo">
                            <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-900 px-4 py-3 font-mono text-sm leading-relaxed text-slate-100">
                                {preview.starterCode}
                            </pre>
                        </SectionBlock>
                    )}

                    {preview.codeMode !== 'web' && (preview.testCases || []).length > 0 && (
                        <CodeTestCasesPanel testCases={preview.testCases || []} />
                    )}
                </>
            )}

            {preview.explanation && (
                <SectionBlock title="Giải thích">
                    <StaticContent
                        content={preview.explanation}
                        className="prose prose-sm max-w-none rounded-lg border border-amber-100 bg-amber-50/50 px-3 py-2.5 text-slate-800"
                    />
                </SectionBlock>
            )}
        </div>
    );
}
