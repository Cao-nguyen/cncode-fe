import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Hướng dẫn thanh toán',
    description: 'Hướng dẫn các phương thức thanh toán trên CNcode'
};

export default function HuongdanthanhtoanLayout({ children }: { children: React.ReactNode }) {
    return children;
}