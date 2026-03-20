"use client"

import Image from "next/image"
import Link from "next/link"
import { Clock, SecurityUser } from "iconsax-react"
import { Badge } from "@/components/ui/badge"

export default function CourseCard() {

    const isFree = false

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
            <Link href="/course" className="block relative w-full h-[160px]">
                <Image
                    src="/images/images1.jpg"
                    alt="course"
                    fill
                    className="object-cover"
                />

                {/* Discount */}
                <div className="absolute top-2 left-2">
                    <Badge className="bg-red-500 text-white">
                        -40%
                    </Badge>
                </div>

                {/* Free / Pro */}
                <div className="absolute top-2 right-2">
                    {isFree ? (
                        <Badge className="bg-green-500 text-white">
                            Free
                        </Badge>
                    ) : (
                        <Badge className="bg-purple-600 text-white">
                            Pro
                        </Badge>
                    )}
                </div>
            </Link>

            {/* Content */}
            <div className="p-4 flex flex-col gap-2">

                {/* Title */}
                <h3 className="text-sm md:text-base font-semibold line-clamp-2">
                    Khóa học Fullstack từ A-Z (React, NodeJS, MongoDB)
                </h3>

                {/* Description */}
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    Học từ cơ bản đến nâng cao, xây dựng dự án thực tế với React, NodeJS,
                    MongoDB và triển khai production. Phù hợp cho người mới bắt đầu và
                    muốn đi làm fullstack developer.
                </p>

                {/* Info */}
                <div className="p-[10px_0px] flex justify-between text-xs text-gray-500 dark:text-gray-400">

                    <div className="flex items-center gap-1">
                        <Clock size="25" color="white" variant="Bold" />
                        <span className="text-[14px]">12h</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <SecurityUser size="25" color="white" variant="Bold" />
                        <span className="text-[14px]">1.2K</span>
                    </div>

                </div>

                {/* Price */}
                {!isFree && (
                    <div className="flex items-center gap-2">
                        <span className="text-red-500 font-semibold text-base">
                            299.000đ
                        </span>
                        <span className="text-gray-400 line-through text-sm">
                            499.000đ
                        </span>
                    </div>
                )}

            </div>
        </div>
    )
}