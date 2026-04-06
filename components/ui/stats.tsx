"use client"

import { useEffect, useState, useRef } from "react"

interface StatItem {
    label: string
    value: number
    icon: React.ReactNode
}

export default function Stats({ data }: { data: StatItem[] }) {

    const [count, setCount] = useState(data.map(() => 0))
    const [start, setStart] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setStart(true)
                    observer.disconnect()
                }
            },
            { threshold: 0.3 }
        )

        if (ref.current) observer.observe(ref.current)

        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        if (!start) return

        const interval = setInterval(() => {
            setCount(prev =>
                prev.map((num, i) =>
                    num < data[i].value
                        ? num + Math.ceil(data[i].value / 50)
                        : data[i].value
                )
            )
        }, 30)

        return () => clearInterval(interval)
    }, [start, data])

    return (
        <div ref={ref} className="mt-10">

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                {data.map((item, index) => (
                    <div
                        key={index}
                        data-aos="zoom-in"
                        data-aos-delay={index * 100}
                        className="
                            group
                            p-4 rounded-2xl 
                            border border-[#e6e6e6] dark:border-[#222222] 
                            bg-white dark:bg-[#171717]
                            flex items-center gap-3
                            hover:shadow-lg hover:-translate-y-1
                            transition-all duration-300
                        "
                    >

                        {/* Icon */}
                        <div className="
                            w-10 h-10 flex items-center justify-center
                            rounded-xl
                            bg-black text-white 
                            dark:bg-white dark:text-black
                            group-hover:scale-110
                            transition
                        ">
                            {item.icon}
                        </div>

                        {/* Content */}
                        <div>
                            <h3 className="text-base md:text-lg font-bold text-black dark:text-white">
                                {count[index].toLocaleString()}+
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {item.label}
                            </p>
                        </div>

                    </div>
                ))}

            </div>
        </div>
    )
}