'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FORUM_NAV_ITEMS } from './forum-nav-config';

export default function ForumNavRail() {
    const pathname = usePathname() ?? '';

    return (
        <aside className="hidden md:flex w-16 lg:w-52 shrink-0 flex-col border-r border-[var(--cn-border)] bg-[var(--cn-bg-card)]">
            <div className="hidden lg:block px-4 py-5 border-b border-[var(--cn-border)]">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--cn-text-muted)]">
                    Diễn đàn
                </p>
                <p className="mt-0.5 text-sm font-semibold text-[var(--cn-text-main)]">
                    Cộng đồng CNCode
                </p>
            </div>

            <nav className="flex flex-1 flex-col gap-1 p-2 lg:p-3">
                {FORUM_NAV_ITEMS.map((item) => {
                    const isActive = item.match(pathname);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={item.title}
                            className={cn(
                                'group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200',
                                isActive
                                    ? 'bg-[var(--cn-primary-light)] text-[var(--cn-primary)] shadow-sm'
                                    : 'text-[var(--cn-text-sub)] hover:bg-[var(--cn-hover)] hover:text-[var(--cn-text-main)]'
                            )}
                        >
                            <Icon
                                className={cn(
                                    'h-5 w-5 shrink-0 transition-colors',
                                    isActive
                                        ? 'text-[var(--cn-primary)]'
                                        : 'text-[var(--cn-text-muted)] group-hover:text-[var(--cn-text-sub)]'
                                )}
                            />
                            <span className="hidden lg:block text-sm font-medium truncate">
                                {item.title}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
