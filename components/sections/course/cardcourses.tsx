"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, User, Eye } from "iconsax-react";

interface CardCoursesProps {
    title: string;
    description: string;
    image: string;
    duration: string;
    students: string;
    price: string;
    oldPrice?: string;
    discount?: number;
    isFree?: boolean;
    link: string;
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
    link,
}: CardCoursesProps) {
    return (
        <Link href={link} className="group block">
            <div className="bg-white dark:bg-[#171717] rounded-2xl overflow-hidden border border-[#e6e6e6] dark:border-[#222222] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="relative w-full h-40 overflow-hidden">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition duration-300"
                    />
                    {discount && discount > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                            -{discount}%
                        </div>
                    )}
                    {isFree && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                            Miễn phí
                        </div>
                    )}
                </div>

                <div className="p-4">
                    <h3 className="font-semibold text-base text-gray-900 dark:text-white line-clamp-1">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {description}
                    </p>

                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                            <Clock size={14} variant="Outline" />
                            {duration}
                        </span>
                        <span className="flex items-center gap-1">
                            <User size={14} variant="Outline" />
                            {students} học viên
                        </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                        <div>
                            {oldPrice && (
                                <span className="text-xs text-gray-400 line-through mr-2">
                                    {oldPrice}
                                </span>
                            )}
                            <span className="text-lg font-bold text-primary">
                                {isFree ? "Miễn phí" : price}
                            </span>
                        </div>
                        <span className="text-primary group-hover:translate-x-1 transition">
                            <Eye size={18} variant="Outline" />
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}