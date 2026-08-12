import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Chi tiết dự án',
    description: 'Xem nội dung dự án và trao đổi phản hồi với đội ngũ CNcode.',
    openGraph: {
        title: 'Chi tiết dự án | CNcode',
        description: 'Xem nội dung dự án và trao đổi phản hồi với đội ngũ CNcode.',
        type: 'article',
    },
};

export default function HelpProjectDetailLayout({ children }: { children: React.ReactNode }) {
    return children;
}
