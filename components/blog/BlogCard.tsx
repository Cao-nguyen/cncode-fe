'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { stripMarkdown } from '@/lib/utils/strip-markdown';

interface IBlogCardProps {
    title: string;
    description: string;
    image: string;
    time: string;
    author: string;
    avatar: string;
    category: string;
    link?: string;
}

export default function BlogCard({
    title,
    description,
    image,
    time,
    author,
    avatar,
    category,
    link = '/baiviet',
}: IBlogCardProps): React.ReactElement {
    const plainDescription = stripMarkdown(description);

    return (
        <Link
            href={link}
            className="group block rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#171717] hover:shadow-md hover:-translate-y-1 transition-all duration-300"
        >
            <div className="relative w-full h-48 overflow-hidden">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-2 left-2">
                    <Badge className="bg-black text-white dark:bg-white dark:text-black">
                        {category}
                    </Badge>
                </div>
            </div>
            <div className="p-4 flex flex-col gap-2">
                <h3 className="font-semibold text-base line-clamp-2 text-gray-900 dark:text-white">
                    {title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {plainDescription}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <Clock size={18} className="text-black dark:text-white" />
                    <span>{time}</span>
                </div>
                <div className="my-2 h-px bg-gray-200 dark:bg-gray-800" />
                <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                        <AvatarImage src={avatar} alt={author} />
                        <AvatarFallback>{author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-900 dark:text-white">{author}</span>
                </div>
            </div>
        </Link>
    );
}