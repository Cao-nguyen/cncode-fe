"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes";
import { Bell, Sun, Moon, Search, Home, MessageCircle, BookOpen, Code, Calendar, FileText, ShoppingBag } from "lucide-react";
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
            link: "/",
            icon: Home
        },
        {
            title: "Diễn đàn",
            link: "/diendan",
            icon: MessageCircle
        },
        {
            title: "Khoá học",
            link: "/khoahoc",
            icon: BookOpen
        },
        {
            title: "Luyện tập",
            link: "/luyentap",
            icon: Code
        },
        {
            title: "Sự kiện",
            link: "/sukien",
            icon: Calendar
        },
        {
            title: "Bài viết",
            link: "/baiviet",
            icon: FileText
        },
        {
            title: "Cửa hàng số",
            link: "/cuahangso",
            icon: ShoppingBag
        }
    ]

    return (
        <>
            {/* Header cho Desktop */}
            <div className="hidden 2xl:block bg-white dark:bg-black w-[100%] h-[60px] fixed top-0 z-50">
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

            {/* Header phụ cho Mobile/Tablet */}
            <div className="2xl:hidden fixed top-0 w-full h-[40px] bg-white dark:bg-black z-50 border-b border-gray-200 dark:border-gray-800">
                <div className="flex h-full justify-between items-center px-[15px]">
                    <Link href={"/"}>
                        <Image
                            src="/logo.png"
                            alt="Logo CNcode"
                            width={80}
                            height={40}
                        />
                    </Link>
                    <div className="flex gap-[15px] items-center">
                        <div
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="cursor-pointer"
                        >
                            {theme === "dark" ?
                                <Sun className="dark:text-white size-[18px]" />
                                : <Moon className="dark:text-white size-[18px]" />}
                        </div>
                        <Bell className="text-black dark:text-white size-[18px] cursor-pointer" />
                        <Link className={"bg-black text-white dark:bg-white dark:text-black px-[8px] py-[4px] rounded-[8px] font-bold text-[12px]"} href="/login">Đăng nhập</Link>
                    </div>
                </div>
            </div>

            {/* Header chính (Icon Navigation) cho Mobile/Tablet */}
            <div className="2xl:hidden fixed bottom-0 w-full h-[50px] bg-white dark:bg-black z-50 border-t border-gray-200 dark:border-gray-800">
                <div className="flex h-full justify-around items-center gap-[8px] px-[8px]">
                    {menu.map((m) => {
                        const isActive = pathname === m.link
                        const IconComponent = m.icon
                        return (
                            <Link
                                key={m.link}
                                href={m.link}
                                title={m.title}
                                className={`relative flex items-center justify-center w-[40px] h-[40px] rounded-[50%] transition-all duration-300 ease-out ${isActive
                                    ? "scale-110"
                                    : ""
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-500 dark:from-blue-600 dark:to-blue-700 rounded-[50%] -z-10 shadow-lg shadow-blue-400/50 dark:shadow-blue-600/50"></div>
                                )}
                                <div className={`relative transition-all duration-300 ${isActive ? "text-white" : "text-black dark:text-white"}`}>
                                    <IconComponent className="size-[20px]" />
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* Spacer cho Mobile/Tablet */}
            <div className="2xl:hidden h-[40px]"></div>
        </>
    )
}