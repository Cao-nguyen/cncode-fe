'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { X, ZoomIn } from 'lucide-react';

interface ImagePreviewProps {
    src: string;
    alt?: string;
    onClose: () => void;
}

export function ImagePreview({ src, alt = '', onClose }: ImagePreviewProps) {
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); },
        [onClose],
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [handleKeyDown]);

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition"
                aria-label="Đóng"
            >
                <X size={20} />
            </button>
            <div
                className="relative max-w-[90vw] max-h-[90vh] rounded-xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <Image
                    src={src}
                    alt={alt}
                    width={1280}
                    height={800}
                    className="object-contain max-h-[90vh] w-auto"
                    priority
                />
            </div>
        </div>
    );
}

interface ClickableImageProps {
    src: string;
    alt?: string;
    className?: string;
}

export function ClickableImage({ src, alt = '', className = '' }: ClickableImageProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                className={`relative group cursor-zoom-in ${className}`}
                onClick={() => setOpen(true)}
                aria-label="Xem ảnh lớn hơn"
            >
                <Image src={src} alt={alt} fill className="object-cover transition group-hover:brightness-90" />
                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <ZoomIn className="text-white drop-shadow" size={28} />
                </span>
            </button>
            {open && <ImagePreview src={src} alt={alt} onClose={() => setOpen(false)} />}
        </>
    );
}


export function useContentImagePreview(containerRef: React.RefObject<HTMLElement | null>) {
    const [previewSrc, setPreviewSrc] = useState<string | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'IMG') setPreviewSrc((target as HTMLImageElement).src);
        };

        container.addEventListener('click', handleClick);
        container.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
            img.style.cursor = 'zoom-in';
        });

        return () => container.removeEventListener('click', handleClick);
    }, [containerRef]);

    return { previewSrc, closePreview: () => setPreviewSrc(null) };
}