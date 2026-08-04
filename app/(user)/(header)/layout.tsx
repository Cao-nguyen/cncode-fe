'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from "@/components/layouts/header"
import { Upload } from 'lucide-react';

const HEADER_OFFSET_CLASS = 'pt-10 pb-14 md:pt-[40px] md:pb-0 lg:pt-[60px] lg:pb-0';
const SIDEBAR_OFFSET_CLASS = 'top-10 bottom-14 md:top-[40px] md:bottom-0 lg:top-[60px] lg:bottom-0';

const FORUM_MENU = [
    {
        title: 'Chat',
        desc: 'Nhóm chat',
        link: '/forum',
        icon: '/forum/chat.png',
    },
    {
        title: 'Video',
        desc: 'Video ngắn',
        link: '/khampha',
        icon: '/forum/clapperboard.png',
    },
    {
        title: 'Đăng video',
        desc: 'Đăng video mới',
        link: '/khampha/upload',
        icon: 'upload',
    },
    {
        title: 'Danh bạ',
        desc: 'Danh bạ',
        link: '/contact',
        icon: '/forum/notebook-of-contacts.png',
    },
    {
        title: 'Cài đặt',
        desc: 'Cài đặt',
        link: '/forumset',
        icon: '/forum/setting.png',
    }
];

export default function UserLayoutHeader({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();
    const isForumPage = pathname?.startsWith('/forum') || pathname?.startsWith('/khampha') || pathname?.startsWith('/contact') || pathname?.startsWith('/forumset');

    if (isForumPage) {
        return (
            <>
                <Header />
                <div className={`relative h-screen flex overflow-hidden ${HEADER_OFFSET_CLASS}`}>
                    {/* Sidebar */}
                    <div className={`flex-shrink-0 ${SIDEBAR_OFFSET_CLASS} z-0 lg:w-16 w-12 bg-[#005ae0] flex flex-col items-center justify-start gap-8 pt-8`}>
                        {FORUM_MENU.map((item, idx) => {
                            const isActive = pathname === item.link;
                            return (
                                <Link
                                    key={idx}
                                    href={item.link}
                                    className={`lg:w-10 lg:h-10 w-8 h-8 rounded-md flex items-center justify-center transition-all ${isActive ? '' : ''}`}
                                    style={isActive ? { backgroundColor: 'rgba(0,0,0,0.15)' } : {}}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.15)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = '';
                                        }
                                    }}
                                    title={item.title}
                                >
                                    {item.icon === 'upload' ? (
                                        <Upload className="lg:w-6 lg:h-6 w-5 h-5 text-white" />
                                    ) : (
                                        <Image
                                            src={item.icon}
                                            alt={item.title}
                                            width={24}
                                            height={24}
                                            className="lg:w-6 lg:h-6 w-5 h-5 brightness-0 invert"
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 overflow-auto">
                        {children}
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="lg:h-[calc(100vh-60px)] h-[calc(100vh-96px)] overflow-hidden">
                {children}
            </div>
        </>
    );
}
