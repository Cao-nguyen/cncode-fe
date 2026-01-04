"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes";
import { Bell, Sun, Moon, Search } from "lucide-react";
import { useEffect, useState } from "react";

export function Header() {
    const pathname = usePathname()

    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    const menu = [
        {
            title: "Trang chủ",
            link: "/"
        },
        {
            title: "Diễn đàn",
            link: "/diendan"
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
        <div className="bg-white dark:bg-black w-[100%] h-[60px] fixed top-0">
            <div className="flex h-full justify-between items-center">
                <div className="ml-[30px]">
                    <Link href={"/"} >
                        <Image
                            src="/logo.png"
                            alt="Logo CNcode"
                            width={100}
                            height={55}
                        />
                    </Link>
                </div>
                <div className="flex">
                    {menu.map((m) => {
                        const isActive = pathname === m.link
                        return (
                            <div key={m.link} className="pl-[15px] pr-[15px]" >
                                <Link className={`
                                    px-[10px]
                                    py-[7px]
                                    rounded-[10px]
                                    font-bold
                                    ${isActive
                                        ? "bg-[#d1d1d1] dark:bg-[#424141] bg-opacity-[0.5]"
                                        : "hover:bg-[#bababa] dark:hover:bg-[#5F5F5F] hover:bg-opacity-[0.5]"
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
                        <div
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")
                            }
                        >
                            {theme === "dark" ?
                                <Sun className="dark:text-white mx-[8px] size-[20px] cursor-pointer" />
                                : <Moon className="dark:text-white mx-[8px] size-[20px] cursor-pointer" />}
                        </div>
                        <Bell className="text-black dark:text-white mx-[8px] size-[20px] cursor-pointer" />
                    </div>
                    <div>
                        <Link className={"bg-black text-white dark:bg-white dark:text-black px-[10px] py-[7px] rounded-[10px] font-bold"} href="/login">Đăng nhập</Link>
                    </div>
                </div>
            </div>
        </div >
    )
}