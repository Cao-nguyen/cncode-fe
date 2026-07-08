'use client';

import { useAuthRedirect } from '@/hooks/auth/useAuthRedirect';

export default function UserLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    useAuthRedirect();

    return (
        <div className="custom-scroll">
            {children}
        </div>
    );
}
