"use client"

import { useState } from "react"
import { Star1 } from "iconsax-react"
import {
    Avatar,
    AvatarImage,
    AvatarFallback
} from "@/components/ui/avatar"

interface Comment {
    name: string
    content: string
    rating: number
    avatar?: string
}

export default function Testimonial() {

    const [comments, setComments] = useState<Comment[]>([
        {
            name: "User #1023",
            content: "Khoá học rất hay, dễ hiểu và thực tế 🔥",
            rating: 5,
            avatar: "/images/avatar.png"
        },
        {
            name: "User #8472",
            content: "Giảng viên hỗ trợ rất nhiệt tình!",
            rating: 4,
            avatar: "/images/avatar.png"
        }
    ])

    const [content, setContent] = useState("")
    const [rating, setRating] = useState(5)
    const [index, setIndex] = useState(0)

    const handleSubmit = () => {
        if (!content) return

        const newComment: Comment = {
            name: `User #${Math.floor(Math.random() * 9999)}`,
            content,
            rating,
            avatar: "/images/avatar.png"
        }

        setComments([newComment, ...comments])
        setContent("")
        setRating(5)
        setIndex(0)
    }

    return (
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* LEFT - INPUT */}
            <div className="
                p-5 rounded-2xl
                border border-[#e6e6e6] dark:border-[#222]
                bg-white dark:bg-[#171717]
                flex flex-col gap-4
            ">

                <h2 className="text-lg font-semibold">
                    Đánh giá của bạn
                </h2>

                {/* Rating */}
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <button key={i} onClick={() => setRating(i)}>
                            <Star1
                                size={26}
                                variant="Bold"
                                className={`transition ${i <= rating
                                    ? "text-yellow-400 scale-110"
                                    : "text-gray-300"
                                    }`}
                            />
                        </button>
                    ))}
                </div>

                {/* Comment */}
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Nhập cảm nhận của bạn..."
                    className="
                        p-3 rounded-xl outline-none
                        border border-[#e6e6e6] dark:border-[#222]
                        bg-white dark:bg-[#111]
                        h-28 resize-none
                    "
                />

                {/* Button */}
                <button
                    onClick={handleSubmit}
                    className="
                        py-2 rounded-xl
                        bg-black text-white
                        dark:bg-white dark:text-black
                        font-medium
                        hover:opacity-90
                    "
                >
                    Gửi đánh giá
                </button>

            </div>

            {/* RIGHT - SLIDESHOW */}
            <div className="
                relative h-[280px]
                rounded-2xl
                border border-[#e6e6e6] dark:border-[#222]
                bg-white dark:bg-[#171717]
                flex items-center justify-center
            ">

                {/* Prev */}
                <button
                    onClick={() =>
                        setIndex(index === 0 ? comments.length - 1 : index - 1)
                    }
                    className="
                        absolute left-3 z-10
                        w-8 h-8 rounded-full
                        bg-black text-white
                        dark:bg-white dark:text-black
                        flex items-center justify-center
                    "
                >
                    ←
                </button>

                {/* Card */}
                <div className="
                    w-[85%] md:w-[75%]
                    h-[200px]
                    p-5 rounded-2xl
                    bg-[#f9f9f9] dark:bg-[#111]
                    shadow-md
                    flex flex-col justify-between
                    transition-all duration-300
                ">

                    {/* Header */}
                    <div className="flex items-center gap-3">

                        <Avatar className="w-10 h-10">
                            <AvatarImage src={comments[index].avatar || "/images/avatar.png"} />
                            <AvatarFallback>
                                {comments[index].name?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>

                        <div>
                            <p className="font-semibold text-sm">
                                {comments[index].name}
                            </p>

                            <div className="flex gap-1">
                                {[...Array(comments[index].rating)].map((_, i) => (
                                    <Star1
                                        key={i}
                                        size={14}
                                        variant="Bold"
                                        className="text-yellow-400"
                                    />
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Content */}
                    <p className="
                        text-sm text-gray-600 dark:text-gray-400
                        line-clamp-4
                        break-words
                    ">
                        {comments[index].content}
                    </p>

                </div>

                {/* Next */}
                <button
                    onClick={() => setIndex((index + 1) % comments.length)}
                    className="
                        absolute right-3 z-10
                        w-8 h-8 rounded-full
                        bg-black text-white
                        dark:bg-white dark:text-black
                        flex items-center justify-center
                    "
                >
                    →
                </button>

                {/* Dots */}
                <div className="absolute bottom-3 flex gap-2">
                    {comments.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setIndex(i)}
                            className={`
                                w-2.5 h-2.5 rounded-full
                                transition
                                ${i === index
                                    ? "bg-black dark:bg-white"
                                    : "bg-gray-400"}
                            `}
                        />
                    ))}
                </div>

            </div>

        </div>
    )
}