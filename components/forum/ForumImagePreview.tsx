'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface ForumImagePreviewProps {
    images: string[];
    initialIndex?: number;
    isOpen: boolean;
    onClose: () => void;
    showZoomControls?: boolean;
}

type Pan = { x: number; y: number };

function clampPan(x: number, y: number, scale: number, baseW: number, baseH: number): Pan {
    if (scale <= 1 || !baseW || !baseH) return { x: 0, y: 0 };
    const maxX = (baseW * (scale - 1)) / 2;
    const maxY = (baseH * (scale - 1)) / 2;
    return {
        x: Math.max(-maxX, Math.min(maxX, x)),
        y: Math.max(-maxY, Math.min(maxY, y)),
    };
}

export default function ForumImagePreview({
    images,
    initialIndex = 0,
    isOpen,
    onClose,
    showZoomControls = false,
}: ForumImagePreviewProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [scale, setScale] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [position, setPosition] = useState<Pan>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [baseSize, setBaseSize] = useState({ w: 0, h: 0 });

    const containerRef = useRef<HTMLDivElement>(null);
    const imageWrapRef = useRef<HTMLDivElement>(null);
    const initialPinchDistance = useRef<number | null>(null);
    const initialScale = useRef<number>(1);
    const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
    const positionRef = useRef<Pan>({ x: 0, y: 0 });
    const scaleRef = useRef(1);
    const baseSizeRef = useRef({ w: 0, h: 0 });

    const currentImage = images[currentIndex];

    const applyPan = useCallback((x: number, y: number, s = scaleRef.current) => {
        const clamped = clampPan(x, y, s, baseSizeRef.current.w, baseSizeRef.current.h);
        positionRef.current = clamped;
        setPosition(clamped);
    }, []);

    const applyScale = useCallback((next: number | ((prev: number) => number)) => {
        setScale((prev) => {
            const value = typeof next === 'function' ? next(prev) : next;
            const clamped = Math.min(Math.max(value, 0.5), 5);
            scaleRef.current = clamped;
            applyPan(positionRef.current.x, positionRef.current.y, clamped);
            if (clamped <= 1) applyPan(0, 0, clamped);
            return clamped;
        });
    }, [applyPan]);

    const resetView = useCallback(() => {
        scaleRef.current = 1;
        setScale(1);
        applyPan(0, 0, 1);
    }, [applyPan]);

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
            resetView();
            setIsLoading(true);
            setBaseSize({ w: 0, h: 0 });
            baseSizeRef.current = { w: 0, h: 0 };
        }
    }, [isOpen, initialIndex, resetView]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') handlePrevious();
            if (e.key === 'ArrowRight') handleNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, currentIndex, images.length]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            if (!isOpen) return;
            if (showZoomControls || e.ctrlKey) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.15 : 0.15;
                applyScale((prev) => prev + delta);
            }
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, [isOpen, showZoomControls, applyScale]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const getDistance = (touches: TouchList) =>
            Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);

        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                initialPinchDistance.current = getDistance(e.touches);
                initialScale.current = scaleRef.current;
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 2 && initialPinchDistance.current !== null) {
                e.preventDefault();
                const ratio = getDistance(e.touches) / initialPinchDistance.current;
                applyScale(initialScale.current * ratio);
            }
        };

        const handleTouchEnd = () => {
            initialPinchDistance.current = null;
        };

        container.addEventListener('touchstart', handleTouchStart, { passive: false });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        container.addEventListener('touchend', handleTouchEnd);

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isOpen, applyScale]);

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
        resetView();
        setIsLoading(true);
        setBaseSize({ w: 0, h: 0 });
        baseSizeRef.current = { w: 0, h: 0 };
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
        resetView();
        setIsLoading(true);
        setBaseSize({ w: 0, h: 0 });
        baseSizeRef.current = { w: 0, h: 0 };
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(currentImage);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            const extension = currentImage.split('.').pop()?.toLowerCase();
            const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            const fileExtension = extension && validExtensions.includes(extension) ? extension : 'jpg';

            link.download = `image-${Date.now()}.${fileExtension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading image:', error);
            alert('Không thể tải ảnh xuống');
        }
    };

    const startDrag = (clientX: number, clientY: number) => {
        if (scaleRef.current <= 1) return;
        dragRef.current = {
            startX: clientX,
            startY: clientY,
            originX: positionRef.current.x,
            originY: positionRef.current.y,
        };
        setIsDragging(true);
    };

    const moveDrag = (clientX: number, clientY: number) => {
        if (!dragRef.current) return;
        const dx = clientX - dragRef.current.startX;
        const dy = clientY - dragRef.current.startY;
        applyPan(dragRef.current.originX + dx, dragRef.current.originY + dy);
    };

    const endDrag = () => {
        dragRef.current = null;
        setIsDragging(false);
    };

    useEffect(() => {
        if (!isDragging) return;

        const onMouseMove = (e: MouseEvent) => {
            e.preventDefault();
            moveDrag(e.clientX, e.clientY);
        };
        const onMouseUp = () => endDrag();

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [isDragging, applyPan]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (scaleRef.current <= 1) return;
        e.preventDefault();
        startDrag(e.clientX, e.clientY);
    };

    const handleTouchStartDrag = (e: React.TouchEvent) => {
        if (e.touches.length !== 1 || scaleRef.current <= 1) return;
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleTouchMoveDrag = (e: React.TouchEvent) => {
        if (!dragRef.current || e.touches.length !== 1 || scaleRef.current <= 1) return;
        e.preventDefault();
        moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleTouchEndDrag = () => endDrag();

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        const size = { w: img.clientWidth, h: img.clientHeight };
        baseSizeRef.current = size;
        setBaseSize(size);
        applyPan(positionRef.current.x, positionRef.current.y);
        setIsLoading(false);
    };

    const zoomIn = () => applyScale((prev) => prev + 0.5);
    const zoomOut = () => applyScale((prev) => prev - 0.5);

    if (!isOpen || !currentImage) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col bg-black/95">
            <div className="relative z-10 flex items-center justify-between p-4">
                <div className="text-sm font-medium text-white">
                    {currentIndex + 1} / {images.length}
                </div>
                <div className="flex items-center gap-2">
                    {showZoomControls && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); zoomOut(); }}
                                className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                                title="Thu nhỏ"
                            >
                                <ZoomOut className="h-5 w-5" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); resetView(); }}
                                className="min-w-[3rem] rounded-full bg-white/10 px-2.5 py-2 text-xs font-medium text-white transition-colors hover:bg-white/20"
                                title="Đặt lại"
                            >
                                {Math.round(scale * 100)}%
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); zoomIn(); }}
                                className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                                title="Phóng to"
                            >
                                <ZoomIn className="h-5 w-5" />
                            </button>
                            <div className="mx-1 h-6 w-px bg-white/20" />
                        </>
                    )}
                    <button
                        onClick={handleDownload}
                        className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                        title="Tải về"
                    >
                        <Download className="h-5 w-5" />
                    </button>
                    <button
                        onClick={onClose}
                        className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                        title="Đóng"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div
                ref={containerRef}
                className="relative flex flex-1 items-center justify-center overflow-hidden"
                onClick={onClose}
            >
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    </div>
                )}

                {images.length > 1 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
                        className="absolute left-4 z-20 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                    >
                        <ChevronLeft className="h-8 w-8" />
                    </button>
                )}

                <div
                    ref={imageWrapRef}
                    onClick={(e) => e.stopPropagation()}
                    onDoubleClick={(e) => {
                        e.stopPropagation();
                        if (showZoomControls) resetView();
                    }}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStartDrag}
                    onTouchMove={handleTouchMoveDrag}
                    onTouchEnd={handleTouchEndDrag}
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transformOrigin: 'center center',
                        transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                        cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                        touchAction: scale > 1 ? 'none' : 'auto',
                    }}
                    className="relative max-h-[80vh] max-w-[90vw]"
                >
                    <img
                        src={currentImage}
                        alt={`Image ${currentIndex + 1}`}
                        className="max-h-[80vh] max-w-full select-none object-contain"
                        draggable={false}
                        onLoad={handleImageLoad}
                    />
                </div>

                {images.length > 1 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                        className="absolute right-4 z-20 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                    >
                        <ChevronRight className="h-8 w-8" />
                    </button>
                )}
            </div>
        </div>
    );
}
