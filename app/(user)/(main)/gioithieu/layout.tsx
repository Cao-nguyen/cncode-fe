import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Giới thiệu',
    description: 'Về CNcode - Nền tảng học công nghệ và đổi mới sáng tạo'
};

export default function GioithieuLayout({ children }: { children: React.ReactNode }) {
    return children;
}