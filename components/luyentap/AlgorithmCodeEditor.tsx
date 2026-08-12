'use client';

import React, { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { autocompletion, completeFromList } from '@codemirror/autocomplete';
import type { Extension } from '@codemirror/state';
import type { CodeLanguage } from '@/types/luyentap.type';
import { getAlgorithmSnippetCompletions } from '@/lib/luyentap/algorithm-code-completions';
import { WEB_IDE_COLORS, webIdeEditorTheme, webIdeSyntaxHighlight } from '@/lib/luyentap/web-code-theme';
import { createIdeEditorSetup, ideEditorCmClassName } from '@/lib/luyentap/ide-editor-setup';

interface AlgorithmCodeEditorProps {
    language: CodeLanguage;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    minHeight?: string;
    autoFocus?: boolean;
}

function getLanguageExtension(language: CodeLanguage): Extension | null {
    switch (language) {
        case 'python':
            return python();
        case 'javascript':
            return javascript();
        case 'cpp':
            return cpp();
        case 'csharp':
            return java();
        default:
            return null;
    }
}

export default function AlgorithmCodeEditor({
    language,
    value,
    onChange,
    disabled,
    minHeight,
    autoFocus,
}: AlgorithmCodeEditorProps) {
    const extensions = useMemo(() => {
        const langExt = getLanguageExtension(language);
        const base = [
            ...createIdeEditorSetup(),
            webIdeEditorTheme,
            webIdeSyntaxHighlight,
            autocompletion({
                activateOnTyping: true,
                override: [completeFromList(getAlgorithmSnippetCompletions(language))],
            }),
        ];
        return langExt ? [langExt, ...base] : base;
    }, [language]);

    return (
        <div
            className="algorithm-code-editor flex-1 min-h-0 overflow-hidden select-text"
            style={{ backgroundColor: WEB_IDE_COLORS.editorBg, minHeight }}
        >
            <CodeMirror
                value={value}
                theme="none"
                extensions={extensions}
                onChange={onChange}
                editable={!disabled}
                autoFocus={autoFocus}
                indentWithTab={false}
                basicSetup={false}
                className={ideEditorCmClassName}
            />
        </div>
    );
}

/** Editor nhỏ cho STDIN — cùng theme, hỗ trợ chọn/copy. */
export function AlgorithmStdinEditor({
    value,
    onChange,
    disabled,
}: {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}) {
    const extensions = useMemo(
        () => [...createIdeEditorSetup({ foldGutter: false })],
        [],
    );

    return (
        <div className="algorithm-stdin-editor h-full overflow-hidden select-text" style={{ backgroundColor: WEB_IDE_COLORS.editorBg }}>
            <CodeMirror
                value={value}
                theme="none"
                extensions={[webIdeEditorTheme, ...extensions]}
                onChange={onChange}
                editable={!disabled}
                indentWithTab={false}
                basicSetup={false}
                className={ideEditorCmClassName}
            />
        </div>
    );
}
