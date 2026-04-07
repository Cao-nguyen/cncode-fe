"use client"

import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import {
    VolumeHigh,
    VolumeMute,
    Pause,
    Play,
    Heart,
    Message,
    Bookmark,
    Send2,
} from "iconsax-react"

const videos = [
    "https://res.cloudinary.com/dckuqnehz/video/upload/v1775562882/video_four_dlgv6k.mp4",
    "https://res.cloudinary.com/dckuqnehz/video/upload/v1775562867/video_two_dljlqd.mp4",
    "https://res.cloudinary.com/dckuqnehz/video/upload/v1775562863/video_five_r6krad.mp4",
    "https://res.cloudinary.com/dckuqnehz/video/upload/v1775562863/video_one_a4uxpa.mp4",
    "https://res.cloudinary.com/dckuqnehz/video/upload/v1775562862/video_three_tl5ed8.mp4",
    "https://res.cloudinary.com/dckuqnehz/video/upload/v1775562882/video_four_dlgv6k.mp4",
    "https://res.cloudinary.com/dckuqnehz/video/upload/v1775562867/video_two_dljlqd.mp4",
    "https://res.cloudinary.com/dckuqnehz/video/upload/v1775562863/video_five_r6krad.mp4",
    "https://res.cloudinary.com/dckuqnehz/video/upload/v1775562863/video_one_a4uxpa.mp4",
    "https://res.cloudinary.com/dckuqnehz/video/upload/v1775562862/video_three_tl5ed8.mp4"
]

export default function Feed() {
    const containerRef = useRef<HTMLDivElement>(null)
    const videoRefs = useRef<HTMLVideoElement[]>([])

    const [currentIndex, setCurrentIndex] = useState(0)
    const [playingIndex, setPlayingIndex] = useState<number | null>(0)
    const [isMuted, setIsMuted] = useState(false)
    const [showIconIndex, setShowIconIndex] = useState<number | null>(null)

    const touchStartY = useRef(0)
    const isScrolling = useRef(false)

    // 🎯 Auto play (FIX: bỏ isMuted)
    useEffect(() => {
        videoRefs.current.forEach((video, index) => {
            if (!video) return

            if (index === currentIndex) {
                video.currentTime = 0
                video.play().catch(() => { })
                setPlayingIndex(index)
            } else {
                video.pause()
            }
        })
    }, [currentIndex])

    // 🔊 FIX: chỉ update âm thanh
    useEffect(() => {
        videoRefs.current.forEach((video) => {
            if (video) {
                video.muted = isMuted
            }
        })
    }, [isMuted])

    // 🔥 chặn pull-to-refresh
    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        const handler = (e: TouchEvent) => {
            e.preventDefault()
        }

        el.addEventListener("touchmove", handler, { passive: false })
        return () => el.removeEventListener("touchmove", handler)
    }, [])

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartY.current = e.touches[0].clientY
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
        const endY = e.changedTouches[0].clientY
        const diff = endY - touchStartY.current

        if (Math.abs(diff) < 20) return

        if (diff < 0 && currentIndex < videos.length - 1) {
            setCurrentIndex((prev) => prev + 1)
        } else if (diff > 0 && currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1)
        }
    }

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault()
        if (isScrolling.current) return

        const delta = e.deltaY
        if (Math.abs(delta) < 10) return

        isScrolling.current = true

        if (delta > 0 && currentIndex < videos.length - 1) {
            setCurrentIndex((prev) => prev + 1)
        } else if (delta < 0 && currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1)
        }

        setTimeout(() => {
            isScrolling.current = false
        }, 400)
    }

    const toggleVideo = (index: number) => {
        const video = videoRefs.current[index]
        if (!video) return

        setShowIconIndex(index)
        setTimeout(() => setShowIconIndex(null), 500)

        if (video.paused) {
            video.play()
            setPlayingIndex(index)
        } else {
            video.pause()
            setPlayingIndex(null)
        }
    }

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsMuted((prev) => !prev)
    }

    return (
        <div
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            className="w-full h-[calc(100dvh-80px)] lg:h-[calc(100dvh-60px)] overflow-hidden bg-[#E5E5E5] dark:bg-[#1a1a1a] touch-none"
        >
            <div
                className="w-full h-full transition-transform duration-300 ease-out"
                style={{ transform: `translateY(-${currentIndex * 100}%)` }}
            >
                {videos.map((src, index) => (
                    <div key={index} className="w-full h-full flex items-center justify-center relative">

                        <div className="w-full h-full md:w-[360px] md:h-[640px] md:rounded-[12px] overflow-hidden relative">

                            <video
                                ref={(el) => { if (el) videoRefs.current[index] = el }}
                                src={src}
                                className="w-full h-full object-cover"
                                loop
                                playsInline
                                muted={isMuted}
                                onClick={() => toggleVideo(index)}
                            />

                            {/* 🔊 Sound */}
                            <div className="absolute top-4 right-4 lg:left-4 lg:right-auto z-10">
                                <button onClick={toggleMute} className="bg-black/50 p-2 rounded-full text-white">
                                    {isMuted ? <VolumeMute size="20" /> : <VolumeHigh size="20" />}
                                </button>
                            </div>

                            {/* 👉 Sidebar GIỮ NGUYÊN */}
                            <div className="absolute right-3 bottom-10 md:bottom-4 flex flex-col items-center gap-4 text-white">
                                <div className="relative">
                                    <Image width={40} height={40} src="https://i.pravatar.cc/40" alt="" className="w-10 h-10 rounded-full border-2 border-white" />
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-500 w-5 h-5 flex items-center justify-center rounded-full text-xs">+</div>
                                </div>

                                <button className="flex flex-col items-center">
                                    <Heart variant="Bold" size="28" />
                                    <span className="text-[10px] font-bold">1.2k</span>
                                </button>

                                <button className="flex flex-col items-center">
                                    <Message variant="Bold" size="28" />
                                    <span className="text-[10px] font-bold">Bóc tem</span>
                                </button>

                                <button className="flex flex-col items-center">
                                    <Bookmark variant="Bold" size="28" />
                                    <span className="text-[10px] font-bold">3K</span>
                                </button>

                                <button className="flex flex-col items-center">
                                    <Send2 variant="Bold" size="28" />
                                    <span className="text-[10px] font-bold">2.0K</span>
                                </button>
                            </div>

                            {/* 👉 Info GIỮ NGUYÊN */}
                            <div className="absolute bottom-10 left-3 md:bottom-4 text-white max-w-[70%]">
                                <p className="font-bold">@cncode_user</p>
                                <p className="text-sm">Demo video TikTok clone #cncode #fyp #learncode</p>
                            </div>

                        </div>

                        {showIconIndex === index && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="bg-black/50 text-white p-4 rounded-full">
                                    {playingIndex === index ? <Pause size="32" /> : <Play size="32" />}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}