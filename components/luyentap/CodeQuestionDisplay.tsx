'use client';

import React from 'react';
import AlgorithmQuestionPanel, { AlgorithmSampleTestPanel } from '@/components/luyentap/AlgorithmQuestionPanel';
import { formatWebRequirementLabel, type WebRequirement } from '@/lib/luyentap/question-markdown';
import { cn } from '@/lib/utils';
import { ClipboardList } from 'lucide-react';

interface CodeQuestionDisplayProps {
    question: string;
    codeMode?: 'algorithm' | 'web';
    testCases?: Array<{ input?: string; expectedOutput?: string; isSample?: boolean }>;
    webRequirements?: WebRequirement[];
    variant?: 'compact' | 'cards';
    showSampleTests?: boolean;
    className?: string;
}

function WebRequirementsPanel({ requirements }: { requirements: WebRequirement[] }) {
    if (!requirements.length) return null;

    return (
        <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                Yêu cầu & dữ liệu
            </p>
            <div className="rounded-xl border-2 border-amber-200 overflow-hidden shadow-sm">
                <div className="flex items-center gap-2 bg-amber-600 px-4 py-2.5 text-white">
                    <ClipboardList className="h-4 w-4 shrink-0" strokeWidth={2.25} />
                    <span className="text-sm font-bold tracking-wide">Yêu cầu</span>
                </div>
                <div className="bg-amber-50/80 p-3">
                    <ul className="space-y-2 rounded-lg border border-amber-100 bg-white px-3 py-2.5">
                        {requirements.map((req, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-800">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                                {formatWebRequirementLabel(req)}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default function CodeQuestionDisplay({
    question,
    codeMode,
    testCases,
    webRequirements,
    variant = 'cards',
    showSampleTests = true,
    className,
}: CodeQuestionDisplayProps) {
    const isWeb = codeMode === 'web';

    if (isWeb) {
        return (
            <div className={cn('space-y-1', className)}>
                {question.trim() && (
                    <AlgorithmQuestionPanel
                        question={question}
                        variant={variant}
                        showIntro
                    />
                )}
                <WebRequirementsPanel requirements={webRequirements || []} />
            </div>
        );
    }

    return (
        <div className={cn('space-y-1', className)}>
            <AlgorithmQuestionPanel
                question={question}
                variant={variant}
                showIntro
            />
            {showSampleTests && (testCases || []).length > 0 && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                    <AlgorithmSampleTestPanel testCases={testCases || []} />
                </div>
            )}
        </div>
    );
}
