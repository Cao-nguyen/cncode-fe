'use client'

import Link from "next/link";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";

interface BlogBreadcrumbProps {
    title?: string;
}

export default function BlogBreadcrumb({ title = "Bài viết" }: BlogBreadcrumbProps) {
    return (
        <Breadcrumb>
            <BreadcrumbList className="text-sm text-muted-foreground flex-nowrap overflow-hidden">
                <BreadcrumbItem className="shrink-0">
                    <BreadcrumbLink asChild>
                        <Link href="/" className="hover:text-foreground transition">
                            Trang chủ
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbSeparator>
                    <ChevronRight size={14} className="opacity-50" />
                </BreadcrumbSeparator>

                <BreadcrumbItem className="shrink-0">
                    <BreadcrumbLink asChild>
                        <Link href="/baiviet" className="hover:text-foreground transition">
                            Bài viết
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbSeparator>
                    <ChevronRight size={14} className="opacity-50" />
                </BreadcrumbSeparator>

                <BreadcrumbItem className="min-w-0 flex-1">
                    <BreadcrumbPage className="block truncate max-w-full text-foreground font-medium">
                        {title}
                    </BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    );
}