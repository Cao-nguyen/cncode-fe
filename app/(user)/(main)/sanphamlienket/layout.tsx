import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sản phẩm của chúng tôi',
    description: 'Các sản phẩm và dịch vụ của CNcode'
};

export default function SanphamlienketLayout({ children }: { children: React.ReactNode }) {
    return children;
}