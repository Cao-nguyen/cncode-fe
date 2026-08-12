import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Quản lý góp ý',
    description: 'Quản lý và xử lý góp ý từ người dùng trên CNcode.',
    robots: { index: false, follow: false },
};

export default function AdminGopyLayout({ children }: { children: React.ReactNode }) {
    return children;
}
