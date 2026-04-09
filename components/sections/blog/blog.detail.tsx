"use client"

import BlogBreadcrumb from "./blog.breadcrumb"
import BlogActions from "./blog.action"
import BlogComment from "./blog.comment"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import BlogSidebarMobile from "./blog.sidebar.m"

export default function BlogDetail() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">

            <BlogBreadcrumb />

            {/* Title */}
            <h1 className="text-[26px] md:text-[32px] font-bold leading-[1.3]">
                SDLC và STLC cơ bản: Quy trình tester phải nắm
            </h1>

            {/* Author + Actions */}
            <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src="/avatar.png" />
                        <AvatarFallback>LLL</AvatarFallback>
                    </Avatar>

                    <div>
                        <p className="text-sm font-medium">Lùng Lọc Lỗi</p>
                        <p className="text-xs text-muted-foreground">
                            3 ngày trước · 12 phút đọc
                        </p>
                    </div>
                </div>

                <BlogActions />
            </div>

            {/* Content */}
            <article className="space-y-5 text-[16px] leading-7">
                <p>Nội dung blog...</p>
            </article>

            {/* Sidebar mobile */}
            <div className="block lg:hidden">
                <BlogSidebarMobile />
            </div>

            {/* Comment */}
            <BlogComment />

        </div>
    )
}