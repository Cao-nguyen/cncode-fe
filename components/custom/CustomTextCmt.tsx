'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface CustomTextareaProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    onSubmit?: () => void;
    submitLabel?: string;
    isSubmitting?: boolean;
    autoFocus?: boolean;
    onCancel?: () => void;
    cancelLabel?: string;
    showActions?: boolean;
    label?: string;
    error?: string;
    rows?: number;
    maxLength?: number;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}

export const CustomTextCmt: React.FC<CustomTextareaProps> = ({
    value = '',
    onChange,
    placeholder = 'Tham gia cuộc trò chuyện',
    onSubmit,
    submitLabel = 'Bình luận',
    isSubmitting = false,
    autoFocus = false,
    onCancel,
    cancelLabel = 'Hủy',
    showActions = true,
    label,
    error,
    maxLength,
    required = false,
    disabled = false,
    className = '',
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showToolbar, setShowToolbar] = useState(false);
    const [charCount, setCharCount] = useState(value.length);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (autoFocus && textareaRef.current) {
            textareaRef.current.focus();
            setIsExpanded(true);
        }
    }, [autoFocus]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                if (!value.trim()) {
                    setIsExpanded(false);
                    setShowToolbar(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        if (maxLength && newValue.length > maxLength) return;
        setCharCount(newValue.length);
        onChange?.(newValue);
    };

    const handleFocus = () => {
        setIsExpanded(true);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            if (onSubmit && value.trim() !== '' && !isSubmitting) {
                onSubmit();
            }
        }
    };

    const toggleToolbar = () => {
        setShowToolbar(!showToolbar);
        setIsExpanded(true);
    };

    const handleCancel = () => {
        setIsExpanded(false);
        setShowToolbar(false);
        onCancel?.();
    };

    const handleSubmit = () => {
        if (onSubmit && value.trim() !== '' && !isSubmitting) {
            onSubmit();
        }
    };

    const handleFormatAction = (action: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);
        let newText = value;

        switch (action) {
            case 'bold':
                newText = value.substring(0, start) + `**${selectedText}**` + value.substring(end);
                break;
            case 'italic':
                newText = value.substring(0, start) + `*${selectedText}*` + value.substring(end);
                break;
            case 'strikethrough':
                newText = value.substring(0, start) + `~~${selectedText}~~` + value.substring(end);
                break;
            case 'underline':
                newText = value.substring(0, start) + `<u>${selectedText}</u>` + value.substring(end);
                break;
            case 'superscript':
                newText = value.substring(0, start) + `<sup>${selectedText}</sup>` + value.substring(end);
                break;
            case 'code':
                newText = value.substring(0, start) + `` + selectedText + `` + value.substring(end);
                break;
            case 'codeblock':
                newText = value.substring(0, start) + `\`\`\`\n${selectedText}\n\`\`\`` + value.substring(end);
                break;
            case 'link':
                newText = value.substring(0, start) + `[${selectedText}](url)` + value.substring(end);
                break;
            case 'quote':
                newText = value.substring(0, start) + `> ${selectedText}` + value.substring(end);
                break;
            case 'ul':
                newText = value.substring(0, start) + `- ${selectedText}` + value.substring(end);
                break;
            case 'ol':
                newText = value.substring(0, start) + `1. ${selectedText}` + value.substring(end);
                break;
            case 'table':
                newText = value.substring(0, start) + `| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |` + value.substring(end);
                break;
            default:
                return;
        }

        onChange?.(newText);
        
        // Restore cursor position after formatting
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + (action === 'code' ? 1 : action === 'codeblock' ? 4 : 2) + selectedText.length + (action === 'code' ? 1 : action === 'codeblock' ? 4 : 2);
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const formattingButtons = [
        { icon: '/editor/bold-text.png', label: 'Bold', action: 'bold' },
        { icon: '/editor/italic-font.png', label: 'Italic', action: 'italic' },
        { icon: '/editor/underline.png', label: 'Underline', action: 'underline' },
        { icon: '/editor/strikethrough.png', label: 'Strikethrough', action: 'strikethrough' },
        { icon: '/editor/text.png', label: 'Superscript', action: 'superscript' },
        { icon: '/editor/link.png', label: 'Link', action: 'link' },
        { icon: '/editor/quote.png', label: 'Quote', action: 'quote' },
        { icon: '/editor/code.png', label: 'Code', action: 'code' },
        { icon: '/editor/code (1).png', label: 'Code Block', action: 'codeblock' },
        { icon: '/editor/table.png', label: 'Table', action: 'table' },
    ];

    return (
        <div ref={containerRef} className={`w-full ${className}`}>
            {label && (
                <label className="block font-medium text-gray-700 mb-1.5 text-sm">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="border border-gray-200 rounded-xl">
                {/* Formatting Toolbar */}
                {showToolbar && (
                    <div className="flex items-center px-3 py-1 gap-2">
                        <div className="flex items-center gap-2">
                            {formattingButtons.slice(0, 4).map((btn, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleFormatAction(btn.action)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    title={btn.label}
                                >
                                    <img src={btn.icon} alt={btn.label} className="w-3.5 h-3.5" />
                                </button>
                            ))}
                        </div>
                        <div className="w-px h-5 bg-gray-200 mx-1" />
                        <div className="flex items-center gap-2">
                            {formattingButtons.slice(4, 7).map((btn, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleFormatAction(btn.action)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    title={btn.label}
                                >
                                    <img src={btn.icon} alt={btn.label} className="w-3.5 h-3.5" />
                                </button>
                            ))}
                        </div>
                        <div className="w-px h-5 bg-gray-200 mx-1" />
                        <div className="flex items-center gap-2">
                            {formattingButtons.slice(7).map((btn, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleFormatAction(btn.action)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    title={btn.label}
                                >
                                    <img src={btn.icon} alt={btn.label} className="w-3.5 h-3.5" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Textarea */}
                <div className="relative">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled}
                        maxLength={maxLength}
                        className={`w-full px-4 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 ${
                            isExpanded ? (showToolbar ? 'min-h-[60px] resize-y' : 'min-h-[60px] pt-2 resize-y') : 'h-8 py-2.5 overflow-hidden resize-none'
                        }`}
                        style={{
                            scrollbarWidth: isExpanded ? 'auto' : 'none',
                        }}
                    />
                    
                    {/* Compact mode indicator */}
                    {!isExpanded && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <ChevronDown size={18} />
                        </div>
                    )}
                </div>

                {/* Expanded Actions */}
                {isExpanded && (
                    <div className="flex items-center justify-between px-4 py-1">
                        {/* Left side: Media icons */}
                        <div className="flex items-center gap-1">
                            <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-600" title="Thêm ảnh">
                                <img src="/editor/gallery.png" alt="Image" className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-600" title="Thêm video">
                                <img src="/editor/play-button.png" alt="Video" className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-600" title="Thêm GIF">
                                <img src="/editor/gif.png" alt="GIF" className="w-4 h-4" />
                            </button>
                            <button
                                onClick={toggleToolbar}
                                className={`p-1.5 rounded-full transition-colors ${
                                    showToolbar ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
                                }`}
                                title="Định dạng văn bản"
                            >
                                <img src="/editor/text-size.png" alt="Format" className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Right side: Action buttons */}
                        {showActions && (
                            <div className="flex items-center gap-2">
                                {onCancel && (
                                    <button
                                        onClick={handleCancel}
                                        className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        {cancelLabel}
                                    </button>
                                )}
                                {onSubmit && (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!value.trim() || isSubmitting}
                                        className="px-3 py-1.5 text-xs font-medium bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Đang gửi...
                                            </>
                                        ) : (
                                            submitLabel
                                        )}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            {maxLength && (
                <div className="text-right text-xs text-gray-400 mt-1">
                    {charCount}/{maxLength}
                </div>
            )}
        </div>
    );
};
