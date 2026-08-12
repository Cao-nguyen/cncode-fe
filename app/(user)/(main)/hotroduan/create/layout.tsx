import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Gửi dự án mới',
    description: 'Tạo yêu cầu hỗ trợ dự án mới và chia sẻ với đội ngũ CNcode.',
    openGraph: {
        title: 'Gửi dự án mới | CNcode',
        description: 'Tạo yêu cầu hỗ trợ dự án mới và chia sẻ với đội ngũ CNcode.',
        type: 'website',
        url: '/hotroduan/create',
    },
};

export default function CreateHelpProjectLayout({ children }: { children: React.ReactNode }) {
    return children;
}
