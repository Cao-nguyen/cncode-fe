'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { stripMarkdown } from '@/lib/utils/strip-markdown';

interface IBlogCardProps {
    title: string;
    description: string;
    image: string;
    createdAt: string;
    author: string;
    avatar: string;
    link?: string;
    views?: number;
}

export default function BlogCard({
    title,
    description,
    image,
    createdAt,
    author,
    avatar,
    link = '/baiviet',
}: IBlogCardProps): React.ReactElement {
    const plainDescription = stripMarkdown(description);

    const formatDate = (dateString: string): string =>
        new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });

    return (
        <Link
            href={link}
            className="group block rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#171717] hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
            <div className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-main/10 to-main/5">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                />
            </div>
            <div className="p-4 flex flex-col gap-2">
                <h3 className="font-semibold text-base line-clamp-2 text-gray-900 dark:text-white group-hover:text-main transition-colors duration-200">
                    {title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {plainDescription}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <Clock size={18} className="text-main" />
                    <span>{formatDate(createdAt)}</span>
                </div>
                <div className="my-2 h-px bg-gray-200 dark:bg-gray-800" />
                <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                        <AvatarImage src={avatar} alt={author} />
                        <AvatarFallback className="bg-main/10 text-main text-xs">
                            {author.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {author}
                    </span>
                </div>
            </div>
        </Link>
    );
}