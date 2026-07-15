'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

const guestOnlyRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password'];

export const useAuthRedirect = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, user, _hasHydrated } = useAuthStore();

    useEffect(() => {

        if (!_hasHydrated) return;

        const isGuestRoute = guestOnlyRoutes.includes(pathname);
        const isOnboardingRoute = pathname === '/onboarding';

        if (isAuthenticated) {
            // User is authenticated
            if (user?.isOnboarded === false) {
                // User needs to complete onboarding - only allow onboarding route
                if (!isOnboardingRoute) {
                    router.replace('/onboarding');
                    return;
                }
            } else {
                // User has completed onboarding - redirect away from guest routes
                if (isGuestRoute) {
                    router.replace('/');
                    return;
                }
                // Redirect away from onboarding if already completed
                if (isOnboardingRoute) {
                    router.replace('/');
                    return;
                }
            }
        }

        // Unauthenticated users can access all routes - no redirect

    }, [pathname, isAuthenticated, user, _hasHydrated, router]);
};
