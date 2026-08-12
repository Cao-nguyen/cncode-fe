'use client';

import React, { useMemo, useState } from 'react';
import WebCodeEditor from '@/components/luyentap/WebCodeEditor';
import {
    getWebFileContent,
    parseWebProject,
    type WebEditorFile,
} from '@/lib/luyentap/web-project';
import { WEB_IDE_COLORS } from '@/lib/luyentap/web-code-theme';
import { cn } from '@/lib/utils';

const TABS: { id: WebEditorFile; label: string }[] = [
    { id: 'index.html', label: 'HTML' },
    { id: 'style.css', label: 'CSS' },
    { id: 'script.js', label: 'JS' },
];

interface WebCodeAnswerReviewProps {
    codeAnswer: string;
    starterCode?: string;
}

export default function WebCodeAnswerReview({
    codeAnswer,
    starterCode,
}: WebCodeAnswerReviewProps) {
    const [activeFile, setActiveFile] = useState<WebEditorFile>('index.html');
    const files = useMemo(
        () => parseWebProject(codeAnswer, starterCode),
        [codeAnswer, starterCode],
    );
    const content = getWebFileContent(files, activeFile);

    return (
        <div className="overflow-hidden rounded-md">
            <div
                className="flex gap-0.5 px-1 pt-1"
                style={{ backgroundColor: WEB_IDE_COLORS.panelBg }}
            >
                {TABS.map((tab) => {
                    const active = activeFile === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveFile(tab.id)}
                            className={cn(
                                'rounded-t px-3 py-1.5 text-xs font-semibold transition-colors',
                                active ? 'shadow-sm' : 'opacity-80 hover:opacity-100',
                            )}
                            style={{
                                backgroundColor: active
                                    ? WEB_IDE_COLORS.tabActiveBg
                                    : WEB_IDE_COLORS.tabInactiveBg,
                                color: active
                                    ? WEB_IDE_COLORS.tabActiveText
                                    : WEB_IDE_COLORS.tabInactiveText,
                            }}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>
            <div
                className="flex h-[280px] max-h-[50vh] min-h-[160px] flex-col overflow-hidden"
                style={{ backgroundColor: WEB_IDE_COLORS.editorBg }}
            >
                <WebCodeEditor
                    key={activeFile}
                    file={activeFile}
                    value={content}
                    onChange={() => {}}
                    disabled
                    fillHeight
                />
            </div>
        </div>
    );
}
