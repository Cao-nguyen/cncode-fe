"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { More, Like1, MessageText1, Send2 } from "iconsax-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

// ===== Reaction =====
const reactions = [
    { key: "like", icon: "/icons/like.svg" },
    { key: "love", icon: "/icons/love.svg" },
    { key: "care", icon: "/icons/care.svg" },
    { key: "haha", icon: "/icons/haha.svg" },
    { key: "wow", icon: "/icons/wow.svg" },
    { key: "sad", icon: "/icons/sad.svg" },
    { key: "angry", icon: "/icons/angry.svg" },
] as const

type ReactionKey = (typeof reactions)[number]["key"] | null

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
            "Hôm nay mình build được feature social cho CNcode 😎🔥... Nội dung dài test để vượt quá 2 dòng xem có hoạt động không...",
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
        content: "Tip: Khi dùng React, luôn tách component nhỏ...",
        likes: 80,
        comments: 10,
        shares: 2,
    },
]

// ===== Component =====
export default function PostFeed() {
    const [open, setOpen] = useState(false)
    const [hoveredPost, setHoveredPost] = useState<number | null>(null)
    const [reaction, setReaction] = useState<Record<number, ReactionKey>>({})
    const [expanded, setExpanded] = useState<Record<number, boolean>>({})

    const openTimeout = useRef<NodeJS.Timeout | null>(null)

    return (
        <div className="h-[calc(100dvh-110px)] lg:h-[calc(100dvh-90px)] overflow-y-auto px-2 sm:px-4 flex justify-center bg-zinc-100 dark:bg-zinc-950">

            <div className="w-full max-w-xl lg:max-w-2xl space-y-4 pt-[20px] pb-[40px]">

                {/* Create Post */}
                <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-4 shadow-sm">
                    <div className="flex gap-3 items-center">
                        <Avatar>
                            <AvatarImage src="/images/avatar.png" />
                            <AvatarFallback>N</AvatarFallback>
                        </Avatar>

                        <div
                            onClick={() => setOpen(true)}
                            className="flex-1 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-full cursor-pointer"
                        >
                            Hôm nay bạn thế nào?
                        </div>
                    </div>
                </div>

                {/* Modal */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent>
                        <textarea className="w-full p-3 border rounded-lg" />
                        <Button className="mt-3 w-full">Đăng</Button>
                    </DialogContent>
                </Dialog>

                {/* Posts */}
                {posts.map((post) => {
                    const isExpanded = expanded[post.id]

                    return (
                        <div
                            key={post.id}
                            className="bg-white dark:bg-zinc-900 border rounded-2xl p-4 shadow-sm space-y-3 overflow-visible"
                        >

                            {/* Header */}
                            <div className="flex justify-between">
                                <div className="flex gap-3">
                                    <Avatar>
                                        <AvatarImage src={post.avatar} />
                                        <AvatarFallback>N</AvatarFallback>
                                    </Avatar>

                                    <div>
                                        <div className="font-semibold">{post.user}</div>
                                        <div className="text-xs text-zinc-500">{post.time}</div>
                                    </div>
                                </div>

                                <More size={22} variant="Outline" />
                            </div>

                            {/* Content */}
                            <div className="text-sm">
                                <div className={`${!isExpanded ? "line-clamp-2" : ""}`}>
                                    {post.content}
                                </div>

                                {post.content.length > 80 && (
                                    <span
                                        onClick={() =>
                                            setExpanded((prev) => ({
                                                ...prev,
                                                [post.id]: !prev[post.id],
                                            }))
                                        }
                                        className="text-blue-500 cursor-pointer"
                                    >
                                        {isExpanded ? "Thu gọn" : "xem thêm"}
                                    </span>
                                )}
                            </div>

                            {/* Image */}
                            {post.image && (
                                <div className="relative w-full h-60 rounded-xl overflow-hidden">
                                    <Image src={post.image} alt="" fill className="object-cover" />
                                </div>
                            )}

                            {/* Stats */}
                            <div className="text-xs text-zinc-500 flex justify-between">
                                <span>{post.likes} lượt thích</span>
                                <span>{post.comments} bình luận · {post.shares} chia sẻ</span>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-around border-t pt-2">

                                {/* LIKE */}
                                <div
                                    className="relative"
                                    onMouseEnter={() => setHoveredPost(post.id)}
                                    onMouseLeave={() => setHoveredPost(null)}
                                    onTouchStart={() => {
                                        openTimeout.current = setTimeout(() => {
                                            setHoveredPost(post.id)
                                        }, 300)
                                    }}
                                    onTouchEnd={() => {
                                        if (openTimeout.current) clearTimeout(openTimeout.current)
                                    }}
                                >
                                    <button className="flex items-center gap-2">
                                        <Like1 size={22} variant="Bold" />
                                        Like
                                    </button>

                                    {hoveredPost === post.id && (
                                        <div
                                            className="
                                                absolute 
                                                bottom-[120%]
                                                left-1/2 -translate-x-1/2
                                                bg-white dark:bg-zinc-900
                                                border rounded-full
                                                px-3 py-2
                                                flex gap-2
                                                shadow-xl z-[999]
                                            "
                                            onTouchMove={(e) => {
                                                const touch = e.touches[0]
                                                const el = document.elementFromPoint(
                                                    touch.clientX,
                                                    touch.clientY
                                                ) as HTMLElement

                                                if (el?.dataset?.key) {
                                                    setReaction((prev) => ({
                                                        ...prev,
                                                        [post.id]: el.dataset.key as ReactionKey,
                                                    }))
                                                }
                                            }}
                                            onTouchEnd={() => setHoveredPost(null)}
                                        >
                                            {reactions.map((r) => {
                                                const active = reaction[post.id] === r.key

                                                return (
                                                    <Image
                                                        width={100}
                                                        height={100}
                                                        alt=""
                                                        key={r.key}
                                                        data-key={r.key}
                                                        src={r.icon}
                                                        className={`
                                                            w-8 h-8 object-contain
                                                            transition-all duration-150
                                                            ${active
                                                                ? "scale-150 -translate-y-3"
                                                                : "hover:scale-125"}
                                                        `}
                                                    />
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Comment */}
                                <button className="flex items-center gap-2">
                                    <MessageText1 size={22} variant="Bold" />
                                    {post.comments}
                                </button>

                                {/* Share */}
                                <button className="flex items-center gap-2">
                                    <Send2 size={22} variant="Bold" />
                                    {post.shares}
                                </button>
                            </div>
                        </div>
                    )
                })}

                {/* End */}
                <div className="text-center text-sm text-zinc-500 pt-4 pb-10">
                    Không còn bài đăng nào khác
                </div>
            </div>
        </div>
    )
}