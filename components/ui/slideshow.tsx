"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function Slideshow() {
    const slides = [
        { img: "/images/images1.jpg", title: "Khóa học Fullstack", link: "/course" },
        { img: "/images/image2.jpg", title: "Diễn đàn CNcode", link: "/forum" },
        { img: "/images/images3.jpg", title: "Cộng đồng lập trình", link: "/community" },
        { img: "/images/images3.jpg", title: "Cộng đồng lập trình", link: "/community" },
    ]

    const [index, setIndex] = useState(0)
    const [paused, setPaused] = useState(false)
    const resumeRef = useRef<NodeJS.Timeout | null>(null)

    const next = () => setIndex((i) => (i + 1) % slides.length)
    const prev = () => setIndex((i) => (i === 0 ? slides.length - 1 : i - 1))

    const handleManual = (fn: () => void) => {
        fn()
        setPaused(true)

        if (resumeRef.current) clearTimeout(resumeRef.current)

        resumeRef.current = setTimeout(() => {
            setPaused(false)
        }, 5000)
    }

    useEffect(() => {
        if (paused) return

        const timer = setInterval(() => {
            setIndex((i) => (i + 1) % slides.length)
        }, 3000)

        return () => clearInterval(timer)
    }, [paused, slides.length])

    return (
        <div className="relative w-full overflow-hidden">

            <div className="relative h-55 md:h-80 lg:h-105">

                {slides.map((slide, i) => (
                    <div
                        key={i}
                        className={`absolute inset-0 transition-opacity duration-700 ${i === index
                            ? "opacity-100 pointer-events-auto"
                            : "opacity-0 pointer-events-none"
                            }`}
                    >
                        <div className="group relative w-full h-full">

                            <Image
                                src={slide.img}
                                alt={slide.title}
                                fill
                                className="object-cover"
                                priority={i === 0}
                            />

                            {/* overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">

                                <Link
                                    href={slide.link}
                                    className="text-white text-xl md:text-2xl font-semibold"
                                >
                                    {slide.title}
                                </Link>

                            </div>

                        </div>
                    </div>
                ))}

                {/* Prev */}
                <button
                    onClick={() => handleManual(prev)}
                    className="absolute z-20 left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 shadow hover:bg-white"
                >
                    <ChevronLeft />
                </button>

                {/* Next */}
                <button
                    onClick={() => handleManual(next)}
                    className="absolute z-20 right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 shadow hover:bg-white"
                >
                    <ChevronRight />
                </button>

                {/* dots */}
                <div className="absolute z-20 bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => handleManual(() => setIndex(i))}
                            className={`w-3 h-3 rounded-full transition ${i === index ? "bg-white" : "bg-white/50"
                                }`}
                        />
                    ))}
                </div>

            </div>
        </div>
    )
}