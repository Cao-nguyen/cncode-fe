"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Bell, Sun } from "lucide-react"

export function Header() {
    const pathname = usePathname()

    const menu = [
        {
            title: "Trang chủ",
            link: "/"
        },
        {
            title: "Diễn đàn",
            link: "diendan"
        },
        {
            title: "Khoá học",
            link: "/khoahoc"
        },
        {
            title: "Luyện tập",
            link: "/luyentap"
        },
        {
            title: "Sự kiện",
            link: "/sukien"
        },
        {
            title: "Bài viết",
            link: "/baiviet"
        },
        {
            title: "Cửa hàng số",
            link: "/cuahangso"
        }
    ]

    return (
        <div className="bg-black w-[100%] h-[60px] fixed top-0">
            <div className="flex h-full justify-between items-center">
                <div className="ml-[30px]">
                    <Image
                        src="/logo.png"
                        alt="Logo CNcode"
                        width={100}
                        height={40}
                    />
                </div>
                <div className="flex">
                    {menu.map((m) => {
                        const isActive = pathname === m.link
                        return (
                            <div key={m.link} className="pl-[15px] pr-[15px]" >
                                <Link className={`
                                    px-[10px]
                                    py-[10px]
                                    rounded-[10px]
                                    font-bold
                                    ${isActive
                                        ? "bg-[#424141] bg-opacity-[0.5]"
                                        : "hover:bg-[#5F5F5F] hover:bg-opacity-[0.5]"
                                    }
                                   
                                    transition-all
                                    duration-[100]`
                                } href={m.link}>{m.title}</Link>
                            </div>
                        )
                    })}
                </div>
                <div className="mr-[30px] flex">
                    <div className="flex mr-[15px]">
                        <Sun className="text-white mx-[8px] size-[20px] cursor-pointer" />
                        <Bell className="text-white mx-[8px] size-[20px] cursor-pointer" />
                    </div>
                    <div>
                        <Link className={"bg-white text-black px-[10px] py-[10px] rounded-[10px] font-bold"} href="/login">Đăng nhập</Link>
                    </div>
                </div>
            </div>
        </div >
    )
}