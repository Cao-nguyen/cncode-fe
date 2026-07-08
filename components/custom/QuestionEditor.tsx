'use client';

import React, { forwardRef, useEffect, useRef, useState, useCallback } from 'react';

interface QuestionEditorProps {
    value?: string;
    onChange?: (value: string) => void;
    height?: string;
    placeholder?: string;
    initialLines?: number;
}

export interface QuestionEditorRef {
    getContent: () => string;
    setContent: (content: string) => void;
}

export const QuestionEditor = forwardRef<QuestionEditorRef, QuestionEditorProps>(({
    value = '',
    onChange,
    height = '400px',
    placeholder = 'Nhập nội dung câu hỏi...',
    initialLines = 15,
}, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [lineCount, setLineCount] = useState(initialLines);
    const [content, setContent] = useState(value || '\n'.repeat(initialLines - 1));

    // Sync external value changes (only if not empty, keep initial lines)
    useEffect(() => {
        if (value && value !== content) {
            setContent(value);
        }
    }, [value]);

    // Calculate line count
    useEffect(() => {
        const lines = content.split('\n').length;
        setLineCount(lines);
    }, [content]);

    // Handle content change
    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setContent(newValue);
        if (onChange) {
            onChange(newValue);
        }
    }, [onChange]);

    // Expose methods via ref
    React.useImperativeHandle(ref, () => ({
        getContent: () => content,
        setContent: (newContent: string) => {
            setContent(newContent);
            if (onChange) {
                onChange(newContent);
            }
        }
    }), [content, onChange]);

    // Handle tab key
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = textareaRef.current?.selectionStart || 0;
            const end = textareaRef.current?.selectionEnd || 0;
            const newValue = content.substring(0, start) + '    ' + content.substring(end);
            setContent(newValue);
            if (onChange) {
                onChange(newValue);
            }
            // Set cursor position after tab
            setTimeout(() => {
                textareaRef.current?.setSelectionRange(start + 4, start + 4);
            }, 0);
        }
    };

    const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

    return (
        <div 
            className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-900"
            style={{ height }}
        >
            {/* Line Numbers */}
            <div className="flex flex-col items-end py-3 px-2 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 select-none">
                {lineNumbers.map((num) => (
                    <div 
                        key={num} 
                        className="text-xs text-gray-400 dark:text-gray-500 font-mono leading-6"
                    >
                        {num}
                    </div>
                ))}
            </div>

            {/* Text Area */}
            <div className="flex-1 relative">
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full h-full p-3 resize-none outline-none font-mono text-sm leading-6 bg-transparent dark:text-white"
                    style={{
                        fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
                        lineHeight: '1.5rem',
                    }}
                    spellCheck={false}
                />
            </div>
        </div>
    );
});

QuestionEditor.displayName = 'QuestionEditor';
