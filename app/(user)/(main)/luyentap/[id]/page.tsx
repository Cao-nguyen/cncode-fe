import LuyentapSlugDetailClient from '@/components/luyentap/LuyentapSlugDetailClient';

type PageProps = {
    params: Promise<{ id: string }>;
};

export default async function LuyentapDetailPage({ params }: PageProps) {
    const { id } = await params;
    return <LuyentapSlugDetailClient id={id} />;
}
