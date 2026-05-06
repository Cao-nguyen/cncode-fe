'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

const guestOnlyRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
const protectedRoutes = ['/profile', '/me', '/admin', '/teacher'];

export const useAuthRedirect = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, user, _hasHydrated } = useAuthStore();

    useEffect(() => {
        // Chờ hydrate xong
        if (!_hasHydrated) return;

        const isGuestRoute = guestOnlyRoutes.includes(pathname);
        const isProtectedRoute = protectedRoutes.some(route => pathname?.startsWith(route));
        const isOnboardingRoute = pathname === '/onboarding';

        console.log('useAuthRedirect:', { pathname, isAuthenticated, isGuestRoute, isProtectedRoute });

        // ĐÃ ĐĂNG NHẬP
        if (isAuthenticated) {
            // Đang ở guest route (login, register...) -> về home
            if (isGuestRoute) {
                router.replace('/');
                return;
            }

            // Chưa onboarded và không ở onboarding -> về onboarding
            if (user?.isOnboarded === false && !isOnboardingRoute) {
                router.replace('/onboarding');
                return;
            }

            // Đã onboarded mà đang ở onboarding -> về home
            if (isOnboardingRoute && user?.isOnboarded === true) {
                router.replace('/');
                return;
            }
        }
        // CHƯA ĐĂNG NHẬP
        else {
            // Đang ở protected route hoặc onboarding -> về login
            if (isProtectedRoute || isOnboardingRoute) {
                router.replace('/login');
                return;
            }

            // Guest routes (login, register...) -> CHO PHÉP TRUY CẬP
            // Không làm gì cả
        }

    }, [pathname, isAuthenticated, user, _hasHydrated, router]);
};