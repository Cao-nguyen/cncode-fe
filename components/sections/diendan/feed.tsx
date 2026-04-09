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
    "nhbLYQc1-2o",
    "w5kV72TQPIM",
    "7aP4NW_5DHc",
    "s_WRsV7_CwA",
]

export default function Feed() {
    const containerRef = useRef<HTMLDivElement>(null)
    const iframeRefs = useRef<HTMLIFrameElement[]>([])

    const [currentIndex, setCurrentIndex] = useState(0)
    const [isMuted, setIsMuted] = useState(true)
    const [hasInteracted, setHasInteracted] = useState(false)
    const [showIconIndex, setShowIconIndex] = useState<number | null>(null)
    const [isPlaying, setIsPlaying] = useState(true)

    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768)
        check()
        window.addEventListener("resize", check)
        return () => window.removeEventListener("resize", check)
    }, [])

    const touchStartY = useRef(0)
    const isScrolling = useRef(false)

    useEffect(() => {
        iframeRefs.current.forEach((iframe, index) => {
            if (!iframe) return

            iframe.contentWindow?.postMessage(
                JSON.stringify({
                    event: "command",
                    func: index === currentIndex ? "playVideo" : "pauseVideo",
                    args: [],
                }),
                "*"
            )

            if (index === currentIndex) {
                iframe.contentWindow?.postMessage(
                    JSON.stringify({
                        event: "command",
                        func: "seekTo",
                        args: [0, true],
                    }),
                    "*"
                )
            }

            if (hasInteracted) {
                iframe.contentWindow?.postMessage(
                    JSON.stringify({ event: "command", func: "unMute", args: [] }),
                    "*"
                )
            }
        })
    }, [currentIndex, hasInteracted])

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartY.current = e.touches[0].clientY
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
        const diff = e.changedTouches[0].clientY - touchStartY.current
        if (Math.abs(diff) < 20) return

        if (diff < 0 && currentIndex < videos.length - 1) setCurrentIndex(currentIndex + 1)
        else if (diff > 0 && currentIndex > 0) setCurrentIndex(currentIndex - 1)
    }

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault()
        if (isScrolling.current) return

        isScrolling.current = true

        if (e.deltaY > 0 && currentIndex < videos.length - 1) setCurrentIndex(currentIndex + 1)
        else if (e.deltaY < 0 && currentIndex > 0) setCurrentIndex(currentIndex - 1)

        setTimeout(() => (isScrolling.current = false), 400)
    }

    const toggleVideo = (index: number) => {
        const iframe = iframeRefs.current[index]
        if (!iframe) return

        if (!hasInteracted) {
            setHasInteracted(true)
            setIsMuted(false)
            iframeRefs.current.forEach((frame) => {
                frame?.contentWindow?.postMessage(
                    JSON.stringify({ event: "command", func: "unMute", args: [] }),
                    "*"
                )
            })
        }

        const action = isPlaying ? "pauseVideo" : "playVideo"
        iframe.contentWindow?.postMessage(JSON.stringify({ event: "command", func: action, args: [] }), "*")
        setIsPlaying(!isPlaying)

        setShowIconIndex(index)
        setTimeout(() => setShowIconIndex(null), 500)
    }

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation()

        if (!hasInteracted) {
            setHasInteracted(true)
            setIsMuted(false)
            iframeRefs.current.forEach((iframe) => {
                iframe?.contentWindow?.postMessage(
                    JSON.stringify({ event: "command", func: "unMute", args: [] }),
                    "*"
                )
            })
            return
        }

        const newMuted = !isMuted
        setIsMuted(newMuted)

        const iframe = iframeRefs.current[currentIndex]
        if (!iframe) return

        iframe.contentWindow?.postMessage(
            JSON.stringify({ event: "command", func: newMuted ? "mute" : "unMute", args: [] }),
            "*"
        )
    }

    return (
        <div
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            className="w-full h-[calc(100dvh-110px)] lg:h-[calc(100dvh-90px)] overflow-hidden bg-white dark:bg-black touch-none"
        >
            <div
                className="w-full h-full transition-transform duration-300"
                style={{ transform: `translateY(-${currentIndex * 100}%)` }}
            >
                {videos.map((id, index) => (
                    <div key={index} className="w-full h-full flex items-center justify-center relative">
                        <div className="w-full h-full md:w-90 md:h-160 overflow-hidden relative">
                            <iframe
                                ref={(el) => {
                                    if (el) iframeRefs.current[index] = el
                                }}
                                className="absolute top-1/2 left-1/2 w-screen h-screen -translate-x-1/2 -translate-y-1/2 pointer-events-none object-cover"
                                style={
                                    isMobile
                                        ? {
                                            minWidth: "100%",
                                            minHeight: "100%",
                                        }
                                        : {
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "contain"
                                        }
                                }
                                src={`https://www.youtube.com/embed/${id}?enablejsapi=1&autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&playsinline=1&loop=1&playlist=${id}`}
                                allow="autoplay"
                            />

                            <div className="absolute inset-0 z-10" onClick={() => toggleVideo(index)} />

                            <div className="absolute top-3 right-3 z-20">
                                <button onClick={toggleMute} className="bg-black/50 p-2 rounded-full text-white">
                                    {isMuted ? <VolumeMute size="20" /> : <VolumeHigh size="20" />}
                                </button>
                            </div>

                            <div className="absolute right-3 bottom-9 md:right-3 md:bottom-3 flex flex-col items-center gap-4 text-white filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                <div className="relative">
                                    <Image
                                        width={40}
                                        height={40}
                                        src="https://i.pravatar.cc/40"
                                        alt=""
                                        className="w-10 h-10 rounded-full border-2 border-white"
                                    />
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-500 w-5 h-5 flex items-center justify-center rounded-full text-xs">
                                        +
                                    </div>
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

                            <div className="absolute bottom-9 left-3 md:left-3 md:bottom-3 text-white max-w-[70%] filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                                <p className="font-bold">Lý Cao Nguyên</p>
                                <p className="text-sm">Demo video TikTok clone #cncode #fyp #learncode</p>
                            </div>
                        </div>

                        {showIconIndex === index && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                                <div className="bg-black/50 text-white p-4 rounded-full">
                                    {isPlaying ? <Pause size="32" /> : <Play size="32" />}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}