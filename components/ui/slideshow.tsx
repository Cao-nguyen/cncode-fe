"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft2, ArrowRight2 } from "iconsax-react"

export default function Slideshow() {

    const slides = [
        { img: "/images/images1.jpg", link: "/course" },
        { img: "/images/image2.jpg", link: "/forum" },
        { img: "/images/images3.jpg", link: "/community" },
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

            {/* height responsive */}
            <div className="relative h-45 sm:h-60 md:h-80 lg:h-105">

                {slides.map((slide, i) => (
                    <div
                        key={i}
                        className={`absolute inset-0 transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0 pointer-events-none"
                            }`}
                    >
                        <Link
                            href={slide.link}
                            className="block relative w-full h-full cursor-pointer"
                        >
                            <Image
                                src={slide.img}
                                alt="slide"
                                fill
                                className="object-cover transition-transform duration-500 hover:scale-[1.02]"
                                priority={i === 0}
                            />
                        </Link>
                    </div>
                ))}

                {/* Prev */}
                <button
                    onClick={() => handleManual(prev)}
                    className="absolute z-20 left-2 md:left-4 top-1/2 -translate-y-1/2 
                    w-8 h-8 md:w-10 md:h-10 flex items-center justify-center 
                    rounded-full bg-white/80 shadow hover:bg-white"
                >
                    <ArrowLeft2 size="18" color="#111" />
                </button>

                {/* Next */}
                <button
                    onClick={() => handleManual(next)}
                    className="absolute z-20 right-2 md:right-4 top-1/2 -translate-y-1/2 
                    w-8 h-8 md:w-10 md:h-10 flex items-center justify-center 
                    rounded-full bg-white/80 shadow hover:bg-white"
                >
                    <ArrowRight2 size="18" color="#111" />
                </button>

                {/* dots */}
                <div className="absolute z-20 bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => handleManual(() => setIndex(i))}
                            className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition ${i === index ? "bg-white" : "bg-white/50"
                                }`}
                        />
                    ))}
                </div>

            </div>
        </div>
    )
}