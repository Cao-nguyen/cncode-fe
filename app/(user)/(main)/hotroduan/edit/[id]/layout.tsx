import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Chỉnh sửa dự án',
    description: 'Cập nhật thông tin dự án hỗ trợ của bạn trên CNcode.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function EditHelpProjectLayout({ children }: { children: React.ReactNode }) {
    return children;
}
