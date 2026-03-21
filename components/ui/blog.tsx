"use client"

import Image from "next/image"
import Link from "next/link"
import { Clock } from "iconsax-react"
import {
    Avatar,
    AvatarImage,
    AvatarFallback
} from "@/components/ui/avatar"
import { useTheme } from "next-themes"

interface BlogCard {
    title: string
    description: string
    image: string
    time: string
    author: string
    avatar: string
    link?: string
}

export default function BlogCard({
    title,
    description,
    image,
    time,
    author,
    avatar,
    link = "/blog"
}: BlogCard) {

    const { theme } = useTheme()

    return (
        <Link
            href={link}
            className="
                group block rounded-2xl overflow-hidden
                border border-[#e6e6e6] dark:border-[#222222]
                bg-white dark:bg-[#171717]
                hover:shadow-md hover:-translate-y-1
                transition-all duration-300
            "
        >

            {/* Image */}
            <div className="relative w-full h-48 overflow-hidden">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                />
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-2">

                {/* Title */}
                <h3 className="font-semibold text-base line-clamp-2">
                    {title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {description}
                </p>

                {/* Time */}
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <Clock size={20} color={theme === "dark" ? "#fff" : "#111"} variant="Bold" />
                    <span>{time}</span>
                </div>

                {/* Line */}
                <div className="my-2 h-px bg-[#e6e6e6] dark:bg-[#222222]" />

                {/* Author */}
                <div className="flex items-center gap-2">

                    <Avatar className="w-8 h-8">
                        <AvatarImage src={avatar} alt={author} />
                        <AvatarFallback>
                            {author?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>

                    <span className="text-sm text-black dark:text-white">
                        {author}
                    </span>

                </div>

            </div>
        </Link>
    )
}