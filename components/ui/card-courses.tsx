"use client"

import Image from "next/image"
import Link from "next/link"
import { Clock, SecurityUser } from "iconsax-react"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"

interface Props {
    title: string
    description: string
    image: string
    duration: string
    students: string
    price?: string
    oldPrice?: string
    discount?: number
    isFree?: boolean
    link: string
}

export default function CardCourses({
    title,
    description,
    image,
    duration,
    students,
    price,
    oldPrice,
    discount,
    isFree = false,
    link
}: Props) {

    const { resolvedTheme } = useTheme()
    const colorTheme = resolvedTheme === "dark" ? "#fff" : "#111"

    return (
        <div className="
            w-full 
            rounded-2xl 
            border border-[#e6e6e6] dark:border-[#222222] 
            bg-white dark:bg-[#171717] 
            text-black dark:text-white 
            overflow-hidden 
            shadow-sm hover:shadow-md 
            hover:-translate-y-1 
            transition-all duration-300
        ">

            {/* Image */}
            <Link href={link} className="block relative w-full h-60 md:h-40 lg:h-55">
                <Image src={image} alt={title} fill className="object-cover" />

                {/* Discount */}
                {discount && (
                    <div className="absolute top-2 left-2">
                        <Badge className="bg-red-500 text-white">
                            -{discount}%
                        </Badge>
                    </div>
                )}

                {/* Free / Pro */}
                <div className="absolute top-2 right-2">
                    <Badge className={isFree ? "bg-green-500 text-white" : "bg-purple-600 text-white"}>
                        {isFree ? "Free" : "Pro"}
                    </Badge>
                </div>
            </Link>

            {/* Content */}
            <div className="p-4 flex flex-col gap-2">

                <h3 className="text-sm md:text-base font-semibold line-clamp-2">
                    {title}
                </h3>

                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {description}
                </p>

                <div className="py-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">

                    <div className="flex items-center gap-1">
                        <Clock size={25} color={colorTheme} variant="Bold" />
                        <span className="text-[14px]">{duration}</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <SecurityUser size={25} color={colorTheme} variant="Bold" />
                        <span className="text-[14px]">{students}</span>
                    </div>

                </div>

                {!isFree && price && (
                    <div className="flex items-center gap-2">
                        <span className="text-red-500 font-semibold">
                            {price}
                        </span>
                        {oldPrice && (
                            <span className="text-gray-400 line-through">
                                {oldPrice}
                            </span>
                        )}
                    </div>
                )}

            </div>
        </div>
    )
}