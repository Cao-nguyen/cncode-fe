import {
    MessageCircle,
    Clapperboard,
    Upload,
    Users,
    Settings,
    type LucideIcon,
} from 'lucide-react';

export interface ForumNavItem {
    title: string;
    shortLabel: string;
    href: string;
    icon: LucideIcon;
    match: (pathname: string) => boolean;
}

export const FORUM_NAV_ITEMS: ForumNavItem[] = [
    {
        title: 'Chat',
        shortLabel: 'Chat',
        href: '/forum',
        icon: MessageCircle,
        match: (pathname) => pathname === '/forum',
    },
    {
        title: 'Video',
        shortLabel: 'Video',
        href: '/forum/khampha',
        icon: Clapperboard,
        match: (pathname) =>
            pathname === '/forum/khampha' ||
            (pathname.startsWith('/forum/khampha/') && pathname !== '/forum/khampha/upload'),
    },
    {
        title: 'Đăng video',
        shortLabel: 'Đăng',
        href: '/forum/khampha/upload',
        icon: Upload,
        match: (pathname) => pathname === '/forum/khampha/upload',
    },
    {
        title: 'Danh bạ',
        shortLabel: 'Bạn bè',
        href: '/forum/contact',
        icon: Users,
        match: (pathname) => pathname === '/forum/contact' || pathname.startsWith('/forum/contact/'),
    },
    {
        title: 'Cài đặt',
        shortLabel: 'Cài đặt',
        href: '/forum/settings',
        icon: Settings,
        match: (pathname) => pathname === '/forum/settings' || pathname.startsWith('/forum/settings/'),
    },
];

export function isForumRoute(pathname: string | null): boolean {
    if (!pathname) return false;
    return (
        pathname === '/forum' ||
        pathname.startsWith('/forum/') ||
        pathname === '/khampha' ||
        pathname.startsWith('/khampha/') ||
        pathname === '/contact' ||
        pathname.startsWith('/contact/') ||
        pathname === '/forumset' ||
        pathname.startsWith('/forumset/')
    );
}

export function getActiveForumNavItem(pathname: string): ForumNavItem | undefined {
    return FORUM_NAV_ITEMS.find((item) => item.match(pathname));
}
