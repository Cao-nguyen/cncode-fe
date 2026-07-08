'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import Footer from "@/components/layouts/footer";
import Header from "@/components/layouts/header";
import Loading from "@/components/common/Loading";

export default function TeacherLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter();
    const { user, token } = useAuthStore();

    useEffect(() => {
        // Kiểm tra đăng nhập
        if (!token || !user) {
            router.push('/login');
            return;
        }

        // Kiểm tra quyền: chỉ teacher và admin
        if (user.role !== 'teacher' && user.role !== 'admin') {
            router.push('/');
            return;
        }

        // Kiểm tra onboarding
        if (user.isOnboarded === false) {
            router.push('/onboarding');
            return;
        }
    }, [token, user, router]);

    // Hiển thị loading khi đang kiểm tra
    if (!token || !user) {
        return <Loading text="Đang kiểm tra quyền truy cập..." />;
    }

    // Hiển thị loading nếu không phải teacher/admin
    if (user.role !== 'teacher' && user.role !== 'admin') {
        return <Loading text="Đang chuyển hướng..." />;
    }

    return (
        <>
            <Header />
            <div className="min-h-screen mt-0 md:mt-0 lg:mt-15">
                {children}
            </div>
            <Footer />
        </>
    );
}
