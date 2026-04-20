"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
    { img: "/images/images1.jpg", link: "/course" },
    { img: "/images/image2.jpg", link: "/forum" },
    { img: "/images/images3.jpg", link: "/community" },
];

export default function Slideshow() {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const resumeRef = useRef<NodeJS.Timeout | null>(null);

    const next = () => setIndex((i) => (i + 1) % SLIDES.length);
    const prev = () => setIndex((i) => (i === 0 ? SLIDES.length - 1 : i - 1));

    const handleManual = (fn: () => void) => {
        fn();
        setPaused(true);
        if (resumeRef.current) clearTimeout(resumeRef.current);
        resumeRef.current = setTimeout(() => setPaused(false), 5000);
    };

    useEffect(() => {
        if (paused) return;
        const timer = setInterval(next, 3000);
        return () => clearInterval(timer);
    }, [paused]);

    return (
        <div className="relative w-full overflow-hidden">
            <div className="relative h-45 sm:h-60 md:h-80 lg:h-105">

                {SLIDES.map((slide, i) => (
                    <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                        <Link href={slide.link} className="block relative w-full h-full cursor-pointer">
                            <Image src={slide.img} alt="slide" fill className="object-cover transition-transform duration-500 hover:scale-[1.02]" priority={i === 0} />
                        </Link>
                    </div>
                ))}

                <button onClick={() => handleManual(prev)} className="absolute z-20 left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white/80 shadow hover:bg-white">
                    <ChevronLeft size="18" color="#111" />
                </button>

                <button onClick={() => handleManual(next)} className="absolute z-20 right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white/80 shadow hover:bg-white">
                    <ChevronRight size="18" color="#111" />
                </button>


                <div className="absolute z-20 bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {SLIDES.map((_, i) => (
                        <button key={i} onClick={() => handleManual(() => setIndex(i))} className={`w-6 h-2 rounded-full transition ${i === index ? "bg-white" : "bg-white/50"}`} />
                    ))}
                </div>

            </div>
        </div>
    );
}