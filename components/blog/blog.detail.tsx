'use client'

import BlogBreadcrumb from "./blog.breadcrumb";
import BlogActions from "./blog.action";
import BlogComment from "./blog.comment";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BlogSidebarMobile from "./blog.sidebar.m";

interface BlogDetailProps {
    title?: string;
    content?: string;
    authorName?: string;
    authorAvatar?: string;
    publishDate?: string;
    readTime?: string;
    likeCount?: number;
    commentCount?: number;
}

export default function BlogDetail({
    title = "SDLC và STLC cơ bản: Quy trình tester phải nắm",
    content = "<p>Nội dung blog...</p>",
    authorName = "Lùng Lọc Lỗi",
    authorAvatar = "/avatar.png",
    publishDate = "3 ngày trước",
    readTime = "12 phút đọc",
    likeCount = 0,
    commentCount = 0,
}: BlogDetailProps) {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <BlogBreadcrumb title={title} />

            <h1 className="text-[26px] md:text-[32px] font-bold leading-[1.3]">{title}</h1>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={authorAvatar} />
                        <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium">{authorName}</p>
                        <p className="text-xs text-muted-foreground">
                            {publishDate} · {readTime}
                        </p>
                    </div>
                </div>
                <BlogActions />
            </div>

            <article
                className="space-y-5 text-[16px] leading-7"
                dangerouslySetInnerHTML={{ __html: content }}
            />

            <div className="block lg:hidden">
                <BlogSidebarMobile likeCount={likeCount} commentCount={commentCount} />
            </div>

            <BlogComment />
        </div>
    );
}