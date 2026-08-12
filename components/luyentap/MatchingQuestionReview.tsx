'use client';

import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import StaticContent from '@/components/common/StaticContent';
import { cn } from '@/lib/utils';

export type MatchingPair = { leftIndex: number; rightIndex: number };

interface MatchingQuestionReviewProps {
    leftItems: Array<{ text: string }>;
    rightItems: Array<{ text: string }>;
    userPairs: MatchingPair[];
    correctPairs?: MatchingPair[];
}

type LineSegment = {
    key: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color: string;
};

function isPairCorrect(
    leftIndex: number,
    rightIndex: number,
    correctPairs: MatchingPair[],
) {
    const correct = correctPairs.find((pair) => pair.leftIndex === leftIndex);
    return correct?.rightIndex === rightIndex;
}

export default function MatchingQuestionReview({
    leftItems,
    rightItems,
    userPairs,
    correctPairs = [],
}: MatchingQuestionReviewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const leftRefs = useRef<(HTMLDivElement | null)[]>([]);
    const rightRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [lines, setLines] = useState<LineSegment[]>([]);

    const userMap = useMemo(() => {
        const map = new Map<number, number>();
        userPairs.forEach((pair) => map.set(pair.leftIndex, pair.rightIndex));
        return map;
    }, [userPairs]);

    const rightUsedBy = useMemo(() => {
        const map = new Map<number, number>();
        userPairs.forEach((pair) => map.set(pair.rightIndex, pair.leftIndex));
        return map;
    }, [userPairs]);

    const updateLines = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const nextLines: LineSegment[] = [];

        userPairs.forEach((pair) => {
            const leftEl = leftRefs.current[pair.leftIndex];
            const rightEl = rightRefs.current[pair.rightIndex];
            if (!leftEl || !rightEl) return;

            const leftRect = leftEl.getBoundingClientRect();
            const rightRect = rightEl.getBoundingClientRect();
            const correct = isPairCorrect(pair.leftIndex, pair.rightIndex, correctPairs);

            nextLines.push({
                key: `${pair.leftIndex}-${pair.rightIndex}`,
                x1: leftRect.right - rect.left,
                y1: leftRect.top + leftRect.height / 2 - rect.top,
                x2: rightRect.left - rect.left,
                y2: rightRect.top + rightRect.height / 2 - rect.top,
                color: correct ? '#10b981' : '#ef4444',
            });
        });

        setLines(nextLines);
    }, [userPairs, correctPairs]);

    useLayoutEffect(() => {
        updateLines();

        const container = containerRef.current;
        if (!container) return;

        const observer = new ResizeObserver(updateLines);
        observer.observe(container);
        window.addEventListener('resize', updateLines);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateLines);
        };
    }, [updateLines, leftItems.length, rightItems.length]);

    return (
        <div ref={containerRef} className="relative mt-4 select-none">
            <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full" aria-hidden>
                {lines.map((line) => (
                    <line
                        key={line.key}
                        x1={line.x1}
                        y1={line.y1}
                        x2={line.x2}
                        y2={line.y2}
                        stroke={line.color}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                    />
                ))}
            </svg>

            <div className="relative z-10 grid grid-cols-2 gap-3 sm:gap-10 md:gap-16">
                <div className="space-y-2 sm:space-y-3">
                    {leftItems.map((item, leftIndex) => {
                        const connectedRight = userMap.get(leftIndex);
                        const connected = connectedRight !== undefined;
                        const correct = connected
                            && isPairCorrect(leftIndex, connectedRight, correctPairs);
                        const tone = !connected ? 'neutral' : correct ? 'success' : 'danger';

                        return (
                            <div
                                key={leftIndex}
                                ref={(el) => { leftRefs.current[leftIndex] = el; }}
                                className={cn(
                                    'flex items-center gap-2 rounded-xl border bg-[var(--cn-bg-card)] p-2.5 sm:p-3',
                                    tone === 'success' && 'border-emerald-300',
                                    tone === 'danger' && 'border-red-300',
                                    tone === 'neutral' && 'border-[var(--cn-border)]',
                                )}
                            >
                                <span className="shrink-0 text-xs font-semibold text-[var(--cn-text-muted)] sm:text-sm">
                                    {leftIndex + 1}.
                                </span>
                                <StaticContent
                                    content={item.text}
                                    className="min-w-0 flex-1 text-xs prose prose-sm sm:text-sm"
                                />
                                <span
                                    className={cn(
                                        'h-3 w-3 shrink-0 rounded-full border-2',
                                        tone === 'success' && 'border-emerald-500 bg-emerald-500',
                                        tone === 'danger' && 'border-red-500 bg-red-500',
                                        tone === 'neutral' && 'border-[var(--cn-border)] bg-[var(--cn-bg-card)]',
                                    )}
                                />
                            </div>
                        );
                    })}
                </div>

                <div className="space-y-2 sm:space-y-3">
                    {rightItems.map((item, rightIndex) => {
                        const leftIndex = rightUsedBy.get(rightIndex);
                        const connected = leftIndex !== undefined;
                        const correct = connected
                            && isPairCorrect(leftIndex, rightIndex, correctPairs);
                        const tone = !connected ? 'neutral' : correct ? 'success' : 'danger';

                        return (
                            <div
                                key={rightIndex}
                                ref={(el) => { rightRefs.current[rightIndex] = el; }}
                                className={cn(
                                    'flex items-center gap-2 rounded-xl border bg-[var(--cn-bg-card)] p-2.5 sm:p-3',
                                    tone === 'success' && 'border-emerald-300',
                                    tone === 'danger' && 'border-red-300',
                                    tone === 'neutral' && 'border-[var(--cn-border)]',
                                )}
                            >
                                <span
                                    className={cn(
                                        'h-3 w-3 shrink-0 rounded-full border-2',
                                        tone === 'success' && 'border-emerald-500 bg-emerald-500',
                                        tone === 'danger' && 'border-red-500 bg-red-500',
                                        tone === 'neutral' && 'border-[var(--cn-border)] bg-[var(--cn-bg-card)]',
                                    )}
                                />
                                <span className="shrink-0 text-xs font-semibold text-[var(--cn-text-muted)] sm:text-sm">
                                    {String.fromCharCode(97 + rightIndex)}.
                                </span>
                                <StaticContent
                                    content={item.text}
                                    className={cn(
                                        'min-w-0 flex-1 text-xs prose prose-sm sm:text-sm',
                                        tone === 'success' && 'text-emerald-700',
                                        tone === 'danger' && 'text-red-700',
                                    )}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
