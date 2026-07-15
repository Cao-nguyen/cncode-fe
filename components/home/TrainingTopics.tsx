'use client';

import { useState } from 'react';
import { Code, Braces, Globe, Palette, FileSpreadsheet, Brain, Shield, PenTool, LayoutGrid } from 'lucide-react';
import { useHorizontalMarquee } from '@/hooks/useHorizontalMarquee';

const topics = [
    { icon: Code, title: 'Lập trình Python', color: '#2563eb' },
    { icon: Braces, title: 'Lập trình C/C++', color: '#6366f1' },
    { icon: Globe, title: 'Lập trình website', color: '#ea580c' },
    { icon: Palette, title: 'Thiết kế website', color: '#db2777' },
    { icon: FileSpreadsheet, title: 'Tin học văn phòng', color: '#16a34a' },
    { icon: Brain, title: 'Trí tuệ nhân tạo', color: '#dc2626' },
    { icon: Shield, title: 'An toàn thông tin', color: '#7c3aed' },
    { icon: PenTool, title: 'Thiết kế với Canva', color: '#0891b2' },
    { icon: LayoutGrid, title: 'Khác', color: '#64748b' },
];

export default function TrainingTopics() {
    const [active, setActive] = useState<number | null>(null);
    const loopItems = [...topics, ...topics];

    const {
        containerRef,
        isDragging,
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerCancel,
        onMouseEnter,
        onMouseLeave,
        onTouchStart,
        onTouchEnd,
    } = useHorizontalMarquee({
        desktopSpeed: 0.55,
        mobileSpeed: 0.55, // Same speed as desktop for smooth mobile experience
    });

    return (
        <div>
            <div className="mb-8 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--cn-text-main)' }}>
                    CNcode đào tạo những gì?
                </h2>
                <p className="text-sm" style={{ color: 'var(--cn-text-muted)' }}>
                    Hệ thống kiến thức toàn diện cho chuyển đổi số
                </p>
            </div>

            <div
                ref={containerRef}
                className={`no-scrollbar overflow-x-auto select-none touch-pan-x ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerCancel}
            >
                <div className="flex w-max gap-3 px-1">
                    {loopItems.map((topic, index) => {
                        const Icon = topic.icon;
                        const isActive = active === index % topics.length;

                        return (
                            <div
                                key={`${topic.title}-${index}`}
                                className="flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200"
                                style={{
                                    backgroundColor: 'var(--cn-bg-card)',
                                    border: `1.5px solid ${isActive ? topic.color : 'var(--cn-border)'}`,
                                }}
                                // Hỗ trợ hover trên Desktop
                                onMouseEnter={() => setActive(index % topics.length)}
                                onMouseLeave={() => setActive(null)}
                                // Hỗ trợ active highlight phản hồi nhanh khi chạm trên Mobile
                                onTouchStart={() => setActive(index % topics.length)}
                                onTouchEnd={() => setActive(null)}
                            >
                                <div
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                                    style={{
                                        backgroundColor: isActive ? topic.color : `${topic.color}15`,
                                    }}
                                >
                                    <Icon
                                        size={16}
                                        strokeWidth={1.5}
                                        style={{ color: isActive ? '#fff' : topic.color }}
                                    />
                                </div>
                                <span
                                    className="whitespace-nowrap text-sm font-bold"
                                    style={{ color: 'var(--cn-text-main)' }}
                                >
                                    {topic.title}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}