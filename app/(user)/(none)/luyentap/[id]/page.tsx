import LuyentapDetailClient from './LuyentapDetailClient';

type PageProps = {
    params: Promise<{ id: string }>;
};

export default async function LuyentapDetailPage({ params }: PageProps) {
    const { id } = await params;
    return <LuyentapDetailClient exerciseId={id} />;
}
