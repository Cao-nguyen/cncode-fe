import { useState, useRef, useCallback, useEffect } from 'react';

interface UseCarouselOptions {
    autoSlide?: boolean;
    autoSlideInterval?: number;
    minSwipeDistance?: number;
}

interface UseCarouselReturn {
    current: number;
    isTransitioning: boolean;
    dragOffset: number;
    next: () => void;
    prev: () => void;
    goTo: (index: number) => void;
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
    pauseAutoSlide: () => void;
    resumeAutoSlide: (delay?: number) => void;
}

export function useCarousel<T>(
    items: T[],
    options: UseCarouselOptions = {}
): UseCarouselReturn {
    const {
        autoSlide = true,
        autoSlideInterval = 3000,
        minSwipeDistance = 50,
    } = options;

    const [current, setCurrent] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);

    const touchStartRef = useRef<number | null>(null);
    const touchEndRef = useRef<number | null>(null);
    const mouseStartRef = useRef<number | null>(null);
    const mouseEndRef = useRef<number | null>(null);
    const isDraggingRef = useRef(false);
    const autoSlideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const next = useCallback(() => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrent((prev) => (prev + 1) % items.length);
        setTimeout(() => setIsTransitioning(false), 300);
    }, [items.length, isTransitioning]);

    const prev = useCallback(() => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrent((prev) => (prev - 1 + items.length) % items.length);
        setTimeout(() => setIsTransitioning(false), 300);
    }, [items.length, isTransitioning]);

    const goTo = useCallback((index: number) => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrent(index);
        setTimeout(() => setIsTransitioning(false), 300);
    }, [isTransitioning]);

    const pauseAutoSlide = useCallback(() => {
        if (autoSlideTimerRef.current) {
            clearTimeout(autoSlideTimerRef.current);
            autoSlideTimerRef.current = null;
        }
    }, []);

    const resumeAutoSlide = useCallback((delay = autoSlideInterval) => {
        pauseAutoSlide();
        if (autoSlide && items.length > 1) {
            autoSlideTimerRef.current = setTimeout(() => {
                next();
            }, delay);
        }
    }, [autoSlide, autoSlideInterval, items.length, next, pauseAutoSlide]);

    // Touch handlers
    const onTouchStart = useCallback((e: React.TouchEvent) => {
        touchEndRef.current = null;
        touchStartRef.current = e.targetTouches[0].clientX;
        isDraggingRef.current = true;
        setDragOffset(0);
        pauseAutoSlide();
    }, [pauseAutoSlide]);

    const onTouchMove = useCallback((e: React.TouchEvent) => {
        if (!touchStartRef.current) return;
        const currentX = e.targetTouches[0].clientX;
        const offset = currentX - touchStartRef.current;
        touchEndRef.current = currentX;
        setDragOffset(offset);
    }, []);

    const onTouchEnd = useCallback(() => {
        isDraggingRef.current = false;
        setDragOffset(0);
        if (!touchStartRef.current || !touchEndRef.current) return;

        const distance = touchStartRef.current - touchEndRef.current;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            next();
        } else if (isRightSwipe) {
            prev();
        }

        resumeAutoSlide(3000);
    }, [minSwipeDistance, next, prev, resumeAutoSlide]);

    // Mouse handlers
    const onMouseDown = useCallback((e: React.MouseEvent) => {
        mouseEndRef.current = null;
        mouseStartRef.current = e.clientX;
        isDraggingRef.current = true;
        setDragOffset(0);
        pauseAutoSlide();
    }, [pauseAutoSlide]);

    const onMouseMove = useCallback((e: React.MouseEvent) => {
        if (mouseStartRef.current !== null) {
            const currentX = e.clientX;
            const offset = currentX - mouseStartRef.current;
            mouseEndRef.current = currentX;
            setDragOffset(offset);
        }
    }, []);

    const onMouseUp = useCallback(() => {
        isDraggingRef.current = false;
        setDragOffset(0);
        if (!mouseStartRef.current || !mouseEndRef.current) return;

        const distance = mouseStartRef.current - mouseEndRef.current;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            next();
        } else if (isRightSwipe) {
            prev();
        }

        resumeAutoSlide(3000);
    }, [minSwipeDistance, next, prev, resumeAutoSlide]);

    const onMouseLeave = useCallback(() => {
        if (isDraggingRef.current) {
            isDraggingRef.current = false;
            setDragOffset(0);
        }
        resumeAutoSlide();
    }, [resumeAutoSlide]);

    // Auto-slide effect
    useEffect(() => {
        if (autoSlide && items.length > 1) {
            resumeAutoSlide();
        }
        return () => pauseAutoSlide();
    }, [autoSlide, items.length, resumeAutoSlide, pauseAutoSlide]);

    return {
        current,
        isTransitioning,
        dragOffset,
        next,
        prev,
        goTo,
        onTouchStart,
        onTouchMove,
        onTouchEnd,
        onMouseDown,
        onMouseMove,
        onMouseUp,
        onMouseLeave,
        pauseAutoSlide,
        resumeAutoSlide,
    };
}
