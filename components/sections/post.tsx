"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { More, Like1 } from "iconsax-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

// ===== Reactions =====
const reactions = ["👍", "❤️", "🥰", "😂", "😮", "😢", "😡"] as const
type Reaction = (typeof reactions)[number] | null

// ===== Types =====
type Post = {
    id: number
    user: string
    avatar: string
    time: string
    content: string
    image?: string
    likes: number
    comments: number
    shares: number
}

// ===== Fake Data =====
const posts: Post[] = [
    {
        id: 1,
        user: "Nguyên Cao",
        avatar: "/images/avatar.png",
        time: "2 giờ trước",
        content:
            "Hôm nay mình build được feature social cho CNcode 😎🔥, sắp launch rồi...",
        image: "/images/post1.jpg",
        likes: 120,
        comments: 20,
        shares: 5,
    },
    {
        id: 2,
        user: "Trần Dev",
        avatar: "/images/avatar.png",
        time: "5 giờ trước",
        content:
            "Tip: Khi dùng React, luôn tách component nhỏ để dễ maintain...",
        likes: 80,
        comments: 10,
        shares: 2,
    },
    {
        id: 3,
        user: "UI Designer",
        avatar: "/images/avatar.png",
        time: "1 ngày trước",
        content:
            "UI đẹp chưa đủ, UX mới giữ user lại lâu dài 🚀",
        image: "/images/post2.jpg",
        likes: 200,
        comments: 50,
        shares: 12,
    },
]

// ===== Component =====
export default function PostFeed() {
    const [open, setOpen] = useState(false)
    const [hoveredPost, setHoveredPost] = useState<number | null>(null)
    const [reaction, setReaction] = useState<Record<number, Reaction>>({})

    const openTimeout = useRef<NodeJS.Timeout | null>(null)
    const closeTimeout = useRef<NodeJS.Timeout | null>(null)

    // ===== Hover Logic =====
    const handleHover = (id: number) => {
        if (closeTimeout.current) clearTimeout(closeTimeout.current)

        openTimeout.current = setTimeout(() => {
            setHoveredPost(id)
        }, 200)
    }

    const leaveHover = () => {
        if (openTimeout.current) clearTimeout(openTimeout.current)

        closeTimeout.current = setTimeout(() => {
            setHoveredPost(null)
        }, 250)
    }

    return (
        <div className="h-[calc(100dvh-110px)] lg:h-[calc(100dvh-90px)] overflow-y-auto px-2 sm:px-4 flex justify-center bg-zinc-100 dark:bg-zinc-950">

            {/* Wrapper */}
            <div className="w-full max-w-xl lg:max-w-2xl space-y-4 py-4 pb-20">

                {/* Create Post */}
                <div className="bg-white dark:bg-zinc-900/80 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
                    <div className="flex gap-3 items-center">
                        <Avatar>
                            <AvatarImage src="/images/avatar.png" />
                            <AvatarFallback>N</AvatarFallback>
                        </Avatar>

                        <div
                            onClick={() => setOpen(true)}
                            className="flex-1 bg-zinc-100 dark:bg-zinc-800/70 px-4 py-2 rounded-full cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                        >
                            Hôm nay bạn thế nào?
                        </div>
                    </div>
                </div>

                {/* Modal */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="rounded-2xl">
                        <div className="text-lg font-semibold">
                            Tạo bài viết
                        </div>

                        <textarea
                            className="w-full mt-3 p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none bg-white dark:bg-zinc-900"
                            placeholder="Bạn đang nghĩ gì?"
                        />

                        <Button className="mt-3 w-full">
                            Đăng
                        </Button>
                    </DialogContent>
                </Dialog>

                {/* Posts */}
                {posts.map((post) => (
                    <div
                        key={post.id}
                        className="bg-white dark:bg-zinc-900/80 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-3 overflow-visible"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center">
                            <div className="flex gap-3 items-center">
                                <Avatar>
                                    <AvatarImage src={post.avatar} />
                                    <AvatarFallback>N</AvatarFallback>
                                </Avatar>

                                <div>
                                    <div className="font-semibold">
                                        {post.user}
                                    </div>
                                    <div className="text-xs text-zinc-500">
                                        {post.time}
                                    </div>
                                </div>
                            </div>

                            <More size={25} />
                        </div>

                        {/* Content */}
                        <div className="text-sm leading-relaxed">
                            {post.content}
                            <span className="text-blue-500 cursor-pointer ml-1">
                                xem thêm
                            </span>
                        </div>

                        {/* Image */}
                        {post.image && (
                            <div className="relative w-full h-60 rounded-xl overflow-hidden">
                                <Image
                                    src={post.image}
                                    alt=""
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}

                        {/* Stats */}
                        <div className="text-xs text-zinc-500 flex justify-between">
                            <span>{post.likes} lượt thích</span>
                            <span>
                                {post.comments} bình luận · {post.shares} chia sẻ
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-around border-t border-zinc-200 dark:border-zinc-800 pt-2 text-sm">

                            {/* Like */}
                            <div
                                className="relative w-fit"
                                onMouseEnter={() => handleHover(post.id)}
                                onMouseLeave={leaveHover}
                            >
                                <button className="flex items-center gap-1 hover:text-blue-500 transition">
                                    <Like1 size={18} />
                                    {reaction[post.id] || "Like"}
                                </button>

                                {/* Reaction Box */}
                                {hoveredPost === post.id && (
                                    <div
                                        className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-xl rounded-full px-2 py-1 flex gap-2 animate-in fade-in zoom-in-95 transform-gpu will-change-transform"
                                        onMouseEnter={() => {
                                            if (closeTimeout.current) clearTimeout(closeTimeout.current)
                                        }}
                                        onMouseLeave={() => {
                                            closeTimeout.current = setTimeout(() => {
                                                setHoveredPost(null)
                                            }, 200)
                                        }}
                                    >
                                        {reactions.map((r) => (
                                            <span
                                                key={r}
                                                className="text-xl cursor-pointer hover:scale-125 active:scale-110 transition"
                                                onClick={() =>
                                                    setReaction((prev) => ({
                                                        ...prev,
                                                        [post.id]: r,
                                                    }))
                                                }
                                            >
                                                {r}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Comment */}
                            <button className="hover:text-blue-500 transition">
                                💬 {post.comments}
                            </button>

                            {/* Share */}
                            <button className="hover:text-blue-500 transition">
                                ↗️ {post.shares}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}