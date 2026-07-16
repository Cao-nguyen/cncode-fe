import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_DESKTOP_SPEED = 0.55;
const DEFAULT_MOBILE_SPEED = 0.06;
const DEFAULT_BREAKPOINT = 1024;

function normalizeScroll(el: HTMLDivElement) {
    const half = el.scrollWidth / 2;
    if (half <= 0) return;
    while (el.scrollLeft >= half) el.scrollLeft -= half;
    while (el.scrollLeft < 0) el.scrollLeft += half;
}

export function useHorizontalMarquee(options?: {
    desktopSpeed?: number;
    mobileSpeed?: number;
    mobileBreakpoint?: number;
    enabled?: boolean;
}) {
    const {
        desktopSpeed = DEFAULT_DESKTOP_SPEED,
        mobileSpeed = DEFAULT_MOBILE_SPEED,
        mobileBreakpoint = DEFAULT_BREAKPOINT,
        enabled = true,
    } = options ?? {};

    const containerRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number>(0);
    const isMobileRef = useRef(false);
    const isPausedRef = useRef(false);
    const isHoveringRef = useRef(false);
    const isDraggingRef = useRef(false);
    const dragRef = useRef({ startX: 0, startY: 0, startScrollLeft: 0, pointerId: -1 });
    const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dragMovedRef = useRef(false);
    const isHorizontalScrollRef = useRef(false);

    const [isDragging, setIsDragging] = useState(false);

    const pauseAutoScroll = useCallback((resumeAfterMs = 0) => {
        isPausedRef.current = true;
        if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
        if (resumeAfterMs > 0) {
            resumeTimeoutRef.current = setTimeout(() => {
                if (!isDraggingRef.current) isPausedRef.current = false;
            }, resumeAfterMs);
        }
    }, []);

    const resumeAutoScroll = useCallback(() => {
        if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
        isPausedRef.current = false;
    }, []);

    useEffect(() => {
        const updateViewport = () => {
            isMobileRef.current = window.innerWidth < mobileBreakpoint;
        };
        updateViewport();
        window.addEventListener('resize', updateViewport);
        return () => window.removeEventListener('resize', updateViewport);
    }, [mobileBreakpoint]);

    useEffect(() => {
        if (!enabled) return;

        const tick = () => {
            const el = containerRef.current;
            if (el && !isPausedRef.current && !isDraggingRef.current) {
                const speed = isMobileRef.current ? mobileSpeed : desktopSpeed;
                el.scrollLeft += speed;
                normalizeScroll(el);
            }
            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => {
            cancelAnimationFrame(rafRef.current);
            if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
        };
    }, [enabled, desktopSpeed, mobileSpeed]);

    const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        const el = containerRef.current;
        if (!el) return;

        pauseAutoScroll();
        dragMovedRef.current = false;
        isHorizontalScrollRef.current = false;
        isDraggingRef.current = true;
        setIsDragging(true);
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startScrollLeft: el.scrollLeft,
            pointerId: e.pointerId,
        };
        // Don't set pointer capture on mobile to allow vertical page scroll
        if (!isMobileRef.current) {
            el.setPointerCapture(e.pointerId);
        }
    }, [pauseAutoScroll]);

    const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDraggingRef.current || e.pointerId !== dragRef.current.pointerId) return;

        const el = containerRef.current;
        if (!el) return;

        const deltaX = dragRef.current.startX - e.clientX;
        const deltaY = dragRef.current.startY - e.clientY;

        // Determine scroll direction based on which axis has more movement
        if (!isHorizontalScrollRef.current) {
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 5) {
                isHorizontalScrollRef.current = true;
            } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 5) {
                // Vertical scroll detected, don't interfere with page scroll
                isDraggingRef.current = false;
                setIsDragging(false);
                if (!isMobileRef.current) {
                    el.releasePointerCapture(e.pointerId);
                }
                return;
            }
        }

        // Only scroll horizontally if horizontal scroll was detected
        if (isHorizontalScrollRef.current) {
            if (Math.abs(deltaX) > 4) dragMovedRef.current = true;
            el.scrollLeft = dragRef.current.startScrollLeft + deltaX;
            normalizeScroll(el);
        }
    }, []);

    const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDraggingRef.current || e.pointerId !== dragRef.current.pointerId) return;

        isDraggingRef.current = false;
        setIsDragging(false);
        containerRef.current?.releasePointerCapture(e.pointerId);

        if (containerRef.current) normalizeScroll(containerRef.current);
        if (!isHoveringRef.current) {
            pauseAutoScroll(isMobileRef.current ? 2500 : 800);
        }

        // Reset drag moved flag after a short delay to allow click to work
        setTimeout(() => {
            dragMovedRef.current = false;
        }, 50);
    }, [pauseAutoScroll]);

    const onMouseEnter = useCallback(() => {
        isHoveringRef.current = true;
        pauseAutoScroll();
    }, [pauseAutoScroll]);

    const onMouseLeave = useCallback(() => {
        isHoveringRef.current = false;
        if (!isDraggingRef.current) resumeAutoScroll();
    }, [resumeAutoScroll]);

    const onTouchStart = useCallback(() => {
        pauseAutoScroll();
    }, [pauseAutoScroll]);

    const onTouchEnd = useCallback(() => {
        pauseAutoScroll(isMobileRef.current ? 3000 : 800);
    }, [pauseAutoScroll]);

    return {
        containerRef,
        isDragging,
        dragMovedRef,
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerCancel: onPointerUp,
        onMouseEnter,
        onMouseLeave,
        onTouchStart,
        onTouchEnd,
    };
}
