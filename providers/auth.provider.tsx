'use client';

import { ReactNode } from 'react';
import { useAuthStore } from '@/store/auth.store';

interface AuthProviderProps {
    children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
    const _hasHydrated = useAuthStore((state) => state._hasHydrated);

    // Hiển thị loading trong khi Zustand persist đang hydrate dữ liệu
    if (!_hasHydrated) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-3 text-gray-600 font-medium">Đang tải ứng dụng...</p>
                </div>
            </div>
        );
    }

    // Đã hydrate xong, render children bình thường
    return <>{children}</>;
}