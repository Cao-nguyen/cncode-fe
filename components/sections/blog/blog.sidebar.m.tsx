"use client"

import { Heart, Message } from "iconsax-react"

export default function BlogSidebarMobile() {
    return (
        <div className="flex items-center justify-center gap-6 py-4 border-t border-b">

            <div className="flex items-center gap-1 text-muted-foreground">
                <Heart variant="Bold" size={22} />
                <span className="text-sm">0</span>
            </div>

            <div className="flex items-center gap-1 text-muted-foreground">
                <Message variant="Bold" size={22} />
                <span className="text-sm">0</span>
            </div>

        </div>
    )
}