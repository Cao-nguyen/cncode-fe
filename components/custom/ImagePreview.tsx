'use client';

import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ImagePreviewProps {
    images: string[];
    initialIndex?: number;
    onClose: () => void;
}

export function ImagePreview({ images, initialIndex = 0, onClose }: ImagePreviewProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const currentImage = images[currentIndex];

    const handleDownload = async () => {
        try {
            const response = await fetch(currentImage);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Get file extension from URL or default to jpg
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

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        } else if (e.key === 'ArrowLeft') {
            handlePrevious();
        } else if (e.key === 'ArrowRight') {
            handleNext();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center"
            onClick={onClose}
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            {/* Close button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            >
                <X className="w-6 h-6" />
            </Button>

            {/* Download button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                }}
                className="absolute top-4 right-16 text-white hover:bg-white/20 z-10"
            >
                <Download className="w-6 h-6" />
            </Button>

            {/* Image counter */}
            {images.length > 1 && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                    {currentIndex + 1} / {images.length}
                </div>
            )}

            {/* Previous button */}
            {images.length > 1 && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                        e.stopPropagation();
                        handlePrevious();
                    }}
                    className="absolute left-4 text-white hover:bg-white/20 w-12 h-12"
                >
                    <ChevronLeft className="w-8 h-8" />
                </Button>
            )}

            {/* Image */}
            <div
                className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={currentImage}
                    alt={`Image ${currentIndex + 1}`}
                    className="max-w-full max-h-[90vh] object-contain rounded-lg"
                />
            </div>

            {/* Next button */}
            {images.length > 1 && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                    }}
                    className="absolute right-4 text-white hover:bg-white/20 w-12 h-12"
                >
                    <ChevronRight className="w-8 h-8" />
                </Button>
            )}

            {/* Thumbnail strip for multiple images */}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-lg max-w-[90vw] overflow-x-auto">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentIndex(idx);
                            }}
                            className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition ${idx === currentIndex ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'
                                }`}
                        >
                            <img
                                src={img}
                                alt={`Thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}