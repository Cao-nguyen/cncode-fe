'use client';

import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface RichContentProps {
    content: string;
    className?: string;
}

/**
 * RichContent - Renders markdown + KaTeX formulas
 * Supports inline math: $formula$ and display math: $$formula$$
 */
export default function RichContent({ content, className = '' }: RichContentProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Handle empty or whitespace-only content
        if (!content || !content.trim()) {
            containerRef.current.innerHTML = '';
            return;
        }

        // Process markdown-like content with KaTeX
        let processed = content;

        // Replace display math $$...$$ first
        processed = processed.replace(/\$\$([\s\S]+?)\$\$/g, (match, formula) => {
            try {
                const html = katex.renderToString(formula.trim(), {
                    throwOnError: false,
                    displayMode: true
                });
                return `<div class="math-display">${html}</div>`;
            } catch {
                return match;
            }
        });

        // Replace inline math $...$ with padding spaces to prevent sticking
        processed = processed.replace(/\$([^\$\n]+?)\$/g, (match, formula) => {
            try {
                const html = katex.renderToString(formula.trim(), {
                    throwOnError: false,
                    displayMode: false
                });
                // Add thin spaces around math to prevent sticking to adjacent text
                return `<span class="math-inline" style="margin: 0 2px;">${html}</span>`;
            } catch {
                return match;
            }
        });

        // Basic markdown support
        // Bold **text**
        processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

        // Italic *text*
        processed = processed.replace(/\*(.+?)\*/g, '<em>$1</em>');

        // Code `code`
        processed = processed.replace(/`(.+?)`/g, '<code>$1</code>');

        // Line breaks
        processed = processed.replace(/\n/g, '<br>');

        containerRef.current.innerHTML = processed;
    }, [content]);

    return (
        <div
            ref={containerRef}
            className={`rich-content ${className}`}
            style={{
                lineHeight: '1.6',
            }}
        />
    );
}