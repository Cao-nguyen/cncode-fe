import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Hỗ trợ dự án',
    description: 'Gửi dự án của bạn, nhận phản hồi và hỗ trợ từ đội ngũ CNcode.',
    keywords: ['ho tro du an', 'gui du an', 'ho tro cncode', 'phan hoi du an', 'cncode'],
    openGraph: {
        title: 'Hỗ trợ dự án | CNcode',
        description: 'Gửi dự án của bạn, nhận phản hồi và hỗ trợ từ đội ngũ CNcode.',
        type: 'website',
        url: '/hotroduan',
    },
};

export default function HotroduanLayout({ children }: { children: React.ReactNode }) {
    return children;
}
