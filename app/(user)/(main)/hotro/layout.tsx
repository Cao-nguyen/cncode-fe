import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Trung tâm hỗ trợ',
    description: 'Câu hỏi thường gặp và hướng dẫn sử dụng CNcode'
};

export default function HotroLayout({ children }: { children: React.ReactNode }) {
    return children;
}
