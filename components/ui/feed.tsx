"use client"

import { useEffect, useRef, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    Bookmark,
    Heart,
    MessageCircle,
    MoreHorizontal,
    Plus,
    Play,
    Pause,
    Share2,
    Volume2,
    VolumeX,
} from "lucide-react"

type Post = {
    id: string
    src: string
    caption?: string
}

const posts: Post[] = [
    { id: "1", src: "/video/video_one.mp4", caption: "Video 1" },
    { id: "2", src: "/video/video_two.mp4", caption: "Video 2" },
    { id: "3", src: "/video/video_three.mp4", caption: "Video 3" },
    { id: "4", src: "/video/video_four.mp4", caption: "Video 4" },
    { id: "5", src: "/video/video_five.mp4", caption: "Video 5" },
    { id: "6", src: "/video/video_one.mp4", caption: "Video 6" },
    { id: "7", src: "/video/video_two.mp4", caption: "Video 7" },
    { id: "8", src: "/video/video_three.mp4", caption: "Video 8" },
    { id: "9", src: "/video/video_four.mp4", caption: "Video 9" },
    { id: "10", src: "/video/video_five.mp4", caption: "Video 10" },
]

type PlaybackHint = { index: number; type: "play" | "pause" } | null

export default function Feed() {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
    const playbackTimeout = useRef<number | null>(null)
    const [active, setActive] = useState(0)
    const [mutedStates, setMutedStates] = useState<boolean[]>(() =>
        posts.map(() => false)
    )
    const [playbackHint, setPlaybackHint] = useState<PlaybackHint>(null)

    useEffect(() => {
        if (!containerRef.current) return

        const observer = new IntersectionObserver(
            (entries) => {
                const best = entries
                    .filter((entry) => entry.intersectionRatio >= 0.6)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

                if (!best) return

                const index = Number(best.target.getAttribute("data-index"))
                setActive(index)
            },
            {
                root: containerRef.current,
                threshold: [0.25, 0.5, 0.6, 0.75, 1],
            }
        )

        videoRefs.current.forEach((el) => {
            if (el) observer.observe(el)
        })

        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        videoRefs.current.forEach((v, i) => {
            if (!v) return
            if (i === active) {
                v.currentTime = 0
                v.play().catch(() => { })
            } else {
                v.pause()
            }
        })
    }, [active])

    useEffect(() => {
        return () => {
            if (playbackTimeout.current) {
                window.clearTimeout(playbackTimeout.current)
            }
        }
    }, [])

    const showPlaybackHint = (i: number, type: "play" | "pause") => {
        setPlaybackHint({ index: i, type })
        if (playbackTimeout.current) {
            window.clearTimeout(playbackTimeout.current)
        }
        playbackTimeout.current = window.setTimeout(() => {
            setPlaybackHint(null)
        }, 200)
    }

    const toggleSound = (i: number) => {
        const video = videoRefs.current[i]
        if (!video) return
        const nextMuted = !mutedStates[i]
        video.muted = nextMuted
        setMutedStates((current) => {
            const next = [...current]
            next[i] = nextMuted
            return next
        })
    }

    const togglePlayback = (i: number) => {
        const video = videoRefs.current[i]
        if (!video) return
        if (video.paused) {
            video.play().catch(() => { })
            showPlaybackHint(i, "play")
        } else {
            video.pause()
            showPlaybackHint(i, "pause")
        }
    }

    return (
        <div
            ref={containerRef}
            className="h-full overflow-y-auto snap-y snap-mandatory bg-black scrollbar-none"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
            {posts.map((post, i) => (
                <div
                    key={post.id}
                    className="h-full w-full snap-start flex items-center justify-center"
                >
                    <div className="relative w-[400px] h-[640px]">
                        <video
                            ref={(el) => {
                                videoRefs.current[i] = el
                            }}
                            data-index={i}
                            src={post.src}
                            loop
                            muted={mutedStates[i]}
                            playsInline
                            className="rounded-[10px] h-full w-full object-cover"
                            onClick={() => togglePlayback(i)}
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-[10px] pointer-events-none" />

                        {playbackHint?.index === i ? (
                            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                                {playbackHint.type === "play" ? (
                                    <Play size={48} className="text-white/90" />
                                ) : (
                                    <Pause size={48} className="text-white/90" />
                                )}
                            </div>
                        ) : null}

                        <div className="absolute bottom-6 left-4 text-white z-10 max-w-[70%]">
                            {post.caption}
                        </div>

                        <div className="absolute right-4 bottom-0 flex flex-col items-center gap-4 text-white z-10">
                            <div className="relative">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-black">
                                    <Plus size={12} />
                                </div>
                            </div>

                            <button className="rounded-full bg-black/50 p-3">
                                <Heart size={22} />
                            </button>

                            <button className="rounded-full bg-black/50 p-3">
                                <MessageCircle size={22} />
                            </button>

                            <button className="rounded-full bg-black/50 p-3">
                                <Bookmark size={22} />
                            </button>

                            <button className="rounded-full bg-black/50 p-3">
                                <Share2 size={22} />
                            </button>

                            <button
                                className="rounded-full bg-black/50 p-3"
                                onClick={() => toggleSound(i)}
                            >
                                {mutedStates[i] ? <VolumeX size={22} /> : <Volume2 size={22} />}
                            </button>

                            <button className="rounded-full bg-black/50 p-3">
                                <MoreHorizontal size={22} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}