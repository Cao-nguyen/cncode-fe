'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { slideshowApi, SlideshowItem } from '@/lib/api/slideshow.api';

function SlideIndicator({ active, total }: { active: number; total: number }) {
    return (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
                <button
                    key={i}
                    className={`rounded-full transition-all duration-700 ${i === active ? 'h-2 w-6 bg-white' : 'h-2 w-2 bg-white/40 hover:bg-white/60'}`}
                    aria-label={`Chuyển đến slide ${i + 1}`}
                />
            ))}
        </div>
    );
}

export default function HeroSlideshow() {
    const [slides, setSlides] = useState<SlideshowItem[]>([]);
    const [current, setCurrent] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [loading, setLoading] = useState(true);
    const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
    const [dragOffset, setDragOffset] = useState(0);

    const touchStartRef = useRef<number | null>(null);
    const touchEndRef = useRef<number | null>(null);
    const mouseStartRef = useRef<number | null>(null);
    const mouseEndRef = useRef<number | null>(null);
    const isDraggingRef = useRef(false);
    const autoSlideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const minSwipeDistance = 50;

    const pauseAutoSlide = () => {
        if (autoSlideTimerRef.current) {
            clearTimeout(autoSlideTimerRef.current);
            autoSlideTimerRef.current = null;
        }
    };

    const resumeAutoSlide = (delay: number = 3000) => {
        pauseAutoSlide();
        const isMobile = window.innerWidth < 1024;
        autoSlideTimerRef.current = setTimeout(() => {
            next();
        }, isMobile ? 3000 : 6000);
    };

    const onTouchStart = (e: React.TouchEvent) => {
        touchEndRef.current = null;
        touchStartRef.current = e.targetTouches[0].clientX;
        isDraggingRef.current = true;
        setDragOffset(0);
        pauseAutoSlide();
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (!touchStartRef.current) return;
        const currentX = e.targetTouches[0].clientX;
        const offset = currentX - touchStartRef.current;
        touchEndRef.current = currentX;
        setDragOffset(offset);
    };

    const onTouchEnd = () => {
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
    };

    const onMouseDown = (e: React.MouseEvent) => {
        mouseEndRef.current = null;
        mouseStartRef.current = e.clientX;
        isDraggingRef.current = true;
        setDragOffset(0);
        pauseAutoSlide();
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (mouseStartRef.current !== null) {
            const currentX = e.clientX;
            const offset = currentX - mouseStartRef.current;
            mouseEndRef.current = currentX;
            setDragOffset(offset);
        }
    };

    const onMouseUp = () => {
        isDraggingRef.current = false;
        setDragOffset(0);
        if (!mouseStartRef.current || !mouseEndRef.current) return;

        const distance = mouseStartRef.current - mouseEndRef.current;
        const isLeftDrag = distance > minSwipeDistance;
        const isRightDrag = distance < -minSwipeDistance;

        if (isLeftDrag) {
            next();
        } else if (isRightDrag) {
            prev();
        }

        mouseStartRef.current = null;
        mouseEndRef.current = null;
        resumeAutoSlide(3000);
    };

    const onMouseLeave = () => {
        isDraggingRef.current = false;
        setDragOffset(0);
        mouseStartRef.current = null;
        mouseEndRef.current = null;
        resumeAutoSlide(3000);
    };

    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const res = await slideshowApi.getActiveSlides();
                if (res.success && res.data.length > 0) {
                    const sorted = [...res.data].sort((a, b) => a.order - b.order);
                    setSlides(sorted);
                }
            } catch (err) {
                console.error('Failed to load slides:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSlides();
    }, []);

    const len = slides.length;

    const goTo = useCallback(
        (index: number) => {
            if (isTransitioning || len === 0) return;
            setIsTransitioning(true);
            setCurrent(((index % len) + len) % len);
            setTimeout(() => setIsTransitioning(false), 700);
        },
        [isTransitioning, len],
    );

    const next = useCallback(() => goTo(current + 1), [current, goTo]);
    const prev = useCallback(() => goTo(current - 1), [current, goTo]);

    useEffect(() => {
        if (len <= 1) return;
        resumeAutoSlide();
        return () => pauseAutoSlide();
    }, [len]);

    if (loading) {
        return null;
    }

    if (len === 0) {
        return null;
    }

    const slide = slides[current];
    const hasImage = Boolean(slide.imageUrl) && !imageErrors[current];

    const slideContent = (
        <div
            className="group relative w-full overflow-hidden rounded-3xl h-[250px] md:h-[400px] cursor-grab active:cursor-grabbing"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
        >
            {/* Background gradient */}
            <div
                className={`absolute inset-0 bg-gradient-to-r ${slide.gradient || 'from-gray-600 via-slate-600 to-gray-700'} transition-all duration-700`}
                style={{ transform: `translateX(${dragOffset * 0.3}px)`, transition: isDraggingRef.current ? 'none' : 'all 0.3s ease-out' }}
            />

            {/* Content container - 2 column layout on desktop, text only on mobile/tablet */}
            <div
                className="relative z-10 flex h-full flex-col lg:flex-row p-5"
                style={{ transform: `translateX(${dragOffset * 0.3}px)`, transition: isDraggingRef.current ? 'none' : 'all 0.3s ease-out' }}
            >
                {/* Left column - Text content */}
                <div className="flex-1 flex flex-col justify-center order-1 lg:order-1">
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight mb-2">
                        {slide.title}
                    </h2>
                    {slide.subtitle && (
                        <p className="text-sm sm:text-base md:text-lg text-white/90 mb-2 md:mb-3">
                            {slide.subtitle}
                        </p>
                    )}
                    {slide.description && (
                        <p className="text-xs sm:text-sm md:text-base text-white/80 mb-3 md:mb-4 line-clamp-2 sm:line-clamp-3">
                            {slide.description}
                        </p>
                    )}
                    {slide.cta && (
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm w-fit hover:bg-white/30 transition">
                            {slide.cta} <ChevronRight size={16} />
                        </span>
                    )}
                </div>

                {/* Right column - Image - hidden on mobile/tablet, visible on desktop */}
                <div className="hidden lg:flex w-1/2 lg:w-2/5 items-center justify-center order-2 lg:order-2">
                    {hasImage ? (
                        <img
                            src={slide.imageUrl}
                            alt={slide.title || ''}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '250px',
                                width: slide.imageWidth && slide.imageHeight ? 'auto' : '100%',
                                height: slide.imageWidth && slide.imageHeight ? 'auto' : '100%',
                                objectFit: 'contain',
                            }}
                            onError={() => setImageErrors((prev) => ({ ...prev, [current]: true }))}
                        />
                    ) : null}
                </div>
            </div>

            {/* Navigation arrows - hidden on mobile/tablet */}
            {len > 1 && (
                <>
                    <button
                        onClick={(e) => { e.preventDefault(); prev(); }}
                        className="hidden lg:flex absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white opacity-0 transition hover:bg-black/50 group-hover:opacity-100"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); next(); }}
                        className="hidden lg:flex absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white opacity-0 transition hover:bg-black/50 group-hover:opacity-100"
                        aria-label="Next slide"
                    >
                        <ChevronRight size={20} />
                    </button>
                </>
            )}

            {/* Slide indicator dots */}
            {len > 1 && <SlideIndicator active={current} total={len} />}
        </div>
    );

    if (slide.href && slide.href !== '/') {
        return <Link href={slide.href}>{slideContent}</Link>;
    }

    return slideContent;
}