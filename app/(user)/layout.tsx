'use client';

import { usePathname } from 'next/navigation';
import { useAuthRedirect } from '@/hooks/auth/useAuthRedirect';
import { isForumRoute } from '@/components/forum/layout/forum-nav-config';

export default function UserLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    useAuthRedirect();
    const pathname = usePathname();
    const isForumPage = isForumRoute(pathname);

    if (isForumPage) {
        return <>{children}</>;
    }

    return (
        <div className="custom-scroll">
            {children}
        </div>
    );
}
