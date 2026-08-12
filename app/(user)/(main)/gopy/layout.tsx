import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Góp ý & Phản hồi',
    description: 'Gửi góp ý và theo dõi phản hồi để CNcode ngày càng hoàn thiện hơn.',
    openGraph: {
        title: 'Góp ý & Phản hồi | CNcode',
        description: 'Gửi góp ý và theo dõi phản hồi để CNcode ngày càng hoàn thiện hơn.',
        url: '/gopy',
    },
};

export default function GopyLayout({ children }: { children: React.ReactNode }) {
    return children;
}
