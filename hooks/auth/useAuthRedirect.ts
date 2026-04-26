'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/onboarding'];
const protectedRoutes = ['/profile', '/me', '/admin', '/teacher'];

export const useAuthRedirect = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, user, isLoading } = useAuthStore();

    useEffect(() => {
        if (isLoading) return;

        if (publicRoutes.includes(pathname) && isAuthenticated) {
            router.replace('/');
            return;
        }

        const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
        if (isProtectedRoute && !isAuthenticated) {
            router.replace('/login');
            return;
        }

        if (pathname.startsWith('/admin') && isAuthenticated) {
            if (user?.role !== 'admin') {
                router.replace('/');
                return;
            }
        }

        if (pathname.startsWith('/teacher') && isAuthenticated) {
            if (user?.role !== 'teacher' && user?.role !== 'admin') {
                router.replace('/');
                return;
            }
        }
    }, [pathname, isAuthenticated, user, isLoading, router]);
};