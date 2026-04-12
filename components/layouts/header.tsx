"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { logout } from "@/store/userSlice"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import {
    Sun1,
    Moon,
    Notification,
    Home2,
    Message2,
    Book1,
    DocumentCode,
    Calendar2,
    Document,
    Shop,
    User,
    Setting2,
    Logout,
    Book,
    DocumentText,
    Home,
} from "iconsax-react"

type UserType = {
    fullname: string
    avatar: string
    role: "admin" | "user" | "teacher"
}

const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(num)
}

function UserDropdown({ user }: { user: UserType }) {

    const dispatch = useAppDispatch()
    const router = useRouter()

    const handleLogout = () => {
        dispatch(logout())
        localStorage.removeItem("token")
        router.push("/login")
    }

    return (
        <DropdownMenuContent align="end" className="w-50">

            <div className="flex items-center gap-3 px-2 py-2">
                <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.fullname.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-bold">{user.fullname}</p>
                    <p className="text-xs text-gray-500">Tài khoản: {user.role}</p>
                </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
                <User size={20} variant="Outline" className="mr-1 w-4.5! h-4.5!" />
                <Link href="/p/:id">Trang cá nhân</Link>
            </DropdownMenuItem>

            {user.role === "admin" && (
                <DropdownMenuItem>
                    <Setting2 size={20} variant="Outline" className="mr-1 w-4.5! h-4.5!" />
                    <Link href="/admin/dashboard">Trang quản trị</Link>
                </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem>
                <Book size={20} variant="Outline" className="mr-1 w-4.5! h-4.5!" />
                <Link href="/me/khoahoc">Khoá học của tôi</Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
                <DocumentText size={20} variant="Outline" className="mr-1 w-4.5! h-4.5!" />
                <Link href="/me/baiviet">Bài viết của tôi</Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
                <Home size={20} variant="Outline" className="mr-1 w-4.5! h-4.5!" />
                <Link href="khuvuonhoctap">Khu vườn học tập</Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
                <Shop size={20} variant="Outline" className="mr-1 w-4.5! h-4.5!" />
                <Link href="/nhahangcongnghe">Nhà hàng công nghệ</Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
                <Setting2 size={20} variant="Outline" className="mr-1 w-4.5! h-4.5!" />
                <Link href="/settings">Cài đặt</Link>
            </DropdownMenuItem>

            <DropdownMenuItem
                className="text-red-500"
                onClick={handleLogout}
            >
                <Logout size={20} variant="Outline" className="mr-1 w-4.5! h-4.5!" />
                Đăng xuất
            </DropdownMenuItem>

        </DropdownMenuContent>
    )
}

export function Header() {

    const pathname = usePathname()
    const { setTheme } = useTheme()

    const userRedux = useAppSelector(state => state.user.user)

    const user: UserType | null = userRedux
        ? {
            fullname: userRedux.name,
            avatar: userRedux.avatar || "/images/avatar.png",
            role: userRedux.role
        }
        : null

    const menu = [
        { title: "Trang chủ", link: "/", icon: Home2 },
        { title: "Diễn đàn", link: "/diendan", icon: Message2 },
        { title: "Khoá học", link: "/khoahoc", icon: Book1 },
        { title: "Luyện tập", link: "/luyentap", icon: DocumentCode },
        { title: "Sự kiện", link: "/sukien", icon: Calendar2 },
        { title: "Bài viết", link: "/baiviet", icon: Document },
        { title: "Cửa hàng", link: "/cuahangso", icon: Shop },
    ]

    return (
        <>
            <div className="hidden lg:block bg-white dark:bg-black w-full h-15 fixed top-0 z-50">
                <div className="flex h-full justify-between items-center">
                    <div className="ml-1.5 lg:ml-4">
                        <Link href="/">
                            <Image src="/images/logo.png" alt="Logo CNcode" width={100} height={55} priority />
                        </Link>
                    </div>

                    <div className="flex">
                        {menu.map(m => {
                            const isActive = pathname === m.link
                            return (
                                <div key={m.link} className="lg:px-1 xl:px-3">
                                    <Link href={m.link}
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

                    <div className="mr-1.5 lg:mr-4 flex gap-3 items-center">
                        <div>
                            <button onClick={() => setTheme("light")} className="hidden dark:block">
                                <Sun1 size={20} variant="Outline" className="dark:text-white" />
                            </button>
                            <button onClick={() => setTheme("dark")} className="block dark:hidden">
                                <Moon size={20} variant="Outline" />
                            </button>
                        </div>

                        <div className="flex items-center gap-5 mr-1">
                            <div className="relative flex items-center">
                                <div className="border border-gray-400 dark:border-gray-600 rounded-2xl pl-2 pr-4 py-0.5">
                                    <p className="text-blue-500 dark:text-blue-300 text-[12px] font-medium">
                                        {formatNumber(userRedux?.cncoins ?? 0)}
                                    </p>
                                </div>
                                <Image src="/icons/coins.svg" alt="Coins" width={25} height={25} className="absolute -right-3" />
                            </div>

                            <div className="relative flex items-center">
                                <div className="border border-gray-400 dark:border-gray-600 rounded-2xl pl-2 pr-5 py-0.5">
                                    <p className="text-blue-500 dark:text-blue-300 text-[12px] font-medium">
                                        {formatNumber(userRedux?.streak ?? 0)}
                                    </p>
                                </div>
                                <Image src="/icons/streak.svg" alt="Streak" width={27} height={27} className="absolute -right-3" />
                            </div>
                        </div>

                        <Notification size={20} variant="Outline" className="cursor-pointer text-black dark:text-white" />

                        {user ? (
                            <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                    <div className="p-0.5 rounded-full">
                                        <Avatar className="cursor-pointer w-8 h-8">
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback>{user.fullname.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                </DropdownMenuTrigger>
                                <UserDropdown user={user} />
                            </DropdownMenu>
                        ) : (
                            <Link href="/login" className="bg-black text-white dark:bg-white dark:text-black px-2 py-1 rounded-[10px] font-bold text-[14px]">
                                Đăng nhập
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="lg:hidden fixed top-0 w-full h-10 bg-white dark:bg-black z-50 border-b border-gray-200 dark:border-gray-800">
                <div className="flex h-full justify-between items-center px-1.5 lg:px-4">
                    <Link href="/">
                        <Image src="/images/logo.png" alt="Logo CNcode" width={60} height={30} className="object-contain" priority />
                    </Link>

                    <div className="flex gap-3 items-center">
                        <div>
                            <button onClick={() => setTheme("light")} className="hidden dark:block">
                                <Sun1 size={18} variant="Outline" className="dark:text-white" />
                            </button>
                            <button onClick={() => setTheme("dark")} className="block dark:hidden">
                                <Moon size={18} variant="Outline" />
                            </button>
                        </div>

                        <div className="flex items-center gap-5 mr-1">
                            <div className="relative flex items-center">
                                <div className="border border-gray-400 dark:border-gray-600 rounded-2xl pl-2 pr-4 py-0.5">
                                    <p className="text-blue-500 dark:text-blue-300 text-[12px] font-medium">
                                        {formatNumber(userRedux?.cncoins ?? 0)}
                                    </p>
                                </div>
                                <Image src="/icons/coins.svg" alt="Coins" width={25} height={25} className="absolute -right-3" />
                            </div>

                            <div className="relative flex items-center">
                                <div className="border border-gray-400 dark:border-gray-600 rounded-2xl pl-2 pr-5 py-0.5">
                                    <p className="text-blue-500 dark:text-blue-300 text-[12px] font-medium">
                                        {formatNumber(userRedux?.streak ?? 0)}
                                    </p>
                                </div>
                                <Image src="/icons/streak.svg" alt="Streak" width={27} height={27} className="absolute -right-3" />
                            </div>
                        </div>

                        <Notification size={20} variant="Outline" className="cursor-pointer text-black dark:text-white" />

                        {user ? (
                            <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                    <div className="p-0.5 rounded-full">
                                        <Avatar className="cursor-pointer w-6.5 h-6.5">
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback>{user.fullname.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                </DropdownMenuTrigger>
                                <UserDropdown user={user} />
                            </DropdownMenu>
                        ) : (
                            <Link href="/login" className="bg-black text-white dark:bg-white dark:text-black px-2 py-1 rounded-[10px] font-bold text-[12px]">
                                Đăng nhập
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="lg:hidden fixed bottom-0 left-0 w-full z-50">
                <div className="w-full h-15 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] flex items-center px-2">
                    {menu.map(m => {
                        const isActive = pathname === m.link
                        const Icon = m.icon
                        return (
                            <Link key={m.link} href={m.link} title={m.title}
                                className="flex-1 flex flex-col items-center justify-center gap-1 active:scale-95 active:opacity-90 transition-all duration-150">
                                <Icon
                                    size={22}
                                    variant={isActive ? "Bold" : "Outline"}
                                    className={`${isActive ? "text-blue-500" : "text-black dark:text-white opacity-70"}`}
                                />
                                <span className={`${isActive ? "text-blue-500" : "text-gray-500 dark:text-gray-400"} text-[clamp(8px,2vw,11px)] font-bold`}>
                                    {m.title}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </div>

            <div className="lg:hidden h-10" />
        </>
    )
}