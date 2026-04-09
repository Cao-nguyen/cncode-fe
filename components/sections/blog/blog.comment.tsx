"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function BlogComment() {
    const [comments, setComments] = useState<string[]>([])
    const [value, setValue] = useState("")

    const handleSubmit = () => {
        if (!value.trim()) return
        setComments([value, ...comments])
        setValue("")
    }

    return (
        <div className="mt-10 space-y-6">

            {/* Input */}
            <div className="flex gap-3">
                <Avatar className="w-9 h-9">
                    <AvatarImage src="/avatar.png" />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                    <Textarea
                        placeholder="Viết bình luận..."
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />

                    <div className="flex justify-end">
                        <Button onClick={handleSubmit}>
                            Gửi
                        </Button>
                    </div>
                </div>
            </div>

            {/* List comment */}
            <div className="space-y-4">
                {comments.map((c, i) => (
                    <div key={i} className="flex gap-3">
                        <Avatar className="w-9 h-9">
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>

                        <div className="bg-muted px-4 py-2 rounded-xl text-sm">
                            {c}
                        </div>
                    </div>
                ))}
            </div>

        </div>
    )
}