import LuyentapLamBaiClient from '@/components/luyentap/LuyentapLamBaiClient';

type PageProps = {
    params: Promise<{ id: string }>;
};

export default async function LuyentapLamBaiPage({ params }: PageProps) {
    const { id } = await params;
    return <LuyentapLamBaiClient slug={id} />;
}
