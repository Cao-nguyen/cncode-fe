import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Góc Hỏi Đáp',
    description: 'Đặt câu hỏi bài tập và nhận sự trợ giúp từ cộng đồng CNcode.',
    openGraph: {
        title: 'Góc Hỏi Đáp | CNcode',
        description: 'Đặt câu hỏi bài tập và nhận sự trợ giúp từ cộng đồng CNcode.',
        type: 'website',
        url: '/faq',
    },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
    return children;
}
