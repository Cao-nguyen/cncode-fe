"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Ellipsis, ThumbsUp, MessageSquareMore, Send } from "lucide-react"
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

const posts: Post[] = [
    {
        id: 1,
        user: "Nguyên Cao",
        avatar: "/images/avatar.png",
        time: "2 giờ trước",
        content: "Hôm nay mình build được feature social cho CNcode 😎🔥... Nội dung dài test để vượt quá 2 dòng xem có hoạt động không...",
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

export default function PostFeed() {
    const [hoveredPost, setHoveredPost] = useState<number | null>(null)
    const [hoverIndex, setHoverIndex] = useState<number | null>(null)
    const [reaction, setReaction] = useState<Record<number, ReactionKey>>({})
    const [popupPos, setPopupPos] = useState({ x: 0, y: 0 })
    const [lockScroll, setLockScroll] = useState(false)

    const openTimeout = useRef<NodeJS.Timeout | null>(null)
    const closeTimeout = useRef<NodeJS.Timeout | null>(null)
    const isLongPress = useRef(false)
    const popupRef = useRef<HTMLDivElement | null>(null)

    const [open, setOpen] = useState(false)
    const [expanded, setExpanded] = useState<Record<number, boolean>>({})

    // ===== FIX SCROLL =====
    useEffect(() => {
        document.body.style.overflow = lockScroll ? "hidden" : ""
    }, [lockScroll])

    // ===== CHẶN CHUỘT PHẢI TOÀN TRANG =====
    useEffect(() => {
        const preventContext = (e: MouseEvent) => e.preventDefault()
        document.addEventListener("contextmenu", preventContext)

        return () => {
            document.removeEventListener("contextmenu", preventContext)
        }
    }, [])

    // ===== MOBILE =====
    useEffect(() => {
        const handleMove = (e: TouchEvent) => {
            if (!isLongPress.current || !popupRef.current) return

            e.preventDefault()

            const touch = e.touches[0]
            const rect = popupRef.current.getBoundingClientRect()

            const x = touch.clientX - rect.left
            const itemWidth = rect.width / reactions.length
            const index = Math.floor(x / itemWidth)

            setHoverIndex(Math.max(0, Math.min(reactions.length - 1, index)))
        }

        const handleEnd = () => {
            if (isLongPress.current && hoverIndex !== null && hoveredPost !== null) {
                setReaction(prev => ({
                    ...prev,
                    [hoveredPost]: reactions[hoverIndex].key
                }))
            }

            setLockScroll(false)
            isLongPress.current = false
            setHoveredPost(null)
            setHoverIndex(null)
        }

        window.addEventListener("touchmove", handleMove, { passive: false })
        window.addEventListener("touchend", handleEnd)

        return () => {
            window.removeEventListener("touchmove", handleMove)
            window.removeEventListener("touchend", handleEnd)
        }
    }, [hoverIndex, hoveredPost])

    return (
        <div className="h-[calc(100dvh-110px)] lg:h-[calc(100dvh-90px)] overflow-y-auto px-2 sm:px-4 flex justify-center bg-zinc-100 dark:bg-zinc-950">

            <div className="w-full max-w-xl lg:max-w-2xl space-y-4 pt-5 pb-10">

                {/* CREATE POST */}
                <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-4 shadow-sm">
                    <div className="flex gap-3 items-center">
                        <Avatar>
                            <AvatarImage src="/images/avatar.png" alt="Avatar người dùng" />
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

                {/* MODAL */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent>
                        <textarea
                            className="w-full p-3 border rounded-lg"
                            placeholder="Bạn đang nghĩ gì?"
                        />
                        <Button className="mt-3 w-full">Đăng</Button>
                    </DialogContent>
                </Dialog>

                {/* POSTS */}
                {posts.map((post) => {
                    const isExpanded = expanded[post.id]

                    return (
                        <div key={post.id} className="bg-white dark:bg-zinc-900 border rounded-2xl p-4 shadow-sm space-y-3">

                            {/* Header */}
                            <div className="flex justify-between">
                                <div className="flex gap-3">
                                    <Avatar>
                                        <AvatarImage src={post.avatar} alt={`Avatar của ${post.user}`} />
                                        <AvatarFallback>N</AvatarFallback>
                                    </Avatar>

                                    <div>
                                        <div className="font-semibold">{post.user}</div>
                                        <div className="text-xs text-zinc-500">{post.time}</div>
                                    </div>
                                </div>

                                <Ellipsis size={20} />
                            </div>

                            {/* Content */}
                            <div className="text-sm">
                                <div className={`${!isExpanded ? "line-clamp-2" : ""}`}>
                                    {post.content}
                                </div>

                                {post.content.length > 80 && (
                                    <span
                                        onClick={() =>
                                            setExpanded(prev => ({
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
                                    <Image
                                        src={post.image}
                                        alt={`Bài đăng của ${post.user}`}
                                        fill
                                        className="object-cover"
                                    />
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
                                    onMouseEnter={(e) => {
                                        if (closeTimeout.current) clearTimeout(closeTimeout.current)

                                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()

                                        openTimeout.current = setTimeout(() => {
                                            setHoveredPost(post.id)
                                            setPopupPos({
                                                x: rect.left + rect.width / 2,
                                                y: rect.top
                                            })
                                        }, 200)
                                    }}
                                    onMouseLeave={() => {
                                        closeTimeout.current = setTimeout(() => {
                                            setHoveredPost(null)
                                            setHoverIndex(null)
                                        }, 200)
                                    }}
                                    onMouseMove={(e) => {
                                        if (!popupRef.current) return

                                        const rect = popupRef.current.getBoundingClientRect()
                                        const x = e.clientX - rect.left
                                        const itemWidth = rect.width / reactions.length
                                        const index = Math.floor(x / itemWidth)

                                        setHoverIndex(Math.max(0, Math.min(reactions.length - 1, index)))
                                    }}
                                    onTouchStart={(e) => {
                                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()

                                        isLongPress.current = false

                                        openTimeout.current = setTimeout(() => {
                                            isLongPress.current = true
                                            setLockScroll(true)

                                            setHoveredPost(post.id)
                                            setPopupPos({
                                                x: rect.left + rect.width / 2,
                                                y: rect.top
                                            })
                                        }, 250)
                                    }}
                                    onTouchEnd={() => {
                                        if (openTimeout.current) clearTimeout(openTimeout.current)
                                    }}
                                >
                                    <button className="flex items-center gap-2">
                                        {reaction[post.id] ? (
                                            <Image
                                                src={reactions.find(r => r.key === reaction[post.id])?.icon || ""}
                                                alt={reaction[post.id] || ""}
                                                width={20}
                                                height={20}
                                                draggable={false}
                                                onContextMenu={(e) => e.preventDefault()}
                                                className="no-download"
                                            />
                                        ) : (
                                            <ThumbsUp size={22} />
                                        )}
                                        Like
                                    </button>

                                    {hoveredPost === post.id && (
                                        <div
                                            ref={popupRef}
                                            style={{
                                                left: popupPos.x,
                                                top: popupPos.y - 10,
                                                transform: "translateX(-20%) translateY(-90%)",
                                            }}
                                            className="fixed z-999999 bg-white rounded-full px-2 py-1.5 flex gap-2 shadow-2xl border"
                                        >
                                            {reactions.map((r, index) => {
                                                const active = hoverIndex === index

                                                return (
                                                    <Image
                                                        key={r.key}
                                                        src={r.icon}
                                                        alt={r.key}
                                                        width={32}
                                                        height={32}
                                                        draggable={false}
                                                        onContextMenu={(e) => e.preventDefault()}
                                                        className={`no-download ${active ? "scale-150 -translate-y-4" : ""}`}
                                                        onMouseDown={(e) => {
                                                            e.preventDefault()
                                                            setReaction(prev => ({
                                                                ...prev,
                                                                [post.id]: r.key
                                                            }))
                                                            setHoveredPost(null)
                                                        }}
                                                    />
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Comment */}
                                <button className="flex items-center gap-2">
                                    <MessageSquareMore size={22} />
                                    {post.comments}
                                </button>

                                {/* Share */}
                                <button className="flex items-center gap-2">
                                    <Send size={22} />
                                    {post.shares}
                                </button>
                            </div>
                        </div>
                    )
                })}

                {/* FOOTER */}
                <div className="text-center text-sm text-zinc-500 pt-4 pb-10">
                    Không còn bài đăng nào khác
                </div>
            </div>
        </div>
    )
}