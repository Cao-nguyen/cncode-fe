'use client';

import { ReactNode } from 'react';
import { useAuthStore } from '@/store/auth.store';
import AuthSkeleton from '@/components/common/AuthSkeleton';

interface AuthProviderProps {
    children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
    const _hasHydrated = useAuthStore((state) => state._hasHydrated);

    if (!_hasHydrated) {
        return <AuthSkeleton />;
    }

    return <>{children}</>;
}