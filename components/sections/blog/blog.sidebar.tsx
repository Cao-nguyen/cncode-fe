"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Heart, Message } from "iconsax-react"

export default function BlogSidebar() {
    return (
        <Card className="rounded-2xl shadow-sm">
            <CardContent className="space-y-3">

                <div>
                    <h3 className="font-semibold text-[16px]">
                        Lùng Lọc Lỗi
                    </h3>

                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        Đeo kính để soi Bug cho rõ, nhớ mày để nhắc Dev sửa cho kỹ.
                        Với tôi, chạy được thôi là chưa đủ! 😳💻
                    </p>
                </div>

                <Separator />

                <div className="flex gap-6 text-muted-foreground">
                    <div className="flex items-center gap-2 hover:text-red-500 cursor-pointer transition">
                        <Heart variant="Bold" size={22} />
                        <span>0</span>
                    </div>

                    <div className="flex items-center gap-2 hover:text-blue-500 cursor-pointer transition">
                        <Message variant="Bold" size={22} />
                        <span>0</span>
                    </div>
                </div>

            </CardContent>
        </Card>
    )
}