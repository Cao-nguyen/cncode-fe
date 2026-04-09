"use client"

import { useState } from "react"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

import { More, Bookmark, Copy, Flag } from "iconsax-react"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFacebook } from "@fortawesome/free-brands-svg-icons"

export default function BlogActions() {
    const [saved, setSaved] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
        } catch (err) {
            console.error("Copy failed", err)
        }
    }

    const shareFacebook = () => {
        const appId = "1660889691575547";
        const postUrl = encodeURIComponent(window.location.href);
        const redirectUri = encodeURIComponent(window.location.href);

        const facebookUrl = `https://www.facebook.com/dialog/feed?app_id=${appId}&display=popup&link=${postUrl}&redirect_uri=${redirectUri}`;

        window.open(facebookUrl, "_blank", "width=600,height=400,noopener,noreferrer");
    };

    return (
        <div className="flex items-center gap-3 md:gap-4">

            {/* Bookmark */}
            <div
                onClick={() => setSaved(!saved)}
                className={`transition ${saved ? "text-yellow-500" : ""}`}
            >
                <Bookmark size={22} variant={saved ? "Bold" : "Outline"} />
            </div>

            {/* Dropdown */}
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <More size={22} />
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    align="end"
                    className="w-56 rounded-xl p-1 flex flex-col gap-2"
                >

                    {/* Facebook */}
                    <DropdownMenuItem
                        onClick={shareFacebook}
                        className="py-2 flex items-center gap-2 cursor-pointer"
                    >
                        <FontAwesomeIcon
                            icon={faFacebook}
                            className="text-blue-500 text-[20px]"
                        />
                        <span>Chia sẻ lên Facebook</span>
                    </DropdownMenuItem>

                    {/* Copy */}
                    <DropdownMenuItem
                        onClick={handleCopy}
                        className="py-2 flex items-center gap-3 cursor-pointer"
                    >
                        <Copy
                            variant="Bold"
                            className="w-5.5! h-5.5!"
                        />
                        <span>Sao chép liên kết</span>
                    </DropdownMenuItem>

                    {/* Report */}
                    <DropdownMenuItem
                        className="py-2 flex items-center gap-3 text-red-500 cursor-pointer"
                    >
                        <Flag
                            variant="Bold"
                            className="w-5.5! h-5.5!"
                        />
                        <span>Báo cáo bài viết</span>
                    </DropdownMenuItem>

                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}