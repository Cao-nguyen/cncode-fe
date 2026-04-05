"use client"

import Link from "next/link"
import { SmsTracking, MessageQuestion, } from "iconsax-react"

export default function FloatingButtons() {

    const data = [
        { icon: SmsTracking, label: "Chat với Admin", href: "/chatwithadmin" },
        { icon: MessageQuestion, label: "Gia sư AI", href: "/giasuai" },
    ]

    return (
        <div className="fixed bottom-18 right-2 lg:bottom-4 lg:right-1 flex flex-col items-end gap-3 z-50">
            {data.map((item, index) => {
                const Icon = item.icon

                return (
                    <div key={index} className="group relative flex items-center">
                        <div className="pointer-events-none absolute right-14 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
                            <div className="bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap flex items-center gap-2">
                                <span>{item.label}</span>
                            </div>
                        </div>
                        <Link href={item.href} className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow-lg hover:scale-105 transition">
                            <Icon variant="Bulk" size={23} />
                        </Link>
                    </div>
                )
            })}
        </div>
    )
}