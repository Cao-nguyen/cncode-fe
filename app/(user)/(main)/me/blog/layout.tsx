import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog của tôi',
    description: 'Quản lý, chỉnh sửa và theo dõi bài viết blog cá nhân trên CNcode.',
    keywords: ['blog ca nhan', 'quan ly bai viet', 'viet blog cncode', 'cncode'],
    robots: {
        index: false,
        follow: false,
    },
    openGraph: {
        title: 'Blog của tôi | CNcode',
        description: 'Quản lý bài viết blog cá nhân trên CNcode.',
        type: 'website',
        url: '/me/blog',
    },
};

export default function MyBlogLayout({ children }: { children: React.ReactNode }) {
    return children;
}
