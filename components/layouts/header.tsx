"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Bell, Sun, Moon, Home, MessageCircle, BookOpen, Code, Calendar, FileText, ShoppingBag } from "lucide-react"

export function Header() {
    const pathname = usePathname()
    const { setTheme } = useTheme()

    const menu = [
        { title: "Trang chủ", link: "/", icon: Home },
        { title: "Diễn đàn", link: "/diendan", icon: MessageCircle },
        { title: "Khoá học", link: "/khoahoc", icon: BookOpen },
        { title: "Luyện tập", link: "/luyentap", icon: Code },
        { title: "Sự kiện", link: "/sukien", icon: Calendar },
        { title: "Bài viết", link: "/baiviet", icon: FileText },
        { title: "Cửa hàng số", link: "/cuahangso", icon: ShoppingBag }
    ]

    return (
        <>
            {/* ===== DESKTOP ===== */}
            <div className="hidden 2xl:block bg-white dark:bg-black w-full h-15 fixed top-0 z-50">
                <div className="flex h-full justify-between items-center">
                    <div className="ml-7.5">
                        <Link href="/">
                            <Image
                                src="/logo.png"
                                alt="Logo CNcode"
                                width={100}
                                height={55}
                                priority
                            />
                        </Link>
                    </div>

                    <div className="flex">
                        {menu.map(m => {
                            const isActive = pathname === m.link
                            return (
                                <div key={m.link} className="px-3.75">
                                    <Link
                                        href={m.link}
                                        className={`
                                            px-2.5 py-1.75 rounded-[9px] font-bold
                                            ${isActive
                                                ? "bg-[#d1d1d1] dark:bg-[#424141] bg-opacity-[0.5]"
                                                : "hover:bg-[#bababa] dark:hover:bg-[#5F5F5F] hover:bg-opacity-[0.5]"
                                            }
                                            transition-all duration-100
                                        `}
                                    >
                                        {m.title}
                                    </Link>
                                </div>
                            )
                        })}
                    </div>

                    <div className="mr-7.5 flex gap-3.75 items-center">
                        <div className="mx-2">
                            <div
                                onClick={() => setTheme("light")}
                                className="hidden dark:block cursor-pointer"
                            >
                                <Sun className={`dark:text-white size-5`} />
                            </div>

                            <div
                                onClick={() => setTheme("dark")}
                                className="block dark:hidden cursor-pointer"
                            >
                                <Moon className={`dark:text-white size-5`} />
                            </div>
                        </div>
                        <Bell className="text-black dark:text-white size-4.5 cursor-pointer" />
                        <Link
                            href="/login"
                            className="bg-black text-white dark:bg-white dark:text-black px-2.5 py-1.75 rounded-[10px] font-bold"
                        >
                            Đăng nhập
                        </Link>
                    </div>
                </div>
            </div>

            {/* ===== MOBILE TOP ===== */}
            <div className="2xl:hidden fixed top-0 w-full h-10 bg-white dark:bg-black z-50 border-b border-gray-200 dark:border-gray-800">
                <div className="flex h-full justify-between items-center px-3.75">
                    <Link href="/">
                        <Image src="/logo.png" alt="Logo CNcode" width={80} height={40} priority />
                    </Link>

                    <div className="flex gap-3.75 items-center">
                        <div className="mx-2">
                            <div
                                onClick={() => setTheme("light")}
                                className="hidden dark:block cursor-pointer"
                            >
                                <Sun className={`dark:text-white size-4.5`} />
                            </div>

                            <div
                                onClick={() => setTheme("dark")}
                                className="block dark:hidden cursor-pointer"
                            >
                                <Moon className={`dark:text-white size-4.5`} />
                            </div>
                        </div>
                        <Bell className="text-black dark:text-white size-4.5 cursor-pointer" />
                        <Link
                            href="/login"
                            className="bg-black text-white dark:bg-white dark:text-black px-2 py-1 rounded-[10px] font-bold text-[12px]"
                        >
                            Đăng nhập
                        </Link>
                    </div>
                </div>
            </div>

            {/* ===== MOBILE BOTTOM ===== */}
            <div className="2xl:hidden fixed bottom-0 w-full h-12.5 bg-white dark:bg-black z-50 border-t border-gray-200 dark:border-gray-800">
                <div className="flex h-full justify-around items-center gap-2 px-2">
                    {menu.map(m => {
                        const isActive = pathname === m.link
                        const Icon = m.icon
                        return (
                            <Link
                                key={m.link}
                                href={m.link}
                                title={m.title}
                                className={`relative flex items-center justify-center w-10 h-10 rounded-4xl transition-all duration-300 ${isActive ? "scale-110" : ""}`}
                            >
                                {isActive && (
                                    <div className="absolute inset-0 bg-linear-to-br from-blue-400 to-blue-500 dark:from-blue-600 dark:to-blue-700 rounded-[7px] -z-10 shadow-lg"></div>
                                )}
                                <Icon className={`size-5 ${isActive ? "text-white" : "text-black dark:text-white"}`} />
                            </Link>
                        )
                    })}
                </div>
            </div>

            <div className="2xl:hidden h-10" />
        </>
    )
}