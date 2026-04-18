"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Feed from "@/components/sections/forum/feed"
import Post from "@/components/sections/forum/post"
import ChatPage from "@/components/sections/forum/chat"

function DiendanContent() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const currentTab = searchParams.get("tab") || "khampha"

    const handleTabClick = (tab: string) => {
        router.push(`/forum?tab=${tab}`)
    }

    return (
        <div className="pt-0 lg:pt-15">
            <header className="flex h-7.5 bg-white dark:bg-black border-b border-gray-300 dark:border-gray-700 justify-center">
                <div className="flex space-x-2">
                    {[
                        { key: "khampha", label: "Khám phá" },
                        { key: "thongtin", label: "Thông tin" },
                        { key: "congdong", label: "Cộng đồng" },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            className={`px-3 py-1 text-sm font-medium
                            ${currentTab === tab.key
                                    ? "border-b-2 border-blue-500 text-blue-500"
                                    : "text-gray-700 dark:text-gray-300"
                                }
                            transition-colors duration-200`}
                            onClick={() => handleTabClick(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Nội dung */}
            <div>
                {currentTab === "khampha" && <Feed />}
                {currentTab === "thongtin" && <Post />}
                {currentTab === "congdong" && <ChatPage />}
            </div>
        </div>
    )
}

export default function Diendan() {
    return (
        <Suspense fallback={<div></div>}>
            <DiendanContent />
        </Suspense>
    )
}