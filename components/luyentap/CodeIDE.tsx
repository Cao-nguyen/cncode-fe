'use client';

import React, { useState } from 'react';
import { Play, Loader2, Terminal } from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';
import { luyentapApi } from '@/lib/api/luyentap.api';
import type { CodeLanguage } from '@/types/luyentap.type';

interface CodeIDEProps {
    language: CodeLanguage;
    value: string;
    onChange: (code: string) => void;
    testCases?: { input?: string; expectedOutput?: string }[];
    readOnly?: boolean;
}

export default function CodeIDE({ language, value, onChange, testCases = [], readOnly = false }: CodeIDEProps) {
    const [output, setOutput] = useState('');
    const [running, setRunning] = useState(false);
    const [activeCase, setActiveCase] = useState(0);

    const runCode = async () => {
        const tc = testCases[activeCase];
        if (!tc?.expectedOutput) {
            setOutput('Không có test case để chạy');
            return;
        }
        setRunning(true);
        try {
            const res = await luyentapApi.runCodeTest({
                language,
                code: value,
                input: tc.input,
                expectedOutput: tc.expectedOutput,
            });
            if (res.success) {
                const { output: out, passed, error } = res.data;
                setOutput(error ? `Lỗi: ${error}` : `${out}\n\n${passed ? '✅ Đúng' : '❌ Sai'} (mong đợi: ${tc.expectedOutput})`);
            }
        } catch {
            setOutput('Lỗi khi chạy code');
        } finally {
            setRunning(false);
        }
    };

    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-[#1e1e1e]">
            <div className="flex items-center justify-between px-3 py-2 bg-[#2d2d2d] border-b border-gray-700">
                <span className="text-xs font-mono text-gray-400 uppercase">{language}</span>
                {!readOnly && testCases.length > 0 && (
                    <div className="flex items-center gap-2">
                        {testCases.length > 1 && (
                            <select
                                value={activeCase}
                                onChange={e => setActiveCase(Number(e.target.value))}
                                className="text-xs bg-[#3c3c3c] text-gray-300 rounded px-2 py-1 border-none"
                            >
                                {testCases.map((_, i) => (
                                    <option key={i} value={i}>Test {i + 1}</option>
                                ))}
                            </select>
                        )}
                        <CustomButton size="small" variant="secondary" onClick={runCode} disabled={running} className="!py-1 !px-2 !text-xs">
                            {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                            Chạy thử
                        </CustomButton>
                    </div>
                )}
            </div>
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                readOnly={readOnly}
                spellCheck={false}
                className="w-full min-h-[220px] p-4 font-mono text-sm text-green-300 bg-[#1e1e1e] resize-y focus:outline-none"
                style={{ tabSize: 4 }}
            />
            {output && (
                <div className="border-t border-gray-700 p-3 bg-[#252526]">
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                        <Terminal className="w-3 h-3" /> Output
                    </div>
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">{output}</pre>
                </div>
            )}
        </div>
    );
}
