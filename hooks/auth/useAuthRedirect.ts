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
        
        if (!_hasHydrated) return;

        const isGuestRoute = guestOnlyRoutes.includes(pathname);
        const isProtectedRoute = protectedRoutes.some(route => pathname?.startsWith(route));
        const isOnboardingRoute = pathname === '/onboarding';

        console.log('useAuthRedirect:', { pathname, isAuthenticated, isGuestRoute, isProtectedRoute });

        if (isAuthenticated) {
            
            if (isGuestRoute) {
                router.replace('/');
                return;
            }

            if (user?.isOnboarded === false && !isOnboardingRoute) {
                router.replace('/onboarding');
                return;
            }

            if (isOnboardingRoute && user?.isOnboarded === true) {
                router.replace('/');
                return;
            }
        }
        
        else {
            
            if (isProtectedRoute || isOnboardingRoute) {
                router.replace('/login');
                return;
            }

        }

    }, [pathname, isAuthenticated, user, _hasHydrated, router]);
};
