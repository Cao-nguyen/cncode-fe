import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Chính sách bảo hành',
    description: 'Quy định và điều kiện bảo hành sản phẩm của CNcode'
};

export default function ChinhsachbaohanhLayout({ children }: { children: React.ReactNode }) {
    return children;
}