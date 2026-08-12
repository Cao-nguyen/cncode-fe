import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog',
    description: 'Tin tức, bài viết về công nghệ, giáo dục và lập trình trên CNcode.',
    keywords: ['blog cncode', 'tin tuc cong nghe', 'bai viet lap trinh', 'giao duc cong nghe', 'cncode blog'],
    openGraph: {
        title: 'Blog | CNcode',
        description: 'Tin tức, bài viết về công nghệ, giáo dục và lập trình trên CNcode.',
        type: 'website',
        url: '/blog',
    },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return children;
}
