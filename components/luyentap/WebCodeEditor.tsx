'use client';

import React, { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { autocompletion, completeFromList } from '@codemirror/autocomplete';
import type { WebEditorFile } from '@/lib/luyentap/web-project';
import { getWebCodeSnippetCompletions } from '@/lib/luyentap/web-code-completions';
import { WEB_IDE_COLORS, webIdeEditorTheme, webIdeSyntaxHighlight } from '@/lib/luyentap/web-code-theme';
import { createIdeEditorSetup, ideEditorCmClassName } from '@/lib/luyentap/ide-editor-setup';

interface WebCodeEditorProps {
    file: WebEditorFile;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    autoFocus?: boolean;
    fillHeight?: boolean;
}

export default function WebCodeEditor({ file, value, onChange, disabled, autoFocus, fillHeight }: WebCodeEditorProps) {
    const extensions = useMemo(() => {
        const language =
            file === 'index.html'
                ? html({ autoCloseTags: true, matchClosingTags: true })
                : file === 'style.css'
                  ? css()
                  : javascript();

        return [
            ...createIdeEditorSetup(),
            language,
            webIdeEditorTheme,
            webIdeSyntaxHighlight,
            autocompletion({
                activateOnTyping: true,
                override: [completeFromList(getWebCodeSnippetCompletions(file))],
            }),
        ];
    }, [file]);

    return (
        <div
            className={`web-code-editor flex min-h-0 flex-col overflow-hidden select-text ${fillHeight ? 'h-full' : 'flex-1'}`}
            style={{ backgroundColor: WEB_IDE_COLORS.editorBg }}
        >
            <CodeMirror
                key={file}
                value={value}
                theme="none"
                extensions={extensions}
                onChange={onChange}
                editable={!disabled}
                autoFocus={autoFocus}
                indentWithTab={false}
                basicSetup={false}
                className={fillHeight ? `${ideEditorCmClassName} h-full min-h-0` : ideEditorCmClassName}
            />
        </div>
    );
}
