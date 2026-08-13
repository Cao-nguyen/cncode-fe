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
type MobilePanel = 'question' | 'editor';

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
    const [mobilePanel, setMobilePanel] = useState<MobilePanel>('question');
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
            setMobilePanel('question');
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
        <div className="fixed inset-0 z-[10000] flex h-dvh w-full flex-col overflow-hidden bg-[#f3f4f6]">
            <div className="flex shrink-0 gap-2 border-b border-gray-200 bg-white px-3 py-2 lg:hidden">
                <button
                    type="button"
                    onClick={() => setMobilePanel('question')}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                        mobilePanel === 'question'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600'
                    }`}
                >
                    Nội dung
                </button>
                <button
                    type="button"
                    onClick={() => setMobilePanel('editor')}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                        mobilePanel === 'editor'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600'
                    }`}
                >
                    Trình soạn
                </button>
            </div>

            <div className="flex min-h-0 flex-1 overflow-hidden flex-col lg:flex-row">
                {/* Left — đề bài + test mẫu */}
                <div
                    className={`w-full shrink-0 flex-col border-b border-gray-200 bg-white min-w-0 lg:flex lg:h-auto lg:w-[38%] lg:border-b-0 lg:border-r ${
                        mobilePanel === 'question' ? 'flex flex-1 min-h-0' : 'hidden lg:flex'
                    }`}
                >
                    <div className="flex items-center justify-between border-b border-gray-200 px-4 pb-3 pt-4 sm:px-6">
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
                    <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4 select-text sm:px-6 sm:py-5">
                        <AlgorithmQuestionPanel question={question.question} />

                        <AlgorithmSampleTestPanel testCases={sampleCases} />
                    </div>
                </div>

                {/* Right — editor + console */}
                <div
                    className={`min-w-0 flex-col lg:flex lg:flex-1 ${
                        mobilePanel === 'editor' ? 'flex flex-1 min-h-0' : 'hidden lg:flex'
                    }`}
                    style={{ backgroundColor: WEB_IDE_COLORS.editorBg }}
                >
                    {/* Toolbar */}
                    <div
                        className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b px-3 py-2 sm:gap-4 sm:px-4"
                        style={{
                            backgroundColor: WEB_IDE_COLORS.panelBg,
                            borderColor: WEB_IDE_COLORS.border,
                        }}
                    >
                        <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm" style={{ color: WEB_IDE_COLORS.tabInactiveText }}>
                            <Code2 className="h-4 w-4 shrink-0" style={{ color: '#569cd6' }} />
                            <span className="hidden sm:inline">Ngôn ngữ</span>
                            <select
                                value={selectedLanguage}
                                onChange={(e) => setSelectedLanguage(e.target.value as AlgorithmLang)}
                                disabled={disabled}
                                className="max-w-[140px] cursor-pointer rounded-md px-2 py-1.5 text-sm font-semibold outline-none disabled:opacity-50 sm:max-w-none sm:px-3"
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
                        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                            <button
                                type="button"
                                onClick={handleReset}
                                disabled={disabled}
                                className="rounded p-2 disabled:opacity-40"
                                style={{ color: WEB_IDE_COLORS.mutedText }}
                                title="Reset code"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={handleRun}
                                disabled={disabled || running || !value.trim()}
                                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white disabled:opacity-50 sm:gap-2 sm:px-4 sm:text-sm"
                                style={{ backgroundColor: '#2563eb' }}
                            >
                                {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                <span className="sm:hidden">Chạy</span>
                                <span className="hidden sm:inline">Chạy CODE</span>
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
                        className="flex max-h-[45%] min-h-[160px] shrink-0 flex-col border-t sm:max-h-[40%] sm:flex-row lg:min-h-[180px]"
                        style={{ borderColor: WEB_IDE_COLORS.border }}
                    >
                        {/* STDIN */}
                        <div
                            className="flex min-h-[120px] w-full flex-col border-b min-w-0 sm:min-h-0 sm:w-1/2 sm:border-b-0 sm:border-r"
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
                        <div className="flex min-h-[120px] w-full min-w-0 flex-col sm:min-h-0 sm:w-1/2">
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
