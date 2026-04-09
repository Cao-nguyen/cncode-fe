"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Add } from "iconsax-react"
import BlogCard from "@/components/sections/blog/blog"

const blogPosts = [
    {
        title: "Cách học lập trình hiệu quả cho người mới bắt đầu",
        description:
            "Bài viết này sẽ giúp bạn hiểu rõ lộ trình học lập trình từ con số 0 đến khi có thể đi làm thực tế...",
        image: "/images/image2.jpg",
        time: "5 phút đọc",
        author: "Nguyễn Văn A",
        avatar: "/images/avatar.jpg",
        category: "Frontend",
        link: "/baiviet/1"
    },
    {
        title: "Hướng dẫn React 2026: từ cơ bản đến nâng cao",
        description:
            "Tìm hiểu các tính năng mới và cách xây dựng ứng dụng React chuẩn hiện đại.",
        image: "/images/image2.jpg",
        time: "6 phút đọc",
        author: "Trần Thị B",
        avatar: "/images/avatar.jpg",
        category: "React",
        link: "/baiviet/2"
    },
    {
        title: "Tối ưu hoá hiệu năng website bằng Next.js",
        description:
            "Các kỹ thuật quan trọng để tăng tốc độ tải trang và cải thiện trải nghiệm người dùng.",
        image: "/images/image2.jpg",
        time: "7 phút đọc",
        author: "Lê Văn C",
        avatar: "/images/avatar.jpg",
        category: "NextJS",
        link: "/baiviet/3"
    },
    {
        title: "Lập trình backend với Node.js cho người mới",
        description:
            "Khái quát các bước xây dựng API, làm việc với database và bảo mật cơ bản.",
        image: "/images/image2.jpg",
        time: "8 phút đọc",
        author: "Phạm Thị D",
        avatar: "/images/avatar.jpg",
        category: "Backend",
        link: "/baiviet/4"
    }
]

export default function BlogPage() {
    const [search, setSearch] = useState("")

    const filteredPosts = useMemo(() => {
        const query = search.trim().toLowerCase()

        return blogPosts.filter((post) => {
            return (
                post.title.toLowerCase().includes(query) ||
                post.description.toLowerCase().includes(query) ||
                post.author.toLowerCase().includes(query)
            )
        })
    }, [search])

    return (
        <main className="px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8 space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

                    {/* Title */}
                    <div className="max-w-2xl">
                        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                            Tất cả bài viết
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                            Tìm nhanh bài viết theo tiêu đề, nội dung hoặc tác giả.
                        </p>
                    </div>

                    {/* Search + Button */}
                    <div className="flex w-full max-w-lg gap-3">
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm kiếm bài viết..."
                            className="w-[60%] lg:w-[74%] rounded-3xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-100 dark:focus:ring-slate-800"
                        />

                        <Link
                            href="/blog/create"
                            className="flex items-center gap-2 rounded-3xl bg-black dark:bg-white px-3 py-2 text-sm text-white dark:text-black shadow hover:opacity-90 transition"
                        >
                            <Add variant="Outline" size={28} />
                            <span>Tạo blog</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Count */}
            <div className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                {filteredPosts.length} bài viết
            </div>

            {/* Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => (
                        <div key={post.link}>
                            <BlogCard {...post} />
                        </div>
                    ))
                ) : (
                    <div className="col-span-full rounded-[28px] border border-slate-200 bg-slate-50 p-8 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                        Không tìm thấy bài viết phù hợp. Thử thay đổi từ khóa tìm kiếm.
                    </div>
                )}
            </div>
        </main>
    )
}