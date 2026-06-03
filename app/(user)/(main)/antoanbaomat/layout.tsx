import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'An toàn & bảo mật',
    description: 'Chính sách an toàn và bảo mật thông tin của CNcode'
};

export default function AntoanbaoMatLayout({ children }: { children: React.ReactNode }) {
    return children;
}
