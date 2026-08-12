'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X, RotateCcw, Loader2, Code2, Play } from 'lucide-react';
import { luyentapApi } from '@/lib/api/luyentap.api';
import type { CodeLanguage, PracticeQuestion } from '@/types/luyentap.type';
import AlgorithmCodeEditor, { AlgorithmStdinEditor } from '@/components/luyentap/AlgorithmCodeEditor';
import AlgorithmQuestionPanel, { AlgorithmSampleTestPanel } from '@/components/luyentap/AlgorithmQuestionPanel';
import { ALGORITHM_LANGUAGES } from '@/lib/luyentap/algorithm-code-completions';
import { WEB_IDE_COLORS } from '@/lib/luyentap/web-code-theme';

interface AlgorithmCodeIdeOverlayProps {
    open: boolean;
    onClose: () => void;
    question: PracticeQuestion;
    value: string;
    onChange: (code: string) => void;
    disabled?: boolean;
}

type AlgorithmLang = 'pascal' | 'python' | 'javascript' | 'cpp';

function resolveInitialLanguage(questionLang?: CodeLanguage): AlgorithmLang {
    const allowed = ALGORITHM_LANGUAGES.map((l) => l.value);
    if (questionLang && allowed.includes(questionLang as AlgorithmLang)) {
        return questionLang as AlgorithmLang;
    }
    return 'python';
}

function hasSampleTestData(tc: { isSample?: boolean; input?: string; expectedOutput?: string }) {
    return tc.isSample === true && Boolean(tc.input?.trim() || tc.expectedOutput?.trim());
}

type ConsoleTab = 'stdout' | 'testcase';

interface TestcaseResult {
    index: number;
    input: string;
    expected: string;
    output: string;
    error?: string;
    passed: boolean;
}

export default function AlgorithmCodeIdeOverlay({
    open,
    onClose,
    question,
    value,
    onChange,
    disabled = false,
}: AlgorithmCodeIdeOverlayProps) {
    const [selectedLanguage, setSelectedLanguage] = useState<AlgorithmLang>(() =>
        resolveInitialLanguage(question.language),
    );

    const sampleCases = useMemo(
        () => (question.testCases || []).filter(hasSampleTestData),
        [question.testCases],
    );

    const [stdin, setStdin] = useState('');
    const [consoleTab, setConsoleTab] = useState<ConsoleTab>('stdout');
    const [stdout, setStdout] = useState('');
    const [running, setRunning] = useState(false);
    const [testcaseResults, setTestcaseResults] = useState<TestcaseResult[] | null>(null);
    const wasOpenRef = useRef(false);

    const starterCode = question.starterCode?.trim() || '';

    const handleReset = () => {
        if (disabled) return;
        onChange(starterCode);
        setStdout('');
        setTestcaseResults(null);
        setStdin(sampleCases[0]?.input || '');
    };

    const handleRun = useCallback(async () => {
        if (disabled || running || !value.trim()) return;
        setRunning(true);
        setStdout('');
        setConsoleTab('stdout');
        try {
            const res = await luyentapApi.runCodeTest({
                language: selectedLanguage,
                code: value,
                codeMode: 'algorithm',
                input: stdin,
            });
            const data = res.data || res;
            const lines = [
                data.output,
                data.error,
            ].filter(Boolean);
            const stamp = new Date().toString();
            setStdout(lines.length > 0 ? `${lines.join('\n')}\n\n(${stamp})` : `Không có kết quả\n\n(${stamp})`);
        } catch (err: unknown) {
            setStdout(err instanceof Error ? err.message : 'Lỗi khi chạy code');
        } finally {
            setRunning(false);
        }
    }, [disabled, running, value, selectedLanguage, stdin]);

    const handleRunTestcases = useCallback(async () => {
        if (disabled || running || !value.trim() || sampleCases.length === 0) return;
        setRunning(true);
        setTestcaseResults(null);
        setConsoleTab('testcase');
        try {
            const results: TestcaseResult[] = [];
            for (let i = 0; i < sampleCases.length; i++) {
                const tc = sampleCases[i];
                const res = await luyentapApi.runCodeTest({
                    language: selectedLanguage,
                    code: value,
                    codeMode: 'algorithm',
                    input: tc.input || '',
                    expectedOutput: tc.expectedOutput || '',
                });
                const data = res.data || res;
                results.push({
                    index: i + 1,
                    input: tc.input || '',
                    expected: tc.expectedOutput || '',
                    output: data.output || '',
                    error: data.error,
                    passed: Boolean(data.passed),
                });
            }
            setTestcaseResults(results);
        } catch {
            setTestcaseResults([]);
        } finally {
            setRunning(false);
        }
    }, [disabled, running, value, selectedLanguage, sampleCases]);

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKeyDown);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [open, onClose]);

    useEffect(() => {
        if (open && !wasOpenRef.current) {
            setSelectedLanguage(resolveInitialLanguage(question.language));
            setStdout('');
            setTestcaseResults(null);
            setConsoleTab('stdout');
            setStdin(sampleCases[0]?.input || '');
        }
        wasOpenRef.current = open;
    }, [open, question.language, sampleCases]);

    if (!open) return null;

    const passedCount = testcaseResults?.filter((r) => r.passed).length ?? 0;

    return (
        <div className="fixed inset-0 z-[10000] flex flex-col bg-[#f3f4f6]">
            <div className="flex flex-1 min-h-0 overflow-hidden">
                {/* Left — đề bài + test mẫu */}
                <div className="w-[38%] shrink-0 flex flex-col bg-white border-r border-gray-200 min-w-0">
                    <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-gray-200">
                        <h2 className="text-sm font-semibold tracking-wide text-gray-800">NỘI DUNG</h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                            aria-label="Đóng IDE"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 select-text">
                        <AlgorithmQuestionPanel question={question.question} />

                        <AlgorithmSampleTestPanel testCases={sampleCases} />
                    </div>
                </div>

                {/* Right — editor + console */}
                <div
                    className="flex-1 flex flex-col min-w-0"
                    style={{ backgroundColor: WEB_IDE_COLORS.editorBg }}
                >
                    {/* Toolbar */}
                    <div
                        className="flex items-center justify-between gap-4 px-4 py-2 border-b shrink-0"
                        style={{
                            backgroundColor: WEB_IDE_COLORS.panelBg,
                            borderColor: WEB_IDE_COLORS.border,
                        }}
                    >
                        <div className="flex items-center gap-2 text-sm" style={{ color: WEB_IDE_COLORS.tabInactiveText }}>
                            <Code2 className="w-4 h-4" style={{ color: '#569cd6' }} />
                            <span>Ngôn ngữ</span>
                            <select
                                value={selectedLanguage}
                                onChange={(e) => setSelectedLanguage(e.target.value as AlgorithmLang)}
                                disabled={disabled}
                                className="px-3 py-1.5 rounded-md font-semibold text-sm outline-none cursor-pointer disabled:opacity-50"
                                style={{
                                    backgroundColor: WEB_IDE_COLORS.tabInactiveBg,
                                    color: WEB_IDE_COLORS.tabActiveText,
                                    border: `1px solid ${WEB_IDE_COLORS.border}`,
                                }}
                            >
                                {ALGORITHM_LANGUAGES.map((lang) => (
                                    <option key={lang.value} value={lang.value}>
                                        {lang.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleReset}
                                disabled={disabled}
                                className="p-2 rounded disabled:opacity-40"
                                style={{ color: WEB_IDE_COLORS.mutedText }}
                                title="Reset code"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={handleRun}
                                disabled={disabled || running || !value.trim()}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                                style={{ backgroundColor: '#2563eb' }}
                            >
                                {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                Chạy CODE
                            </button>
                        </div>
                    </div>

                    {/* Code editor */}
                    <div className="flex-[3] min-h-0 flex flex-col overflow-hidden">
                        <AlgorithmCodeEditor
                            key={selectedLanguage}
                            language={selectedLanguage}
                            value={value}
                            onChange={onChange}
                            disabled={disabled}
                            autoFocus
                        />
                        <p
                            className="shrink-0 px-3 py-1 text-xs border-t"
                            style={{
                                color: WEB_IDE_COLORS.mutedText,
                                backgroundColor: WEB_IDE_COLORS.panelBg,
                                borderColor: WEB_IDE_COLORS.border,
                            }}
                        >
                            Gõ để gợi ý · Tab thụt dòng · Ctrl+Space mở gợi ý
                        </p>
                    </div>

                    {/* Console */}
                    <div
                        className="flex-[2] min-h-[180px] max-h-[40%] flex border-t shrink-0"
                        style={{ borderColor: WEB_IDE_COLORS.border }}
                    >
                        {/* STDIN */}
                        <div
                            className="w-1/2 flex flex-col border-r min-w-0"
                            style={{ borderColor: WEB_IDE_COLORS.border }}
                        >
                            <div
                                className="px-3 py-1.5 text-xs font-bold tracking-wide border-b shrink-0"
                                style={{
                                    color: '#569cd6',
                                    backgroundColor: WEB_IDE_COLORS.panelBg,
                                    borderColor: WEB_IDE_COLORS.border,
                                }}
                            >
                                STDIN
                            </div>
                            <AlgorithmStdinEditor
                                value={stdin}
                                onChange={setStdin}
                                disabled={disabled}
                            />
                        </div>

                        {/* STDOUT / TESTCASE */}
                        <div className="w-1/2 flex flex-col min-w-0">
                            <div
                                className="flex items-center gap-4 px-3 border-b shrink-0"
                                style={{
                                    backgroundColor: WEB_IDE_COLORS.panelBg,
                                    borderColor: WEB_IDE_COLORS.border,
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => setConsoleTab('stdout')}
                                    className="py-1.5 text-xs font-bold tracking-wide border-b-2 transition-colors"
                                    style={{
                                        color: consoleTab === 'stdout' ? '#569cd6' : WEB_IDE_COLORS.mutedText,
                                        borderColor: consoleTab === 'stdout' ? '#569cd6' : 'transparent',
                                    }}
                                >
                                    STDOUT
                                </button>
                                {sampleCases.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setConsoleTab('testcase')}
                                        className="py-1.5 text-xs font-bold tracking-wide border-b-2 transition-colors"
                                        style={{
                                            color: consoleTab === 'testcase' ? '#569cd6' : WEB_IDE_COLORS.mutedText,
                                            borderColor: consoleTab === 'testcase' ? '#569cd6' : 'transparent',
                                        }}
                                    >
                                        TESTCASE
                                    </button>
                                )}
                                {sampleCases.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleRunTestcases}
                                        disabled={disabled || running || !value.trim()}
                                        className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded disabled:opacity-50"
                                        style={{ color: '#569cd6' }}
                                    >
                                        Chạy test mẫu
                                    </button>
                                )}
                            </div>
                            <div
                                className="flex-1 overflow-auto p-3 font-mono text-sm whitespace-pre-wrap select-text"
                                style={{
                                    backgroundColor: WEB_IDE_COLORS.editorBg,
                                    color: '#d4d4d4',
                                }}
                            >
                                {consoleTab === 'stdout' || sampleCases.length === 0 ? (
                                    stdout || (
                                        <span style={{ color: WEB_IDE_COLORS.mutedText }}>
                                            Nhấn &quot;Chạy CODE&quot; để xem kết quả...
                                        </span>
                                    )
                                ) : testcaseResults ? (
                                    testcaseResults.length === 0 ? (
                                        <span style={{ color: WEB_IDE_COLORS.mutedText }}>Không có test case mẫu</span>
                                    ) : (
                                        <div className="space-y-3">
                                            <p className="text-xs font-semibold" style={{ color: '#569cd6' }}>
                                                {passedCount}/{testcaseResults.length} test đạt
                                            </p>
                                            {testcaseResults.map((r) => (
                                                <div
                                                    key={r.index}
                                                    className="rounded-lg border px-3 py-2 text-xs"
                                                    style={{
                                                        borderColor: r.passed ? '#166534' : '#991b1b',
                                                        backgroundColor: r.passed ? '#052e1620' : '#450a0a20',
                                                    }}
                                                >
                                                    <p className="font-bold mb-1" style={{ color: r.passed ? '#4ade80' : '#f87171' }}>
                                                        Test {r.index}: {r.passed ? 'ĐẠT' : 'CHƯA ĐẠT'}
                                                    </p>
                                                    {r.output && <p>Output: {r.output}</p>}
                                                    {r.error && <p style={{ color: '#f87171' }}>Lỗi: {r.error}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    )
                                ) : (
                                    <span style={{ color: WEB_IDE_COLORS.mutedText }}>
                                        Nhấn &quot;Chạy test mẫu&quot; để kiểm tra với test case mẫu...
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
