"use client"

import { useMemo, useState } from "react"
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

const initialComments: Comment[] = [
    {
        name: "User #1023",
        content: "Khoá học rất hay, dễ hiểu và thực tế 🔥",
        rating: 5,
        avatar: ""
    },
    {
        name: "User #8472",
        content: "Giảng viên hỗ trợ rất nhiệt tình!",
        rating: 4,
        avatar: ""
    }
]

export default function Testimonial() {
    const [comments, setComments] = useState<Comment[]>(initialComments)
    const [content, setContent] = useState("")
    const [rating, setRating] = useState(5)
    const [index, setIndex] = useState(0)

    const normalizedIndex = useMemo(() => {
        if (comments.length === 0) return 0
        return Math.min(Math.max(index, 0), comments.length - 1)
    }, [comments.length, index])

    const activeComment = comments[normalizedIndex] ?? null
    const hasComments = comments.length > 0

    const handleSubmit = () => {
        const trimmedContent = content.trim()
        if (!trimmedContent) return

        const newComment: Comment = {
            name: `User #${Math.floor(1000 + Math.random() * 9000)}`,
            content: trimmedContent,
            rating,
            avatar: "/images/avatar.png"
        }

        setComments((prev) => [newComment, ...prev])
        setContent("")
        setRating(5)
        setIndex(0)
    }

    const handlePrev = () => {
        if (!hasComments) return
        setIndex((prev) =>
            prev <= 0 ? comments.length - 1 : prev - 1
        )
    }

    const handleNext = () => {
        if (!hasComments) return
        setIndex((prev) => (prev + 1) % comments.length)
    }

    return (
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section
                className="
                    p-6 rounded-3xl
                    border border-[#e6e6e6] dark:border-[#222]
                    bg-white dark:bg-[#171717]
                    flex flex-col gap-5
                "
            >
                <div className="space-y-2">
                    <p className="text-sm uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                        Đánh giá
                    </p>
                    <h2 className="text-2xl font-semibold">
                        Hãy cho chúng tôi biết cảm nhận của bạn
                    </h2>
                </div>

                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                        <button
                            key={value}
                            type="button"
                            aria-label={`Chọn ${value} sao`}
                            onClick={() => setRating(value)}
                            className="transition-transform duration-200 hover:-translate-y-1"
                        >
                            <Star1
                                size={28}
                                variant="Bold"
                                className={`transition-all ${value <= rating
                                    ? "text-yellow-400 scale-110"
                                    : "text-gray-300 dark:text-gray-500"
                                    }`}
                            />
                        </button>
                    ))}
                </div>

                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Nhập cảm nhận của bạn..."
                    rows={5}
                    maxLength={320}
                    className="
                        w-full p-4 rounded-2xl
                        border border-[#e6e6e6] dark:border-[#222]
                        bg-white dark:bg-[#111]
                        text-sm text-gray-800 dark:text-gray-100
                        outline-none resize-none
                        focus:border-black dark:focus:border-white
                    "
                />

                <button
                    type="button"
                    onClick={handleSubmit}
                    className="
                        inline-flex items-center justify-center
                        px-5 py-3 rounded-2xl
                        bg-black text-white dark:bg-white dark:text-black
                        font-medium transition hover:opacity-90
                    "
                >
                    Gửi đánh giá
                </button>
            </section>

            <section
                className="
                    relative min-h-[320px]
                    rounded-3xl
                    border border-[#e6e6e6] dark:border-[#222]
                    bg-white dark:bg-[#171717]
                    p-6
                    flex flex-col justify-between
                "
            >
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Đã có {comments.length} đánh giá
                        </p>
                        <h3 className="text-xl font-semibold">
                            Cảm nhận học viên
                        </h3>
                    </div>

                    <div className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <button
                            type="button"
                            onClick={handlePrev}
                            disabled={!hasComments}
                            aria-label="Xem đánh giá trước"
                            className="w-10 h-10 rounded-full bg-black text-white dark:bg-white dark:text-black disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            ←
                        </button>
                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={!hasComments}
                            aria-label="Xem đánh giá tiếp theo"
                            className="w-10 h-10 rounded-full bg-black text-white dark:bg-white dark:text-black disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            →
                        </button>
                    </div>
                </div>

                <div className="flex-1 rounded-[28px] bg-[#f8f8f8] dark:bg-[#111] p-6 shadow-sm">
                    {activeComment ? (
                        <>
                            <div className="flex items-center gap-4 mb-6">
                                <Avatar className="w-12 h-12">
                                    <AvatarImage
                                        src={activeComment.avatar ?? "/images/avatar.png"}
                                        alt={activeComment.name}
                                    />
                                    <AvatarFallback>
                                        {activeComment.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>

                                <div>
                                    <p className="font-semibold">{activeComment.name}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        {Array.from({ length: activeComment.rating }).map(
                                            (_, i) => (
                                                <Star1
                                                    key={i}
                                                    size={16}
                                                    variant="Bold"
                                                    className="text-yellow-400"
                                                />
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm leading-6 text-gray-600 dark:text-gray-400 break-words">
                                {activeComment.content}
                            </p>
                        </>
                    ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Chưa có đánh giá nào. Hãy để lại cảm nhận của bạn!
                        </p>
                    )}
                </div>

                <div className="mt-6 flex items-center justify-center gap-2">
                    {comments.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setIndex(i)}
                            className={`h-2.5 w-2.5 rounded-full transition ${i === normalizedIndex
                                ? "bg-black dark:bg-white"
                                : "bg-gray-300 dark:bg-gray-600"
                                }`}
                            aria-label={`Chọn đánh giá ${i + 1}`}
                        />
                    ))}
                </div>
            </section>
        </div>
    )
}