import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Điều khoản sử dụng',
    description: 'Điều khoản và điều kiện sử dụng dịch vụ CNcode'
};

export default function DieukhoansudungLayout({ children }: { children: React.ReactNode }) {
    return children;
}