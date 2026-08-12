import type { Metadata } from 'next';
import { fetchFaqBySlug } from '@/lib/server/fetch-faq';

type LayoutProps = {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Pick<LayoutProps, 'params'>): Promise<Metadata> {
    const { slug } = await params;
    const faq = await fetchFaqBySlug(slug);

    if (!faq) {
        return {
            title: 'Câu hỏi không tồn tại',
            description: 'Không tìm thấy câu hỏi trên CNcode.',
        };
    }

    return {
        title: faq.title,
        description: faq.description,
        openGraph: {
            title: faq.title,
            description: faq.description,
            type: 'article',
            url: `/faq/${faq.slug}`,
        },
        alternates: { canonical: `/faq/${faq.slug}` },
    };
}

export default function FaqDetailLayout({ children }: { children: React.ReactNode }) {
    return children;
}
