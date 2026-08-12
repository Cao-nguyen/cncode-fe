import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Quản lý đánh giá',
    description: 'Quản lý đánh giá của người dùng trên CNcode.',
    robots: { index: false, follow: false },
};

export default function AdminDanhGiaLayout({ children }: { children: React.ReactNode }) {
    return children;
}
