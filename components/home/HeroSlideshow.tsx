'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { slideshowApi, SlideshowItem } from '@/lib/api/slideshow.api';

function SlideIndicator({ active, total }: { active: number; total: number }) {
    return (
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
            {Array.from({ length: total }).map((_, i) => (
                <button
                    key={i}
                    className={`rounded-full transition-all duration-700 ${i === active ? 'h-2.5 w-8 bg-white' : 'h-2.5 w-2.5 bg-white/40 hover:bg-white/60'}`}
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
        const timer = setInterval(() => next(), 6000);
        return () => clearInterval(timer);
    }, [next, len]);

    if (loading) {
        return (
            <div
                className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800"
                style={{ aspectRatio: '1920 / 600', maxHeight: '600px' }}
            >
                <div className="flex h-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                </div>
            </div>
        );
    }

    if (len === 0) {
        return (
            <div
                className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center"
                style={{ aspectRatio: '1920 / 600', maxHeight: '600px' }}
            >
                <p className="text-sm text-gray-400 dark:text-gray-500">Chưa có slide nào</p>
            </div>
        );
    }

    const slide = slides[current];
    const hasImage = Boolean(slide.imageUrl) && !imageErrors[current];

    const slideContent = (
        <div className="group relative w-full overflow-hidden rounded-3xl" style={{ aspectRatio: '1920 / 600', maxHeight: '600px' }}>
            {/* Background gradient as fallback */}
            <div
                className={`absolute inset-0 bg-gradient-to-br ${slide.gradient || 'from-gray-600 via-slate-600 to-gray-700'} transition-all duration-700`}
            />

            {/* Full image - object-cover so it fills the entire banner like the design */}
            {hasImage && (
                <img
                    src={slide.imageUrl}
                    alt={slide.title || ''}
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={() => setImageErrors((prev) => ({ ...prev, [current]: true }))}
                />
            )}

            {/* Navigation arrows */}
            {len > 1 && (
                <>
                    <button
                        onClick={(e) => { e.preventDefault(); prev(); }}
                        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white opacity-0 transition hover:bg-black/50 group-hover:opacity-100"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); next(); }}
                        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white opacity-0 transition hover:bg-black/50 group-hover:opacity-100"
                        aria-label="Next slide"
                    >
                        <ChevronRight size={24} />
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