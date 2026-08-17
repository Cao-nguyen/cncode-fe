'use client';

import { usePathname } from 'next/navigation';
import ForumShell from "@/components/forum/layout/ForumShell"
import { isForumRoute } from "@/components/forum/layout/forum-nav-config"

export default function UserLayoutNone({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();
    const isForumPage = isForumRoute(pathname);

    if (isForumPage) {
        return <ForumShell>{children}</ForumShell>;
    }

    return (
        <>
            {children}
        </>
    );
}
