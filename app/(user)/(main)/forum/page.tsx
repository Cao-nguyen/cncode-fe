// app/forum/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Layout, MessageSquare, ArrowRight } from 'lucide-react';

const FORUM_MENU = [
    {
        title: 'Khám phá',
        desc: 'Video ngắn (Tiktok style)',
        link: '/forum/khampha',
        icon: Play,
        bg: 'bg-rose-50',
        text: 'text-rose-600',
    },
    {
        title: 'Thông tin',
        desc: 'Bản tin (Facebook style)',
        link: '/forum/thongtin',
        icon: Layout,
        bg: 'bg-blue-50',
        text: 'text-blue-600',
    },
    {
        title: 'Cộng đồng',
        desc: 'Nhóm chat (Zalo style)',
        link: '/forum/congdong',
        icon: MessageSquare,
        bg: 'bg-sky-50',
        text: 'text-sky-600',
    }
];

export default function ForumPage() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-6">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-800">Diễn đàn CNcode</h1>
                <p className="text-gray-400 text-sm mt-2">Chọn không gian bạn muốn tham gia</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                {FORUM_MENU.map((item, idx) => (
                    <Link
                        key={idx}
                        href={item.link}
                        className="group relative bg-white border border-gray-100 p-6 rounded-2xl transition-all hover:shadow-lg hover:border-blue-200"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${item.bg} ${item.text}`}>
                                <item.icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="font-bold text-gray-800 text-lg">{item.title}</h2>
                                <p className="text-gray-400 text-xs truncate">{item.desc}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}