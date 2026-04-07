"use client"

import Link from "next/link"

interface RoadmapItem {
    title: string
    steps: string[]
    link: string
}

interface Props {
    data: RoadmapItem[]
}

export default function Roadmap({ data }: Props) {
    return (
        <div className="mt-10">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-aos="fade-up">

                {data.map((item, index) => (
                    <Link key={item.link} href={item.link} data-aos="zoom-in" data-aos-delay={index * 100} className="group p-4 rounded-2xl border border-[#e6e6e6] dark:border-[#222222] bg-white dark:bg-[#171717] hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">

                        <div>
                            <h3 className="font-semibold text-base mb-3">{item.title}</h3>

                            <div className="flex flex-col gap-2">
                                {item.steps.map((step, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-black dark:bg-white rounded-full" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-sm font-medium text-black dark:text-white group-hover:underline">Xem lộ trình</span>
                            <span className="text-lg transition-transform group-hover:translate-x-1">→</span>
                        </div>

                    </Link>
                ))}

            </div>
        </div>
    )
}