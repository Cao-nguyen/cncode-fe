'use client';

import { ReactNode } from 'react';
import { useAuthRedirect } from '@/hooks/auth/useAuthRedirect';

interface AuthGuardProps {
    children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
    useAuthRedirect();
    return <>{children}</>;
};