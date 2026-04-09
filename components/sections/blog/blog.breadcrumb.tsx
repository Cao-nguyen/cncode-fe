"use client"

import Link from "next/link"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { ArrowRight2 } from "iconsax-react"

export default function BlogBreadcrumb() {
    return (
        <Breadcrumb>
            <BreadcrumbList className="text-sm text-muted-foreground flex-nowrap overflow-hidden">

                {/* Trang chủ */}
                <BreadcrumbItem className="shrink-0">
                    <BreadcrumbLink asChild>
                        <Link href="/" className="hover:text-foreground transition">
                            Trang chủ
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbSeparator>
                    <ArrowRight2 size={14} variant="Outline" className="opacity-50" />
                </BreadcrumbSeparator>

                {/* Blog */}
                <BreadcrumbItem className="shrink-0">
                    <BreadcrumbLink asChild>
                        <Link href="/blog" className="hover:text-foreground transition">
                            Blog
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbSeparator>
                    <ArrowRight2 size={14} variant="Outline" className="opacity-50" />
                </BreadcrumbSeparator>

                <BreadcrumbItem className="min-w-0 flex-1">
                    <BreadcrumbPage
                        className="
                            block
                            truncate
                            max-w-full
                            text-foreground
                            font-medium
                        "
                    >
                        SDLC và STLC cơ bản: Quy trình tester phải nắm để đọc requirement rất dài rất dài
                    </BreadcrumbPage>
                </BreadcrumbItem>

            </BreadcrumbList>
        </Breadcrumb>
    )
}