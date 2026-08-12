import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Quản lý hỗ trợ dự án',
    description: 'Quản lý các dự án hỗ trợ từ người dùng trên CNcode.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function AdminHotroduanLayout({ children }: { children: React.ReactNode }) {
    return children;
}
