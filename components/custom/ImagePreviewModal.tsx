'use client';

import { useState, useEffect, useRef, ReactNode, MouseEvent, useMemo } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, RefreshCcw, Minimize2, Move } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


interface ImagePreviewModalProps {
    src: string | null;
    isOpen: boolean;
    onClose: () => void;
}

interface ToolbarButtonProps {
    children: ReactNode;
    onClick: (e: MouseEvent<HTMLButtonElement>) => void;
    title: string;
    className?: string;
}

export const ImagePreviewModal = ({ src, isOpen, onClose }: ImagePreviewModalProps) => {
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    const containerRef = useRef<HTMLDivElement>(null);

    const dragConstraints = useMemo(() => {
        if (!naturalSize.width || !containerSize.width) return { left: 0, right: 0, top: 0, bottom: 0 };

        const contentRatio = naturalSize.width / naturalSize.height;
        const containerRatio = containerSize.width / containerSize.height;

        let renderedWidth = containerSize.width;
        let renderedHeight = containerSize.height;

        if (contentRatio > containerRatio) {
            renderedHeight = containerSize.width / contentRatio;
        } else {
            renderedWidth = containerSize.height * contentRatio;
        }

        const horizontalBoundary = Math.max(0, (renderedWidth * scale - containerSize.width) / 2);
        const verticalBoundary = Math.max(0, (renderedHeight * scale - containerSize.height) / 2);

        return {
            left: -horizontalBoundary,
            right: horizontalBoundary,
            top: -verticalBoundary,
            bottom: verticalBoundary
        };
    }, [naturalSize, containerSize, scale]);

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setContainerSize({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
            }
        };

        if (isOpen) {
            updateSize();
            window.addEventListener('resize', updateSize);
        }
        return () => window.removeEventListener('resize', updateSize);
    }, [isOpen]);

    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (!isOpen) return;
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.25 : 0.25;
            setScale(prev => Math.min(Math.max(prev + delta, 0.5), 10));
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => container?.removeEventListener('wheel', handleWheel);
    }, [isOpen]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!src) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex flex-col bg-black/95 backdrop-blur-md select-none touch-none"
                    onClick={onClose}
                >
                    {}
                    <div className="relative z-[110] w-full flex justify-center pt-4 pb-2">
                        <motion.div
                            initial={{ y: -20 }}
                            animate={{ y: 0 }}
                            className="flex items-center gap-1 bg-gray-900/90 p-2 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ToolbarButton onClick={(e) => { e.stopPropagation(); setScale(prev => Math.max(prev - 0.5, 0.5)); }} title="Thu nhỏ"><ZoomOut size={18} /></ToolbarButton>
                            <ToolbarButton onClick={() => setScale(1)} title="Tỷ lệ 1:1"><Minimize2 size={16} /></ToolbarButton>
                            <ToolbarButton onClick={(e) => { e.stopPropagation(); setScale(prev => Math.min(prev + 0.5, 10)); }} title="Phóng to"><ZoomIn size={18} /></ToolbarButton>
                            <div className="w-px h-6 bg-white/20 mx-1" />
                            <ToolbarButton onClick={(e) => { e.stopPropagation(); setRotation(prev => (prev + 90) % 360); }} title="Xoay"><RotateCw size={18} /></ToolbarButton>
                            <div className="w-px h-6 bg-white/20 mx-1" />
                            <ToolbarButton onClick={(e) => { e.stopPropagation(); setScale(1); setRotation(0); }} title="Đặt lại"><RefreshCcw size={16} /></ToolbarButton>
                            <div className="w-px h-6 bg-white/20 mx-1" />
                            <ToolbarButton onClick={(e) => { e.stopPropagation(); onClose(); }} title="Đóng" className="text-red-400 hover:bg-red-500/20"><X size={18} /></ToolbarButton>
                        </motion.div>
                    </div>

                    {}
                    <div
                        ref={containerRef}
                        className="flex-1 w-full relative flex items-center justify-center overflow-hidden"
                    >
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                                <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            </div>
                        )}

                        <motion.div
                            key={src} 
                            drag
                            dragConstraints={dragConstraints}
                            dragElastic={0.1}
                            dragMomentum={true}
                            onDoubleClick={() => setScale(1)}
                            style={{ scale, rotate: rotation, width: '100%', height: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="relative flex items-center justify-center cursor-grab active:cursor-grabbing"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative w-[90vw] h-[80vh]">
                                <img
                                    src={src}
                                    alt="Preview"
                                    fill
                                    className={`object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                                    draggable={false}
                                    onLoadingComplete={(result) => {
                                        setNaturalSize({
                                            width: result.naturalWidth,
                                            height: result.naturalHeight
                                        });
                                        setIsLoading(false);
                                    }}
                                    unoptimized 
                                />
                            </div>
                        </motion.div>
                    </div>

                    {}
                    <div className="relative z-[110] w-full flex justify-center pb-6 pointer-events-none">
                        <motion.div
                            initial={{ y: 20 }}
                            animate={{ y: 0 }}
                            className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white/70 text-xs flex items-center gap-4 shadow-lg"
                        >
                            <div className="flex items-center gap-1.5"><Move size={12} /><span>Kéo để xem các góc</span></div>
                            <div className="w-px h-3 bg-white/20" />
                            <span>Cuộn để Zoom • Click đúp để đặt lại</span>
                            <div className="w-px h-3 bg-white/20" />
                            <span className="font-mono text-white bg-white/20 px-2 py-0.5 rounded-md">
                                {Math.round(scale * 100)}%
                            </span>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const ToolbarButton = ({ children, onClick, title, className = "" }: ToolbarButtonProps) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        className={`w-10 h-10 flex items-center justify-center rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all active:scale-90 ${className}`}
    >
        {children}
    </button>
);
