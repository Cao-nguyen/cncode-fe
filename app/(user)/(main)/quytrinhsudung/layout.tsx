import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Quy trình sử dụng',
    description: 'Hướng dẫn quy trình sử dụng các tính năng của CNcode'
};

export default function QuytrinhsudungLayout({ children }: { children: React.ReactNode }) {
    return children;
}