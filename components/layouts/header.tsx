"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
    Sun1,
    Moon,
    Notification,
    Home2,
    Message2,
    Book1,
    Code1,
    Calendar2,
    Document,
    Shop,
} from "iconsax-react"

export function Header() {

    const pathname = usePathname()
    const { setTheme } = useTheme()

    const menu = [
        { title: "Trang chủ", link: "/", icon: Home2 },
        { title: "Diễn đàn", link: "/diendan", icon: Message2 },
        { title: "Khoá học", link: "/khoahoc", icon: Book1 },
        { title: "Luyện tập", link: "/luyentap", icon: Code1 },
        { title: "Sự kiện", link: "/sukien", icon: Calendar2 },
        { title: "Bài viết", link: "/baiviet", icon: Document },
        { title: "Cửa hàng", link: "/cuahangso", icon: Shop },
    ]

    return (
        <>

            {/* ===== DESKTOP ===== */}
            <div className="hidden lg:block bg-white dark:bg-black w-full h-15 fixed top-0 z-50">
                <div className="flex h-full justify-between items-center">

                    <div className="ml-7.5">
                        <Link href="/">
                            <Image
                                src="/images/logo.png"
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
                                <div key={m.link} className="lg:px-1 xl:px-3.75">
                                    <Link
                                        href={m.link}
                                        className={`
                      px-2.5 py-1.75 rounded-[9px] font-bold
                      transition-all duration-100 lg:text-[15px] xl:text-[16px]
                      ${isActive
                                                ? "bg-[#dedede] dark:bg-[#424141] bg-opacity-50"
                                                : "hover:bg-[#d5d5d5] dark:hover:bg-[#5F5F5F] hover:bg-opacity-50"
                                            }
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

                            <button
                                onClick={() => setTheme("light")}
                                className="hidden dark:block"
                            >
                                <Sun1 size={20} color="currentColor" variant="Outline" className="dark:text-white" />
                            </button>

                            <button
                                onClick={() => setTheme("dark")}
                                className="block dark:hidden"
                            >
                                <Moon size={20} color="currentColor" variant="Outline" />
                            </button>

                        </div>

                        <Notification
                            size={20}
                            color="currentColor"
                            variant="Outline"
                            className="cursor-pointer text-black dark:text-white"
                        />

                        <Link
                            href="/login"
                            className="lg:text-[13px] xl:text-[16px] bg-black text-white dark:bg-white dark:text-black px-2.5 py-1.75 rounded-[10px] font-bold"
                        >
                            Đăng nhập
                        </Link>

                    </div>

                </div>
            </div>


            {/* ===== MOBILE TOP ===== */}
            <div className="lg:hidden fixed top-0 w-full h-10 bg-white dark:bg-black z-50 border-b border-gray-200 dark:border-gray-800">

                <div className="flex h-full justify-between items-center px-3.75">

                    <Link href="/">
                        <Image
                            src="/images/logo.png"
                            alt="Logo CNcode"
                            width={60}
                            height={30}
                            className="object-contain"
                            priority
                        />
                    </Link>

                    <div className="flex gap-3.75 items-center">

                        <div className="mx-2">

                            <button
                                onClick={() => setTheme("light")}
                                className="hidden dark:block"
                            >
                                <Sun1 size={18} color="currentColor" variant="Outline" className="dark:text-white" />
                            </button>

                            <button
                                onClick={() => setTheme("dark")}
                                className="block dark:hidden"
                            >
                                <Moon size={18} variant="Outline" color="currentColor" />
                            </button>

                        </div>

                        <Notification
                            size={20}
                            color="currentColor"
                            variant="Outline"
                            className="cursor-pointer text-black dark:text-white"
                        />

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
            <div className="lg:hidden fixed bottom-0 left-0 w-full z-50">
                <div className="
                    w-full h-15
                    bg-white dark:bg-black
                    border-t border-gray-200 dark:border-gray-800
                    rounded-t-2xl
                    shadow-[0_-4px_20px_rgba(0,0,0,0.15)]
                    flex items-center px-2
                ">

                    {menu.map(m => {
                        const isActive = pathname === m.link
                        const Icon = m.icon

                        return (
                            <Link
                                key={m.link}
                                href={m.link}
                                title={m.title}
                                className="
                                    flex-1 flex flex-col items-center justify-center
                                    gap-1
                                    active:scale-95 active:opacity-90
                                    transition-all duration-150
                                "
                            >

                                <Icon
                                    size={22}
                                    color="currentColor"
                                    variant={isActive ? "Bold" : "Outline"}
                                    className={`
                                        transition-all duration-200
                                        ${isActive
                                            ? "text-blue-500"
                                            : "text-black dark:text-white opacity-70"
                                        }
                                    `}
                                />

                                <span
                                    className={`
                    text-[clamp(8px,2vw,11px)]
                    font-bold
                    leading-none
                    text-center
                    whitespace-nowrap
                    transition-all
                    ${isActive
                                            ? "text-blue-500"
                                            : "text-gray-500 dark:text-gray-400"
                                        }
                  `}
                                >
                                    {m.title}
                                </span>

                            </Link>
                        )
                    })}

                </div>
            </div>


            {/* spacer mobile */}
            <div className="lg:hidden h-10" />

        </>
    )
}