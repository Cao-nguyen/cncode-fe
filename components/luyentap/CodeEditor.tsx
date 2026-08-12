'use client';

import React, { useState } from 'react';
import { Play, Loader2, CheckCircle, XCircle, Monitor } from 'lucide-react';
import { luyentapApi } from '@/lib/api/luyentap.api';
import type { PracticeQuestion } from '@/types/luyentap.type';
import { CODE_LANGUAGES } from '@/types/luyentap.type';
import { formatWebRequirementLabel } from '@/lib/luyentap/question-markdown';

interface CodeEditorProps {
    question: PracticeQuestion;
    value: string;
    onChange: (code: string) => void;
    disabled?: boolean;
}

export default function CodeEditor({ question, value, onChange, disabled }: CodeEditorProps) {
    const [running, setRunning] = useState(false);
    const [output, setOutput] = useState<string | null>(null);
    const [passed, setPassed] = useState<boolean | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    const isWeb = question.codeMode === 'web' || ['html', 'css', 'javascript'].includes(question.language || '');

    const handleRun = async () => {
        setRunning(true);
        setOutput(null);
        setPassed(null);
        try {
            const res = await luyentapApi.runCodeTest({
                language: question.language || 'python',
                code: value,
                codeMode: isWeb ? 'web' : 'algorithm',
                input: question.testCases?.find((tc) => tc.isSample)?.input
                    ?? question.testCases?.[0]?.input,
                expectedOutput: question.testCases?.find((tc) => tc.isSample)?.expectedOutput
                    ?? question.testCases?.[0]?.expectedOutput,
                webRequirements: question.webRequirements,
            });
            const data = res.data || res;
            if (isWeb && Array.isArray(data.results)) {
                const lines = data.results.map((r: { passed: boolean; requirement: Parameters<typeof formatWebRequirementLabel>[0] }) =>
                    `${r.passed ? '✓' : '✗'} ${formatWebRequirementLabel(r.requirement)}`
                );
                setOutput(lines.join('\n') || data.output || '');
            } else {
                setOutput([data.output, data.error].filter(Boolean).join('\n') || 'Không có kết quả');
            }
            setPassed(data.passed ?? data.success ?? false);
            if (isWeb) setShowPreview(true);
        } catch (err: unknown) {
            setOutput(err instanceof Error ? err.message : 'Lỗi khi chạy code');
            setPassed(false);
        } finally {
            setRunning(false);
        }
    };

    const langLabel = CODE_LANGUAGES.find((l) => l.value === question.language)?.label || question.language;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {isWeb ? 'Web (HTML/CSS/JS)' : `Thuật toán — ${langLabel}`}
                </span>
                <button
                    type="button"
                    onClick={handleRun}
                    disabled={disabled || running || !value.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                    {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    Chạy thử
                </button>
            </div>

            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                rows={isWeb ? 14 : 12}
                spellCheck={false}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-950 text-green-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[200px]"
                placeholder={question.starterCode || '// Nhập code của bạn...'}
            />

            {isWeb && showPreview && (
                <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-xs text-gray-600">
                        <Monitor className="w-3.5 h-3.5" /> Xem trước
                    </div>
                    <iframe
                        title="preview"
                        sandbox="allow-scripts"
                        srcDoc={value}
                        className="w-full h-48 bg-white"
                    />
                </div>
            )}

            {output !== null && (
                <div className={`rounded-xl p-3 text-sm font-mono border ${
                    passed ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}>
                    <div className="flex items-center gap-2 mb-1 font-sans font-semibold text-xs">
                        {passed ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-500" />}
                        {passed ? 'Kết quả đạt' : 'Kết quả chưa đạt'}
                    </div>
                    <pre className="whitespace-pre-wrap">{output}</pre>
                </div>
            )}
        </div>
    );
}
