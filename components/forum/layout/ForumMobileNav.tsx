'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FORUM_NAV_ITEMS } from './forum-nav-config';

export default function ForumMobileNav() {
    const pathname = usePathname() ?? '';

    return (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 flex border-t border-[var(--cn-border)] bg-[var(--cn-bg-card)] pb-safe">
            {FORUM_NAV_ITEMS.map((item) => {
                const isActive = item.match(pathname);
                const Icon = item.icon;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'flex-1 flex flex-col items-center justify-center py-2 transition-all duration-200',
                            isActive
                                ? 'text-[var(--cn-primary)]'
                                : 'text-[var(--cn-text-muted)] hover:text-[var(--cn-text-sub)]'
                        )}
                    >
                        <Icon className={cn('h-5 w-5', isActive && 'text-[var(--cn-primary)]')} />
                        <span className="text-[10px] mt-0.5">{item.shortLabel}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
