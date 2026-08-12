import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Quản lý hỏi đáp',
    description: 'Quản lý câu hỏi và câu trả lời từ người dùng trên CNcode.',
    robots: { index: false, follow: false },
};

export default function AdminFaqLayout({ children }: { children: React.ReactNode }) {
    return children;
}
