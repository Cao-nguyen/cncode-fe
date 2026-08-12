'use client';

import React from 'react';
import { BookContent } from '@/lib/data/cnbooks.data';
import { HIGHLIGHT_COLORS, TextHighlight } from '@/lib/cnbooks/annotations';

interface BookPageContentProps {
    items: BookContent[];
    startContentIndex: number;
    highlights: TextHighlight[];
    selectable?: boolean;
}

function applyHighlightsToText(
    text: string,
    contentIndex: number,
    highlights: TextHighlight[]
): React.ReactNode {
    const relevant = highlights
        .filter((h) => h.contentIndex === contentIndex)
        .sort((a, b) => b.start - a.start);

    if (relevant.length === 0) return text;

    let nodes: React.ReactNode[] = [text];

    let segmentKey = 0;

    for (const hl of relevant) {
        const next: React.ReactNode[] = [];
        for (const node of nodes) {
            if (typeof node !== 'string') {
                next.push(node);
                continue;
            }
            const before = node.slice(0, hl.start);
            const mid = node.slice(hl.start, hl.end);
            const after = node.slice(hl.end);
            if (before) next.push(before);
            if (mid) {
                next.push(
                    <mark
                        key={`${hl.id}-${contentIndex}-${segmentKey++}`}
                        data-highlight-id={hl.id}
                        style={{
                            backgroundColor: HIGHLIGHT_COLORS[hl.color].bg,
                            borderRadius: '2px',
                            padding: '0 1px',
                        }}
                    >
                        {mid}
                    </mark>
                );
            }
            if (after) next.push(after);
        }
        nodes = next;
    }

    return nodes;
}

function TextBlock({
    text,
    contentIndex,
    highlights,
    className,
    as: Tag = 'p',
}: {
    text: string;
    contentIndex: number;
    highlights: TextHighlight[];
    className?: string;
    as?: 'p' | 'h2' | 'h3' | 'span';
}) {
    return (
        <Tag
            className={className}
            data-content-index={contentIndex}
            data-selectable="true"
        >
            {applyHighlightsToText(text, contentIndex, highlights)}
        </Tag>
    );
}

export function BookPageContent({
    items,
    startContentIndex,
    highlights,
    selectable = true,
}: BookPageContentProps) {
    return (
        <div className={selectable ? 'select-text' : 'select-none'}>
            {items.map((item, idx) => {
                const contentIndex = startContentIndex + idx;

                if (item.type === 'paragraph') {
                    return (
                        <TextBlock
                            key={contentIndex}
                            text={item.text ?? ''}
                            contentIndex={contentIndex}
                            highlights={highlights}
                            className="mb-4 text-[15px] leading-[1.85] text-gray-700 indent-6 first:indent-0"
                        />
                    );
                }

                if (item.type === 'heading' && item.level === 2) {
                    return (
                        <TextBlock
                            key={contentIndex}
                            text={item.text ?? ''}
                            contentIndex={contentIndex}
                            highlights={highlights}
                            as="h2"
                            className="mb-3 mt-2 text-lg font-bold text-gray-900 tracking-tight"
                        />
                    );
                }

                if (item.type === 'heading' && item.level === 3) {
                    return (
                        <TextBlock
                            key={contentIndex}
                            text={item.text ?? ''}
                            contentIndex={contentIndex}
                            highlights={highlights}
                            as="h3"
                            className="mb-2 mt-3 text-base font-semibold text-gray-900"
                        />
                    );
                }

                if (item.type === 'note') {
                    const styleMap = {
                        tip: 'border-l-amber-500 bg-amber-50/80',
                        warning: 'border-l-orange-500 bg-orange-50/80',
                        important: 'border-l-red-500 bg-red-50/80',
                    };
                    const labelMap = {
                        tip: '💡 Mẹo',
                        warning: '⚠️ Lưu ý',
                        important: '❗ Quan trọng',
                    };
                    const style = item.style ?? 'tip';
                    return (
                        <div
                            key={contentIndex}
                            className={`mb-4 border-l-4 p-3 text-sm leading-relaxed text-gray-700 ${styleMap[style]}`}
                        >
                            <span
                                className="font-semibold text-gray-800"
                                data-content-index={contentIndex}
                                data-selectable="true"
                            >
                                {labelMap[style]}:{' '}
                                {applyHighlightsToText(
                                    item.text ?? '',
                                    contentIndex,
                                    highlights
                                )}
                            </span>
                        </div>
                    );
                }

                if (item.type === 'code') {
                    return (
                        <div key={contentIndex} className="mb-4 select-none">
                            <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-900 shadow-sm">
                                {item.caption && (
                                    <div className="border-b border-gray-700 bg-gray-800 px-3 py-1 text-[11px] text-gray-400">
                                        {item.caption}
                                    </div>
                                )}
                                <pre className="overflow-x-auto p-3">
                                    <code className="font-mono text-[13px] leading-relaxed text-emerald-300">
                                        {item.code}
                                    </code>
                                </pre>
                            </div>
                        </div>
                    );
                }

                return null;
            })}
        </div>
    );
}

export function getSelectionInContent(
    container: HTMLElement
): { contentIndex: number; start: number; end: number; text: string } | null {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    if (!container.contains(range.commonAncestorContainer)) return null;

    const text = selection.toString().trim();
    if (!text) return null;

    let startEl: HTMLElement | null =
        range.startContainer.nodeType === Node.TEXT_NODE
            ? (range.startContainer.parentElement as HTMLElement)
            : (range.startContainer as HTMLElement);

    while (startEl && !startEl.dataset.contentIndex) {
        startEl = startEl.parentElement;
    }
    if (!startEl?.dataset.contentIndex) return null;

    const contentIndex = parseInt(startEl.dataset.contentIndex, 10);

    const blockText = startEl.textContent ?? '';
    const selectedText = selection.toString();

    let start = blockText.indexOf(selectedText);
    if (start === -1) {
        start = range.startOffset;
    }
    const end = start + selectedText.length;

    return { contentIndex, start, end, text: selectedText };
}

export function getReadModeSelection(
    container: HTMLElement
): { x: number; y: number; text: string } | null {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    if (!container.contains(range.commonAncestorContainer)) return null;

    const text = selection.toString().trim();
    if (!text || text.length < 2) return null;

    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return null;

    return {
        x: rect.left + rect.width / 2,
        y: rect.top - 8,
        text,
    };
}
