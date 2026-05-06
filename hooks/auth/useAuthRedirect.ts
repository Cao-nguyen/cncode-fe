'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

const guestOnlyRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
const protectedRoutes = ['/profile', '/me', '/admin', '/teacher'];

export const useAuthRedirect = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, user, isLoading, _hasHydrated } = useAuthStore();

    useEffect(() => {
        // Chờ persist hydrate xong mới redirect
        if (!_hasHydrated) return;

        // Chờ loading từ actions (login/logout)
        if (isLoading) return;

        // isAuthenticated = true nhưng user vẫn null → chưa có dữ liệu, chờ
        if (isAuthenticated && user === null) return;

        // Đã đăng nhập mà vào trang guest-only (login, register...) → về trang chủ
        if (guestOnlyRoutes.includes(pathname) && isAuthenticated) {
            router.replace('/');
            return;
        }

        // Chưa đăng nhập mà vào route protected → về login
        const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
        if (isProtectedRoute && !isAuthenticated) {
            router.replace('/login');
            return;
        }

        // Đã đăng nhập + chưa onboarded + không ở /onboarding → bắt về /onboarding
        if (isAuthenticated && user?.isOnboarded === false && pathname !== '/onboarding') {
            router.replace('/onboarding');
            return;
        }

        // Đã đăng nhập + đã onboarded + vào /onboarding → về trang chủ
        if (pathname === '/onboarding' && isAuthenticated && user?.isOnboarded === true) {
            router.replace('/');
            return;
        }

        // Kiểm tra quyền admin
        if (pathname.startsWith('/admin') && isAuthenticated) {
            if (user?.role !== 'admin') {
                router.replace('/');
                return;
            }
        }

        // Kiểm tra quyền teacher
        if (pathname.startsWith('/teacher') && isAuthenticated) {
            if (user?.role !== 'teacher' && user?.role !== 'admin') {
                router.replace('/');
                return;
            }
        }
    }, [pathname, isAuthenticated, user, isLoading, _hasHydrated, router]);
};