'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface ForumImagePreviewProps {
    images: string[];
    initialIndex?: number;
    isOpen: boolean;
    onClose: () => void;
}

export default function ForumImagePreview({ images, initialIndex = 0, isOpen, onClose }: ForumImagePreviewProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [scale, setScale] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);
    const initialPinchDistance = useRef<number | null>(null);
    const initialScale = useRef<number>(1);

    const currentImage = images[currentIndex];

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
            setScale(1);
            setPosition({ x: 0, y: 0 });
        }
    }, [isOpen, initialIndex]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') handlePrevious();
            if (e.key === 'ArrowRight') handleNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Ctrl + Scroll to zoom for desktop
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            if (!isOpen) return;
            if (e.ctrlKey) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                setScale(prev => Math.min(Math.max(prev + delta, 0.5), 5));
            }
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container?.removeEventListener('wheel', handleWheel);
    }, [isOpen]);

    // Pinch to zoom for mobile
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const getDistance = (touches: TouchList) => {
            return Math.hypot(
                touches[0].clientX - touches[1].clientX,
                touches[0].clientY - touches[1].clientY
            );
        };

        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                initialPinchDistance.current = getDistance(e.touches);
                initialScale.current = scale;
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 2 && initialPinchDistance.current !== null) {
                e.preventDefault();
                const currentDistance = getDistance(e.touches);
                const scaleRatio = currentDistance / initialPinchDistance.current;
                const newScale = Math.min(Math.max(initialScale.current * scaleRatio, 0.5), 5);
                setScale(newScale);
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
    }, [scale, isOpen]);

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
        setScale(1);
        setPosition({ x: 0, y: 0 });
        setIsLoading(true);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
        setScale(1);
        setPosition({ x: 0, y: 0 });
        setIsLoading(true);
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

    // Drag handlers for panning zoomed image
    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale > 1) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && scale > 1) {
            e.preventDefault();
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    // Touch drag handlers for mobile
    const handleTouchStartDrag = (e: React.TouchEvent) => {
        if (e.touches.length === 1 && scale > 1) {
            setIsDragging(true);
            setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
        }
    };

    const handleTouchMoveDrag = (e: React.TouchEvent) => {
        if (isDragging && e.touches.length === 1 && scale > 1) {
            e.preventDefault();
            setPosition({
                x: e.touches[0].clientX - dragStart.x,
                y: e.touches[0].clientY - dragStart.y
            });
        }
    };

    const handleTouchEndDrag = () => {
        setIsDragging(false);
    };

    if (!isOpen || !currentImage) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col">
            {/* Header */}
            <div className="relative z-10 flex items-center justify-between p-4">
                <div className="text-white text-sm font-medium">
                    {currentIndex + 1} / {images.length}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDownload}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        title="Tải về"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        title="Đóng"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Image container */}
            <div
                ref={containerRef}
                className="flex-1 relative flex items-center justify-center overflow-hidden"
                onClick={onClose}
            >
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                )}

                {/* Previous button */}
                {images.length > 1 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePrevious();
                        }}
                        className="absolute left-4 z-20 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>
                )}

                {/* Image */}
                <div
                    ref={imageRef}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={handleTouchStartDrag}
                    onTouchMove={handleTouchMoveDrag}
                    onTouchEnd={handleTouchEndDrag}
                    style={{ 
                        transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                        transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                        cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                    }}
                    className="relative max-w-[90vw] max-h-[80vh]"
                >
                    <img
                        src={currentImage}
                        alt={`Image ${currentIndex + 1}`}
                        className="max-w-full max-h-[80vh] object-contain"
                        onLoad={() => setIsLoading(false)}
                    />
                </div>

                {/* Next button */}
                {images.length > 1 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleNext();
                        }}
                        className="absolute right-4 z-20 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>
                )}
            </div>
        </div>
    );
}
