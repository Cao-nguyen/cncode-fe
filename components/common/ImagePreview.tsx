'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface ImagePreviewProps {
    images: string[];
    initialIndex: number;
    onClose: () => void;
}

export default function ImagePreview({ images, initialIndex, onClose }: ImagePreviewProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const positionRef = useRef({ x: 0, y: 0 });
    const scaleRef = useRef(1);

    // Sync refs with state
    useEffect(() => {
        positionRef.current = position;
    }, [position]);

    useEffect(() => {
        scaleRef.current = scale;
    }, [scale]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowLeft') {
            setCurrentIndex(prev => Math.max(0, prev - 1));
            // Reset zoom khi chuyển ảnh
            setScale(1);
            setPosition({ x: 0, y: 0 });
        }
        if (e.key === 'ArrowRight') {
            setCurrentIndex(prev => Math.min(images.length - 1, prev + 1));
            // Reset zoom khi chuyển ảnh
            setScale(1);
            setPosition({ x: 0, y: 0 });
        }
    }, [images.length, onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [handleKeyDown]);

    const handleZoomIn = useCallback(() => {
        setScale(prev => Math.min(prev + 0.25, 3));
    }, []);

    const handleZoomOut = useCallback(() => {
        setScale(prev => {
            if (prev > 0.5) {
                return Math.max(prev - 0.25, 0.5);
            } else {
                setPosition({ x: 0, y: 0 });
                return 1;
            }
        });
    }, []);

    const handleResetZoom = useCallback(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (scaleRef.current > 1) {
            setIsDragging(true);
            dragStartRef.current = {
                x: e.clientX - positionRef.current.x,
                y: e.clientY - positionRef.current.y
            };
        }
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging && scaleRef.current > 1) {
            setPosition({
                x: e.clientX - dragStartRef.current.x,
                y: e.clientY - dragStartRef.current.y,
            });
        }
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handlePrev = useCallback(() => {
        setCurrentIndex(prev => Math.max(0, prev - 1));
        setScale(1);
        setPosition({ x: 0, y: 0 });
    }, []);

    const handleNext = useCallback(() => {
        setCurrentIndex(prev => Math.min(images.length - 1, prev + 1));
        setScale(1);
        setPosition({ x: 0, y: 0 });
    }, [images.length]);

    const currentImage = images[currentIndex];

    return (
        <div
            className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
            onClick={onClose}
        >
            {/* Thanh công cụ */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 z-10">
                <button
                    onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
                    className="p-2 text-white hover:bg-white/20 rounded-full transition"
                >
                    <ZoomOut size={20} />
                </button>
                <span className="text-white text-sm px-2">{Math.round(scale * 100)}%</span>
                <button
                    onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
                    className="p-2 text-white hover:bg-white/20 rounded-full transition"
                >
                    <ZoomIn size={20} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); handleResetZoom(); }}
                    className="px-3 py-1 text-white text-sm hover:bg-white/20 rounded-full transition"
                >
                    Reset
                </button>
            </div>

            {/* Nút đóng */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full transition z-10"
            >
                <X size={24} />
            </button>

            {/* Nút prev */}
            {images.length > 1 && currentIndex > 0 && (
                <button
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white hover:bg-white/20 rounded-full transition z-10"
                >
                    <ChevronLeft size={32} />
                </button>
            )}

            {/* Nút next */}
            {images.length > 1 && currentIndex < images.length - 1 && (
                <button
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white hover:bg-white/20 rounded-full transition z-10"
                >
                    <ChevronRight size={32} />
                </button>
            )}

            {/* Ảnh hiện tại */}
            <div
                className="relative w-full h-full flex items-center justify-center overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
            >
                <div
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transition: isDragging ? 'none' : 'transform 0.2s ease',
                    }}
                    className="relative w-full h-full flex items-center justify-center"
                >
                    <div className="relative w-full h-full max-w-[90vw] max-h-[90vh]">
                        <Image
                            src={currentImage}
                            alt={`Ảnh ${currentIndex + 1}`}
                            fill
                            className="object-contain"
                            sizes="90vw"
                            priority
                        />
                    </div>
                </div>
            </div>

            {/* Chỉ số ảnh */}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-white text-sm">
                    {currentIndex + 1} / {images.length}
                </div>
            )}
        </div>
    );
}