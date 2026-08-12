import type { Metadata } from 'next';
import { getImageUrl } from '@/lib/utils/imageUrl';
import { fetchBlogBySlug, getBlogDescription } from '@/lib/server/fetch-blog';

type LayoutProps = {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
};

const SITE_URL = 'https://cncode.io.vn';

function toAbsoluteImageUrl(thumbnail?: string): string | undefined {
    const imageUrl = getImageUrl(thumbnail);
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }
    return `${SITE_URL}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
}

export async function generateMetadata({ params }: Pick<LayoutProps, 'params'>): Promise<Metadata> {
    const { slug } = await params;
    const blog = await fetchBlogBySlug(slug);

    if (!blog) {
        return {
            title: 'Bài viết không tồn tại',
            description: 'Không tìm thấy bài viết blog trên CNcode.',
        };
    }

    const description = getBlogDescription(blog);
    const pageUrl = `/blog/${blog.slug}`;
    const imageUrl = toAbsoluteImageUrl(blog.thumbnail);

    return {
        title: blog.title,
        description,
        keywords: blog.tags?.length ? blog.tags : undefined,
        authors: blog.author?.fullName ? [{ name: blog.author.fullName }] : undefined,
        openGraph: {
            title: blog.title,
            description,
            type: 'article',
            url: pageUrl,
            publishedTime: blog.publishedAt || blog.createdAt,
            modifiedTime: blog.updatedAt,
            authors: blog.author?.fullName ? [blog.author.fullName] : undefined,
            tags: blog.tags,
            ...(imageUrl ? { images: [{ url: imageUrl, alt: blog.title }] } : {}),
        },
        twitter: {
            card: imageUrl ? 'summary_large_image' : 'summary',
            title: blog.title,
            description,
            ...(imageUrl ? { images: [imageUrl] } : {}),
        },
        alternates: {
            canonical: pageUrl,
        },
    };
}

export default function BlogDetailLayout({ children }: { children: React.ReactNode }) {
    return children;
}
