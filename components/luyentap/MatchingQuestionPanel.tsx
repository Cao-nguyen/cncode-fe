'use client';

import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import StaticContent from '@/components/common/StaticContent';

export type MatchingPair = { leftIndex: number; rightIndex: number };

interface MatchingQuestionPanelProps {
    leftItems: Array<{ text: string }>;
    rightItems: Array<{ text: string }>;
    value: MatchingPair[];
    onChange: (value: MatchingPair[]) => void;
    disabled?: boolean;
}

const PAIR_COLORS = [
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#f59e0b',
    '#10b981',
    '#06b6d4',
    '#ef4444',
    '#6366f1',
];

function getPairColor(index: number): string {
    return PAIR_COLORS[index % PAIR_COLORS.length];
}

type LineSegment = {
    leftIndex: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color: string;
};

type DragState = {
    side: 'left' | 'right';
    index: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
};

export default function MatchingQuestionPanel({
    leftItems,
    rightItems,
    value,
    onChange,
    disabled = false,
}: MatchingQuestionPanelProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const leftRefs = useRef<(HTMLDivElement | null)[]>([]);
    const rightRefs = useRef<(HTMLDivElement | null)[]>([]);

    const [lines, setLines] = useState<LineSegment[]>([]);
    const [dragging, setDragging] = useState<DragState | null>(null);
    const [pendingLeft, setPendingLeft] = useState<number | null>(null);

    const valueMap = useMemo(() => {
        const map = new Map<number, number>();
        value.forEach((pair) => map.set(pair.leftIndex, pair.rightIndex));
        return map;
    }, [value]);

    const rightUsedBy = useMemo(() => {
        const map = new Map<number, number>();
        value.forEach((pair) => map.set(pair.rightIndex, pair.leftIndex));
        return map;
    }, [value]);

    const updateLines = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const nextLines: LineSegment[] = [];

        value.forEach((pair) => {
            const leftEl = leftRefs.current[pair.leftIndex];
            const rightEl = rightRefs.current[pair.rightIndex];
            if (!leftEl || !rightEl) return;

            const leftRect = leftEl.getBoundingClientRect();
            const rightRect = rightEl.getBoundingClientRect();

            nextLines.push({
                leftIndex: pair.leftIndex,
                x1: leftRect.right - rect.left,
                y1: leftRect.top + leftRect.height / 2 - rect.top,
                x2: rightRect.left - rect.left,
                y2: rightRect.top + rightRect.height / 2 - rect.top,
                color: getPairColor(pair.leftIndex),
            });
        });

        setLines(nextLines);
    }, [value]);

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

    const connect = useCallback(
        (leftIndex: number, rightIndex: number) => {
            if (disabled) return;
            const next = value.filter(
                (pair) => pair.leftIndex !== leftIndex && pair.rightIndex !== rightIndex,
            );
            next.push({ leftIndex, rightIndex });
            onChange(next);
        },
        [disabled, onChange, value],
    );

    const disconnectLeft = useCallback(
        (leftIndex: number) => {
            if (disabled) return;
            onChange(value.filter((pair) => pair.leftIndex !== leftIndex));
        },
        [disabled, onChange, value],
    );

    const getAnchor = (side: 'left' | 'right', index: number) => {
        const container = containerRef.current;
        const el = side === 'left' ? leftRefs.current[index] : rightRefs.current[index];
        if (!container || !el) return null;

        const containerRect = container.getBoundingClientRect();
        const itemRect = el.getBoundingClientRect();

        return {
            x: side === 'left' ? itemRect.right - containerRect.left : itemRect.left - containerRect.left,
            y: itemRect.top + itemRect.height / 2 - containerRect.top,
        };
    };

    const finishDrag = (side: 'left' | 'right', index: number, clientX: number, clientY: number) => {
        const target = document.elementFromPoint(clientX, clientY);
        if (!target) return;

        if (side === 'left') {
            const rightEl = target.closest('[data-matching-right]');
            if (!rightEl) return;
            const rightIndex = parseInt(rightEl.getAttribute('data-matching-right') || '', 10);
            if (!Number.isNaN(rightIndex)) connect(index, rightIndex);
            return;
        }

        const leftEl = target.closest('[data-matching-left]');
        if (!leftEl) return;
        const leftIndex = parseInt(leftEl.getAttribute('data-matching-left') || '', 10);
        if (!Number.isNaN(leftIndex)) connect(leftIndex, index);
    };

    const startDrag = (side: 'left' | 'right', index: number, event: React.PointerEvent) => {
        if (disabled) return;

        event.preventDefault();
        event.stopPropagation();

        const anchor = getAnchor(side, index);
        if (!anchor) return;

        setDragging({
            side,
            index,
            x1: anchor.x,
            y1: anchor.y,
            x2: anchor.x,
            y2: anchor.y,
        });
        setPendingLeft(null);

        const container = containerRef.current;
        if (!container) return;
        const containerRect = container.getBoundingClientRect();

        const onMove = (ev: PointerEvent) => {
            setDragging((current) =>
                current
                    ? {
                          ...current,
                          x2: ev.clientX - containerRect.left,
                          y2: ev.clientY - containerRect.top,
                      }
                    : null,
            );
        };

        const onUp = (ev: PointerEvent) => {
            finishDrag(side, index, ev.clientX, ev.clientY);
            setDragging(null);
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };

    const handleLeftClick = (leftIndex: number) => {
        if (disabled || dragging) return;

        if (pendingLeft === leftIndex) {
            disconnectLeft(leftIndex);
            setPendingLeft(null);
            return;
        }

        setPendingLeft(leftIndex);
    };

    const handleRightClick = (rightIndex: number) => {
        if (disabled || dragging) return;

        if (pendingLeft !== null) {
            connect(pendingLeft, rightIndex);
            setPendingLeft(null);
        }
    };

    const dragColor =
        dragging?.side === 'left'
            ? getPairColor(dragging.index)
            : dragging
              ? getPairColor(rightUsedBy.get(dragging.index) ?? dragging.index)
              : undefined;

    return (
        <div ref={containerRef} className="relative select-none">
            <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full" aria-hidden>
                {lines.map((line) => (
                    <line
                        key={`${line.leftIndex}-${line.x1}-${line.y1}`}
                        x1={line.x1}
                        y1={line.y1}
                        x2={line.x2}
                        y2={line.y2}
                        stroke={line.color}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                    />
                ))}
                {dragging && dragColor && (
                    <line
                        x1={dragging.x1}
                        y1={dragging.y1}
                        x2={dragging.x2}
                        y2={dragging.y2}
                        stroke={dragColor}
                        strokeWidth={2.5}
                        strokeDasharray="6 4"
                        strokeLinecap="round"
                    />
                )}
            </svg>

            <div className="relative z-10 grid grid-cols-2 gap-3 sm:gap-10 md:gap-16">
                <div className="space-y-2 sm:space-y-3">
                    {leftItems.map((item, leftIndex) => {
                        const connectedRight = valueMap.get(leftIndex);
                        const connected = connectedRight !== undefined;
                        const color = connected ? getPairColor(leftIndex) : undefined;
                        const isPending = pendingLeft === leftIndex;

                        return (
                            <div
                                key={leftIndex}
                                ref={(el) => {
                                    leftRefs.current[leftIndex] = el;
                                }}
                                data-matching-left={leftIndex}
                                onClick={() => handleLeftClick(leftIndex)}
                                className={`flex items-center gap-1.5 rounded-xl border bg-white p-2 sm:gap-2 sm:p-3 dark:bg-gray-800 ${
                                    isPending
                                        ? 'border-blue-500 ring-2 ring-blue-200'
                                        : connected
                                          ? 'border-gray-200'
                                          : 'border-gray-100 dark:border-gray-700'
                                } ${!disabled ? 'cursor-pointer' : ''}`}
                                style={connected ? { borderColor: color } : undefined}
                            >
                                <span className="shrink-0 text-xs font-semibold text-gray-500 sm:text-sm">
                                    {leftIndex + 1}.
                                </span>
                                <StaticContent
                                    content={item.text}
                                    className="min-w-0 flex-1 text-xs prose prose-sm sm:text-sm"
                                />
                                {!disabled && (
                                    <button
                                        type="button"
                                        className="h-4 w-4 shrink-0 touch-none rounded-full border-2 cursor-crosshair"
                                        style={{
                                            borderColor: color || '#94a3b8',
                                            backgroundColor: connected ? color : 'white',
                                        }}
                                        onPointerDown={(event) => startDrag('left', leftIndex, event)}
                                        aria-label={`Nối mục ${leftIndex + 1}`}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="space-y-2 sm:space-y-3">
                    {rightItems.map((item, rightIndex) => {
                        const leftIndex = rightUsedBy.get(rightIndex);
                        const connected = leftIndex !== undefined;
                        const color = connected ? getPairColor(leftIndex) : undefined;
                        const canDrop = pendingLeft !== null && !disabled;

                        return (
                            <div
                                key={rightIndex}
                                ref={(el) => {
                                    rightRefs.current[rightIndex] = el;
                                }}
                                data-matching-right={rightIndex}
                                onClick={() => handleRightClick(rightIndex)}
                                className={`flex items-center gap-1.5 rounded-xl border bg-white p-2 sm:gap-2 sm:p-3 dark:bg-gray-800 ${
                                    connected ? 'border-gray-200' : 'border-gray-100 dark:border-gray-700'
                                } ${canDrop ? 'cursor-pointer hover:border-blue-300 hover:bg-blue-50/40' : ''}`}
                                style={connected ? { borderColor: color } : undefined}
                            >
                                {!disabled && (
                                    <button
                                        type="button"
                                        className="h-4 w-4 shrink-0 touch-none rounded-full border-2 cursor-crosshair"
                                        style={{
                                            borderColor: color || '#94a3b8',
                                            backgroundColor: connected ? color : 'white',
                                        }}
                                        onPointerDown={(event) => startDrag('right', rightIndex, event)}
                                        aria-label={`Nối mục ${String.fromCharCode(97 + rightIndex)}`}
                                    />
                                )}
                                <span className="shrink-0 text-xs font-semibold text-gray-500 sm:text-sm">
                                    {String.fromCharCode(97 + rightIndex)}.
                                </span>
                                <StaticContent
                                    content={item.text}
                                    className="min-w-0 flex-1 text-xs prose prose-sm sm:text-sm"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {!disabled && (
                <p className="mt-3 text-center text-xs text-gray-400">
                    Kéo từ chấm tròn giữa hai cột để nối, hoặc chọn cột trái rồi chọn cột phải
                </p>
            )}
        </div>
    );
}
