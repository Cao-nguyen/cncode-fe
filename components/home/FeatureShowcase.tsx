'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Briefcase, Bot, MessageSquare, MessageCircle, HelpCircle, Share2, Users, Link2, GraduationCap, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

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
    { icon: Briefcase, title: 'Hướng nghiệp', color: '#f43f5e', href: '/huongnghiep' },
];

export default function CNServicesGrid() {
    const router = useRouter();
    const [active, setActive] = useState<number | null>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const checkScroll = () => {
        const container = scrollContainerRef.current;
        if (container) {
            const scrollWidth = container.scrollWidth;
            const clientWidth = container.clientWidth;
            const scrollLeft = container.scrollLeft;
            const maxScroll = scrollWidth - clientWidth;
            
            const hasOverflow = scrollWidth > clientWidth;
            const canScrollLeftVal = hasOverflow && scrollLeft > 0;
            const canScrollRightVal = hasOverflow && scrollLeft < maxScroll;
            
            setCanScrollLeft(canScrollLeftVal);
            setCanScrollRight(canScrollRightVal);
        }
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            // Multiple delays to ensure content is fully rendered
            const timeout1 = setTimeout(checkScroll, 100);
            const timeout2 = setTimeout(checkScroll, 300);
            const timeout3 = setTimeout(checkScroll, 500);
            container.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
            return () => {
                clearTimeout(timeout1);
                clearTimeout(timeout2);
                clearTimeout(timeout3);
                container.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
            };
        }
    }, []);

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
        }
    };

    return (
        <div className="py-1 sm:py-2 lg:py-3">
            <div className="mb-[18px] text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Sản phẩm phục vụ mục đích hỗ trợ học tập công nghệ trong thời đại số và tham gia Cuộc thi Sáng tạo thanh thiếu niên nhi đồng năm 2026
                    </span>
                </div>
            </div>
            <div className="mb-2 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--cn-text-main)' }}>
                    Tính năng nổi bật
                </h2>
                <p className="text-sm" style={{ color: 'var(--cn-text-muted)' }}>
                    Khám phá các tính năng nổi bật của CNcode
                </p>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={scrollLeft}
                    disabled={!canScrollLeft}
                    className="hidden lg:flex flex-shrink-0 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ border: '1px solid var(--cn-border)' }}
                >
                    <ChevronLeft className="w-5 h-5 text-[var(--cn-text-main)]" />
                </button>
                <div ref={scrollContainerRef} className="no-scrollbar overflow-x-auto flex-1 touch-pan-x cursor-grab active:cursor-grabbing">
                    <div className="flex gap-3 px-4">
                        {topics.map((topic, index) => {
                            const Icon = topic.icon;
                            const isActive = active === index;

                            return (
                                <div
                                    key={`${topic.title}-${index}`}
                                    className="flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:shadow-md cursor-pointer"
                                    style={{
                                        backgroundColor: 'var(--cn-bg-card)',
                                        border: `1.5px solid ${isActive ? topic.color : 'var(--cn-border)'}`,
                                    }}
                                    onMouseEnter={() => setActive(index)}
                                    onMouseLeave={() => setActive(null)}
                                    onClick={() => router.push(topic.href)}
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
                <button
                    onClick={scrollRight}
                    disabled={!canScrollRight}
                    className="hidden lg:flex flex-shrink-0 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ border: '1px solid var(--cn-border)' }}
                >
                    <ChevronRight className="w-5 h-5 text-[var(--cn-text-main)]" />
                </button>
            </div>
        </div>
    );
}
