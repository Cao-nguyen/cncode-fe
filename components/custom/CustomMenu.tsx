// /components/custom/CustomMenu.tsx
'use client';

import React, { useState } from 'react';
import { ChevronRight, BookOpen, Bot, MessageCircle, Briefcase, MessageSquare, HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface MenuItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    href?: string;
    onClick?: () => void;
    badge?: string;
    isActive?: boolean;
}

interface MenuGroup {
    id: string;
    title: string;
    items: MenuItem[];
}

interface CustomMenuProps {
    groups?: MenuGroup[];
    className?: string;
    onItemClick?: (item: MenuItem) => void;
}

const defaultGroups: MenuGroup[] = [
    {
        id: 'cnbooks',
        title: 'CNbooks',
        items: [
            { id: 'ai-tutor', label: 'Gia sư AI', icon: <Bot className="w-4 h-4" />, href: '/ai-tutor' },
            { id: 'chat-admin', label: 'Chat với Admin', icon: <MessageCircle className="w-4 h-4" />, href: '/chat/admin' },
        ]
    },
    {
        id: 'cnjobs',
        title: 'CNjobs',
        items: [
            { id: 'feedback', label: 'Góp ý', icon: <MessageSquare className="w-4 h-4" />, href: '/feedback' },
            { id: 'qa', label: 'Hỏi đáp', icon: <HelpCircle className="w-4 h-4" />, href: '/qa' },
        ]
    }
];

export const CustomMenu: React.FC<CustomMenuProps> = ({
    groups = defaultGroups,
    className = '',
    onItemClick,
}) => {
    const [activeId, setActiveId] = useState<string>('');

    const handleItemClick = (item: MenuItem) => {
        setActiveId(item.id);
        onItemClick?.(item);
    };

    return (
        <div className={`w-full bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] border border-[var(--cn-border)] overflow-hidden ${className}`}>
            {groups.map((group) => (
                <div key={group.id} className="border-b border-[var(--cn-border)] last:border-b-0">
                    {/* Group Title */}
                    <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-[var(--cn-bg-section)] border-b border-[var(--cn-border)]">
                        <h3 className="text-xs sm:text-sm font-semibold text-[var(--cn-text-sub)] uppercase tracking-wider">
                            {group.title}
                        </h3>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                        {group.items.map((item) => (
                            <Link
                                key={item.id}
                                href={item.href || '#'}
                                onClick={() => handleItemClick(item)}
                                className={`
                                    flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3
                                    transition-all duration-200 group
                                    ${activeId === item.id || item.isActive
                                        ? 'bg-[var(--cn-hover-blue)] text-[var(--cn-primary)]'
                                        : 'hover:bg-[var(--cn-hover)] text-[var(--cn-text-sub)] hover:text-[var(--cn-text-main)]'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className={`
                                        w-4 h-4 sm:w-5 sm:h-5
                                        ${activeId === item.id || item.isActive
                                            ? 'text-[var(--cn-primary)]'
                                            : 'text-[var(--cn-text-muted)] group-hover:text-[var(--cn-text-sub)]'
                                        }
                                    `}>
                                        {item.icon}
                                    </div>
                                    <span className="text-sm sm:text-base font-medium">
                                        {item.label}
                                    </span>
                                </div>

                                {item.badge && (
                                    <span className="px-1.5 py-0.5 text-[10px] sm:text-xs font-medium bg-red-500 text-white rounded-full">
                                        {item.badge}
                                    </span>
                                )}

                                <ChevronRight className={`
                                    w-3 h-3 sm:w-4 sm:h-4 transition-all duration-200
                                    ${activeId === item.id || item.isActive
                                        ? 'text-[var(--cn-primary)] translate-x-0.5'
                                        : 'text-[var(--cn-text-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'
                                    }
                                `} />
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};