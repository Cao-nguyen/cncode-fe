'use client';

import { useState } from 'react';
import { BookOpen, Briefcase, Bot, MessageSquare, MessageCircle, HelpCircle, Share2, Users, Link2, GraduationCap, CheckCircle } from 'lucide-react';
import { useHorizontalMarquee } from '@/hooks/useHorizontalMarquee';

const topics = [
    { icon: BookOpen, title: 'Sách & tài liệu', color: '#ef4444', href: '/cnbooks' },
    { icon: Briefcase, title: 'Việc làm & tuyển dụng', color: '#3b82f6', href: '/cnjobs' },
    { icon: Bot, title: 'Gia sư AI', color: '#8b5cf6', href: '/giasuai' },
    { icon: MessageSquare, title: 'Góp ý', color: '#f59e0b', href: '/gopy' },
    { icon: MessageCircle, title: 'Chat với Admin', color: '#10b981', href: '/chatwithadmin' },
    { icon: HelpCircle, title: 'Hỏi đáp', color: '#06b6d4', href: '/faq' },
    { icon: Share2, title: 'Truyền thông chéo', color: '#a855f7', href: '/truyenthongcheo' },
    { icon: Users, title: 'Tiếp thị liên kết', color: '#f97316', href: '/me/affiliate' },
    { icon: Users, title: 'Mạng xã hội', color: '#ef4444', href: '/cnsocial' },
    { icon: Link2, title: 'Rút gọn link', color: '#ec4899', href: '/rutgonlink' },
    { icon: GraduationCap, title: 'Khoá học', color: '#7c3aed', href: '/khoahoc' },
    { icon: CheckCircle, title: 'Luyện tập', color: '#22c55e', href: '/luyentap' },
];

export default function CNServicesGrid() {
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
    } = useHorizontalMarquee();

    return (
        <div className="py-8 sm:py-10 lg:py-12">
            <div className="mb-8 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--cn-text-main)' }}>
                    Tính năng nổi bật
                </h2>
                <p className="text-sm" style={{ color: 'var(--cn-text-muted)' }}>
                    Khám phá các tính năng nổi bật của CNcode
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
                            <a
                                key={`${topic.title}-${index}`}
                                href={topic.href}
                                className="flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:shadow-md"
                                style={{
                                    backgroundColor: 'var(--cn-bg-card)',
                                    border: `1.5px solid ${isActive ? topic.color : 'var(--cn-border)'}`,
                                }}
                                onMouseEnter={() => setActive(index % topics.length)}
                                onMouseLeave={() => setActive(null)}
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
                            </a>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
