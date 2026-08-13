'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, ShoppingBag } from 'lucide-react';
import ForumImagePreview from '@/components/forum/ForumImagePreview';
import { getImageUrl } from '@/lib/utils/imageUrl';
import { cn } from '@/lib/utils';

const THUMB_SIZE = 72;
const THUMB_GAP = 8;

interface ShopProductGalleryProps {
    images: string[];
    alt: string;
    selectedIndex: number;
    onSelectIndex: (index: number) => void;
}

export function ShopProductGallery({
    images,
    alt,
    selectedIndex,
    onSelectIndex,
}: ShopProductGalleryProps) {
    const [lightbox, setLightbox] = useState(false);
    const thumbRowRef = useRef<HTMLDivElement>(null);
    const [maxVisible, setMaxVisible] = useState(8);

    const urls = images.map((img) => getImageUrl(img));
    const current = urls[selectedIndex];
    const hasImages = urls.length > 0;

    const prev = () => onSelectIndex(selectedIndex > 0 ? selectedIndex - 1 : urls.length - 1);
    const next = () => onSelectIndex(selectedIndex < urls.length - 1 ? selectedIndex + 1 : 0);

    useEffect(() => {
        const el = thumbRowRef.current;
        if (!el) return;

        const update = () => {
            const width = el.clientWidth;
            const fit = Math.max(1, Math.floor((width + THUMB_GAP) / (THUMB_SIZE + THUMB_GAP)));
            setMaxVisible(fit);
        };

        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, [urls.length]);

    const hasOverflow = urls.length > maxVisible;
    const visibleCount = hasOverflow ? maxVisible - 1 : urls.length;
    const hiddenCount = urls.length - visibleCount;
    const visibleUrls = urls.slice(0, visibleCount);

    if (!hasImages) {
        return (
            <div
                className="shop-gallery-stage flex aspect-[4/3] items-center justify-center rounded-3xl"
                style={{ border: '1px solid var(--cn-border)' }}
            >
                <div className="text-center" style={{ color: 'var(--cn-text-muted)' }}>
                    <ShoppingBag className="mx-auto mb-2 h-10 w-10 opacity-30" />
                    <p className="text-sm">Chưa có ảnh minh họa</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <style jsx global>{`
                .shop-gallery-stage {
                    background-color: #f4f4f5;
                    background-image: radial-gradient(circle, #d4d4d8 1px, transparent 1px);
                    background-size: 18px 18px;
                }
                :is(.dark) .shop-gallery-stage,
                .dark .shop-gallery-stage {
                    background-color: #18181b;
                    background-image: radial-gradient(circle, #3f3f46 1px, transparent 1px);
                }
            `}</style>

            <div className="min-w-0">
                <div
                    className="shop-gallery-stage relative min-h-[300px] overflow-hidden rounded-3xl sm:min-h-[380px] lg:min-h-[420px]"
                    style={{ border: '1px solid var(--cn-border)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
                >
                    <div className="relative flex h-full min-h-[inherit] items-center justify-center p-6 sm:p-8">
                        <img
                            src={current}
                            alt={alt}
                            className="max-h-[360px] w-full cursor-zoom-in select-none object-contain"
                            draggable={false}
                            onClick={() => setLightbox(true)}
                        />

                        <button
                            type="button"
                            onClick={() => setLightbox(true)}
                            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full transition hover:scale-105"
                            style={{ backgroundColor: 'var(--cn-bg-card)', border: '1px solid var(--cn-border)', color: 'var(--cn-text-main)' }}
                            title="Xem full màn hình"
                        >
                            <Maximize2 className="h-4 w-4" />
                        </button>

                        {urls.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); prev(); }}
                                    className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full shadow-md transition hover:scale-105"
                                    style={{ backgroundColor: 'var(--cn-bg-card)', border: '1px solid var(--cn-border)' }}
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); next(); }}
                                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full shadow-md transition hover:scale-105"
                                    style={{ backgroundColor: 'var(--cn-bg-card)', border: '1px solid var(--cn-border)' }}
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between px-1 text-xs" style={{ color: 'var(--cn-text-muted)' }}>
                    <span>{urls.length > 1 ? `${selectedIndex + 1} / ${urls.length} ảnh` : '1 ảnh'}</span>
                    <span className="hidden sm:inline">Click ảnh để xem · Cuộn để phóng to / thu nhỏ</span>
                </div>

                {urls.length > 1 && (
                    <div ref={thumbRowRef} className="mt-3 flex gap-2">
                        {visibleUrls.map((img, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => onSelectIndex(i)}
                                className={cn(
                                    'shop-gallery-stage flex shrink-0 items-center justify-center overflow-hidden rounded-xl transition',
                                    i === selectedIndex
                                        ? 'ring-2 ring-[var(--cn-primary)] ring-offset-2 ring-offset-[var(--cn-bg-main)]'
                                        : 'opacity-60 hover:opacity-100',
                                )}
                                style={{
                                    width: THUMB_SIZE,
                                    height: THUMB_SIZE,
                                    border: '1px solid var(--cn-border)',
                                }}
                            >
                                <img src={img} alt="" className="max-h-[88%] max-w-[88%] object-contain" />
                            </button>
                        ))}

                        {hasOverflow && (
                            <button
                                type="button"
                                onClick={() => {
                                    onSelectIndex(visibleCount);
                                    setLightbox(true);
                                }}
                                className="shop-gallery-stage relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl transition hover:opacity-90"
                                style={{
                                    width: THUMB_SIZE,
                                    height: THUMB_SIZE,
                                    border: '1px solid var(--cn-border)',
                                }}
                            >
                                <img
                                    src={urls[visibleCount]}
                                    alt=""
                                    className="max-h-[88%] max-w-[88%] object-contain opacity-40"
                                />
                                <span
                                    className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-bold text-white"
                                >
                                    +{hiddenCount}
                                </span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            <ForumImagePreview
                images={urls}
                initialIndex={selectedIndex}
                isOpen={lightbox}
                onClose={() => setLightbox(false)}
                showZoomControls
            />
        </>
    );
}
