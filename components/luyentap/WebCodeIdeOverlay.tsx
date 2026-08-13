'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X, RotateCcw, Loader2, FileCode2 } from 'lucide-react';
import { luyentapApi } from '@/lib/api/luyentap.api';
import type { PracticeQuestion } from '@/types/luyentap.type';
import StaticContent from '@/components/common/StaticContent';
import WebCodeEditor from '@/components/luyentap/WebCodeEditor';
import { formatWebRequirementLabel } from '@/lib/luyentap/question-markdown';
import {
    type WebEditorFile,
    WEB_EDITOR_FILES,
    buildWebPreviewHtml,
    defaultWebProject,
    getWebFileContent,
    parseWebProject,
    serializeWebProject,
    setWebFileContent,
} from '@/lib/luyentap/web-project';
import { WEB_IDE_COLORS } from '@/lib/luyentap/web-code-theme';

interface WebCodeIdeOverlayProps {
    open: boolean;
    onClose: () => void;
    question: PracticeQuestion;
    value: string;
    onChange: (code: string) => void;
    disabled?: boolean;
}

type LeftTab = 'content' | 'browser';
type MobilePanel = 'question' | 'editor';

export default function WebCodeIdeOverlay({
    open,
    onClose,
    question,
    value,
    onChange,
    disabled = false,
}: WebCodeIdeOverlayProps) {
    const [leftTab, setLeftTab] = useState<LeftTab>('content');
    const [mobilePanel, setMobilePanel] = useState<MobilePanel>('question');
    const [activeFile, setActiveFile] = useState<WebEditorFile>('index.html');
    const [files, setFiles] = useState(() => parseWebProject(value, question.starterCode));
    const [running, setRunning] = useState(false);
    const [testResults, setTestResults] = useState<Array<{ passed: boolean; label: string }> | null>(null);
    const wasOpenRef = useRef(false);

    const requirements = question.webRequirements || [];
    const totalTests = requirements.length;
    const previewHtml = useMemo(() => buildWebPreviewHtml(files), [files]);
    const activeContent = getWebFileContent(files, activeFile);
    const defaultProject = useMemo(() => defaultWebProject(question.starterCode), [question.starterCode]);

    const passedCount = useMemo(
        () => (testResults || []).filter((r) => r.passed).length,
        [testResults],
    );

    const updateFiles = useCallback((next: typeof files) => {
        setFiles(next);
        onChange(serializeWebProject(next));
    }, [onChange]);

    const handleFileChange = (content: string) => {
        updateFiles(setWebFileContent(files, activeFile, content));
    };

    const handleReset = () => {
        if (disabled) return;
        updateFiles(defaultProject);
        setTestResults(null);
        setActiveFile('index.html');
    };

    const handleRunTests = useCallback(async () => {
        if (disabled || running) return;
        setRunning(true);
        setTestResults(null);
        try {
            const res = await luyentapApi.runCodeTest({
                language: question.language || 'html',
                code: previewHtml,
                codeMode: 'web',
                webRequirements: question.webRequirements,
            });
            const data = res.data || res;
            if (Array.isArray(data.results)) {
                setTestResults(
                    data.results.map((r: { passed: boolean; requirement: Parameters<typeof formatWebRequirementLabel>[0] }) => ({
                        passed: r.passed,
                        label: formatWebRequirementLabel(r.requirement),
                    })),
                );
            } else {
                setTestResults([]);
            }
            setLeftTab('browser');
        } catch {
            setTestResults([]);
        } finally {
            setRunning(false);
        }
    }, [disabled, running, previewHtml, question.language, question.webRequirements]);

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
            setLeftTab('content');
            setMobilePanel('question');
            setTestResults(null);
            setActiveFile('index.html');
            setFiles(parseWebProject(value, question.starterCode));
        }
        wasOpenRef.current = open;
    }, [open, value, question.starterCode]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex h-dvh w-full flex-col overflow-hidden bg-[#f3f4f6]">
            <div className="flex shrink-0 gap-2 border-b border-gray-200 bg-white px-3 py-2 lg:hidden">
                <button
                    type="button"
                    onClick={() => setMobilePanel('question')}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                        mobilePanel === 'question'
                            ? 'bg-orange-500 text-white'
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
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-600'
                    }`}
                >
                    Trình soạn
                </button>
            </div>

            <div className="flex min-h-0 flex-1 overflow-hidden flex-col lg:flex-row">
                {/* Left — Nội dung / Trình duyệt */}
                <div
                    className={`w-full shrink-0 flex-col border-b border-gray-200 bg-white min-w-0 lg:flex lg:h-auto lg:w-[42%] lg:border-b-0 lg:border-r ${
                        mobilePanel === 'question' ? 'flex flex-1 min-h-0' : 'hidden lg:flex'
                    }`}
                >
                    <div className="flex items-center gap-3 overflow-x-auto border-b border-gray-200 px-3 pt-3 sm:gap-6 sm:px-6 sm:pt-4">
                        <button
                            type="button"
                            onClick={() => setLeftTab('content')}
                            className={`pb-3 text-sm font-semibold tracking-wide border-b-2 transition-colors ${
                                leftTab === 'content'
                                    ? 'border-orange-500 text-gray-900'
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            NỘI DUNG
                        </button>
                        <button
                            type="button"
                            onClick={() => setLeftTab('browser')}
                            className={`pb-3 text-sm font-semibold tracking-wide border-b-2 transition-colors ${
                                leftTab === 'browser'
                                    ? 'border-orange-500 text-gray-900'
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            TRÌNH DUYỆT
                        </button>
                        <div className="flex-1" />
                        <button
                            type="button"
                            onClick={onClose}
                            className="mb-2 p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                            aria-label="Đóng IDE"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {leftTab === 'content' ? (
                            <div className="space-y-5 px-4 py-4 select-text sm:px-6 sm:py-5">
                                <StaticContent
                                    content={question.question}
                                    className="prose prose-sm max-w-none text-gray-800"
                                />

                                {requirements.length > 0 && (
                                    <div className="rounded-lg border-l-4 border-orange-400 bg-orange-50/80 px-4 py-3">
                                        <p className="text-sm font-semibold text-orange-900 mb-2">Yêu cầu cần đạt</p>
                                        <ul className="space-y-1.5">
                                            {requirements.map((req, i) => (
                                                <li key={i} className="text-sm text-orange-900 flex items-start gap-2">
                                                    <span className="text-orange-500 mt-0.5 shrink-0">•</span>
                                                    {formatWebRequirementLabel(req)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {testResults && testResults.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-gray-700">Kết quả kiểm tra</p>
                                        {testResults.map((r, i) => (
                                            <div
                                                key={i}
                                                className={`text-sm px-3 py-2 rounded-lg border ${
                                                    r.passed
                                                        ? 'bg-green-50 border-green-200 text-green-800'
                                                        : 'bg-red-50 border-red-200 text-red-800'
                                                }`}
                                            >
                                                {r.passed ? '✓' : '✗'} {r.label}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full min-h-[320px] bg-white">
                                <iframe
                                    title="preview"
                                    sandbox="allow-scripts"
                                    srcDoc={previewHtml}
                                    className="w-full h-full min-h-[400px] border-0 bg-white"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Right — Editor */}
                <div
                    className={`min-w-0 flex-col lg:flex lg:flex-1 ${
                        mobilePanel === 'editor' ? 'flex flex-1 min-h-0' : 'hidden lg:flex'
                    }`}
                    style={{ backgroundColor: WEB_IDE_COLORS.editorBg }}
                >
                    <div
                        className="flex items-center border-b min-h-[42px]"
                        style={{
                            backgroundColor: WEB_IDE_COLORS.panelBg,
                            borderColor: WEB_IDE_COLORS.border,
                        }}
                    >
                        <div className="flex items-stretch flex-1 min-w-0 overflow-x-auto">
                            {WEB_EDITOR_FILES.map((file) => (
                                <button
                                    key={file.id}
                                    type="button"
                                    onClick={() => setActiveFile(file.id)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm border-r shrink-0 transition-colors"
                                    style={{
                                        borderColor: WEB_IDE_COLORS.border,
                                        backgroundColor:
                                            activeFile === file.id
                                                ? WEB_IDE_COLORS.tabActiveBg
                                                : WEB_IDE_COLORS.tabInactiveBg,
                                        color:
                                            activeFile === file.id
                                                ? WEB_IDE_COLORS.tabActiveText
                                                : WEB_IDE_COLORS.tabInactiveText,
                                    }}
                                >
                                    <FileCode2 className={`w-3.5 h-3.5 shrink-0 ${
                                        file.id === 'index.html' ? 'text-orange-500' :
                                        file.id === 'style.css' ? 'text-blue-400' : 'text-yellow-400'
                                    }`} />
                                    {file.label}
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={disabled}
                            className="shrink-0 p-2 mx-2 rounded disabled:opacity-40 transition-colors"
                            style={{ color: WEB_IDE_COLORS.mutedText }}
                            title="Reset tất cả file"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
                        <WebCodeEditor
                            file={activeFile}
                            value={activeContent}
                            onChange={handleFileChange}
                            disabled={disabled}
                            autoFocus
                        />
                        <p
                            className="shrink-0 px-3 py-1.5 text-xs border-t"
                            style={{
                                color: WEB_IDE_COLORS.mutedText,
                                backgroundColor: WEB_IDE_COLORS.panelBg,
                                borderColor: WEB_IDE_COLORS.border,
                            }}
                        >
                            Gõ để gợi ý · Tab thụt dòng · Ctrl+Space mở gợi ý
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex shrink-0 flex-col gap-2 border-t border-gray-200 bg-white px-4 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.04)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="text-center text-sm text-gray-600 sm:text-left">
                    Bài kiểm tra ({passedCount} / {totalTests || 0})
                </p>
                <button
                    type="button"
                    onClick={handleRunTests}
                    disabled={disabled || running || totalTests === 0}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-8 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-50 sm:w-auto"
                >
                    {running && <Loader2 className="w-4 h-4 animate-spin" />}
                    Kiểm tra
                </button>
            </div>
        </div>
    );
}
