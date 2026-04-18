'use client'

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, Bell, User, Settings, LogOut, BookOpen, FileText, Home, ShoppingBag, Heart } from "lucide-react";
import {
    Home2,
    Message2,
    Book1,
    DocumentCode,
    Calendar2,
    Document,
} from "iconsax-react";
import NotificationBell from "./NotificationBell";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(num);
};

function UserDropdown({ user, onLogout }: { user: { fullname: string; avatar: string; role: string }; onLogout: () => void }) {
    return (
        <DropdownMenuContent align="end" className="w-55">
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
                <User size={20} className="mr-1 w-4.5 h-4.5" />
                <Link href={`/profile/${user.fullname}`}>Trang cá nhân</Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
                <FileText size={20} className="mr-1 w-4.5 h-4.5" />
                <Link href="/me/transactions">Giao dịch của tôi</Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
                <ShoppingBag size={20} className="mr-1 w-4.5 h-4.5" />
                <Link href="/me/cuahangso/create">Cửa hàng số</Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
                <Heart size={20} className="mr-1 w-4.5 h-4.5" />
                <Link href="/hanhtrinhyethuong">Hành trình yêu thương</Link>
            </DropdownMenuItem>

            {user.role === "admin" && (
                <DropdownMenuItem>
                    <Settings size={20} className="mr-1 w-4.5 h-4.5" />
                    <Link href="/admin/dashboard">Trang quản trị</Link>
                </DropdownMenuItem>
            )}

            {user.role === "teacher" && (
                <DropdownMenuItem>
                    <Settings size={20} className="mr-1 w-4.5 h-4.5" />
                    <Link href="/teacher/dashboard">Trang quản lý</Link>
                </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem>
                <BookOpen size={20} className="mr-1 w-4.5 h-4.5" />
                <Link href="/me/khoahoc">Khoá học của tôi</Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
                <FileText size={20} className="mr-1 w-4.5 h-4.5" />
                <Link href="/me/baiviet">Bài viết của tôi</Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
                <Home size={20} className="mr-1 w-4.5 h-4.5" />
                <Link href="/khuvuonhoctap">Khu vườn học tập</Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
                <ShoppingBag size={20} className="mr-1 w-4.5 h-4.5" />
                <Link href="/nhahangcongnghe">Nhà hàng công nghệ</Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
                <Settings size={20} className="mr-1 w-4.5 h-4.5" />
                <Link href="/me/settings">Cài đặt</Link>
            </DropdownMenuItem>

            <DropdownMenuItem className="text-red-500" onClick={onLogout}>
                <LogOut size={20} className="mr-1 w-4.5 h-4.5" />
                Đăng xuất
            </DropdownMenuItem>
        </DropdownMenuContent>
    );
}

export default function Header() {
    const pathname = usePathname();
    const { setTheme, theme } = useTheme();
    const router = useRouter();
    const { user, logout, token } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = () => {
        logout();
        toast.success('Đã đăng xuất', {
            description: 'Hẹn gặp lại bạn sau!',
            duration: 2000,
        });
        router.push("/");
    };

    const menu = [
        { title: "Trang chủ", link: "/" },
        { title: "Diễn đàn", link: "/forum" },
        { title: "Khoá học", link: "/khoahoc" },
        { title: "Luyện tập", link: "/luyentap" },
        { title: "Sự kiện", link: "/sukien" },
        { title: "Bài viết", link: "/baiviet" },
        { title: "Cửa hàng", link: "/cuahangso" },
    ];

    const menuMobile = [
        { title: "Trang chủ", link: "/", icon: Home2 },
        { title: "Diễn đàn", link: "/forum", icon: Message2 },
        { title: "Khoá học", link: "/khoahoc", icon: Book1 },
        { title: "Luyện tập", link: "/luyentap", icon: DocumentCode },
        { title: "Sự kiện", link: "/sukien", icon: Calendar2 },
        { title: "Bài viết", link: "/baiviet", icon: Document },
        { title: "Cửa hàng", link: "/cuahangso", icon: ShoppingBag },
    ];

    const displayUser = user && token
        ? {
            fullname: user.fullName,
            avatar: user.avatar || "/images/avatar.png",
            role: user.role,
        }
        : null;

    const displayCoins = user?.coins ?? 0;
    const displayStreak = user?.streak ?? 0;

    if (!mounted) {
        return null;
    }

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
                        {menu.map((m) => {
                            const isActive = pathname === m.link;
                            return (
                                <div key={m.link} className="lg:px-1 xl:px-3">
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
                            );
                        })}
                    </div>

                    <div className="mr-1.5 lg:mr-4 flex gap-3 items-center">
                        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-1">
                            <Sun size={20} className="hidden dark:block text-white" />
                            <Moon size={20} className="block dark:hidden" />
                        </button>

                        <div className="flex items-center gap-5 mr-1">
                            <div className="relative flex items-center">
                                <div className="border border-gray-400 dark:border-gray-600 rounded-2xl pl-2 pr-4 py-0.5">
                                    <p className="text-blue-500 dark:text-blue-300 text-[12px] font-medium">{formatNumber(displayCoins)}</p>
                                </div>
                                <Image src="/icons/coins.svg" alt="Coins" width={25} height={25} className="absolute -right-3" />
                            </div>

                            <div className="relative flex items-center">
                                <div className="border border-gray-400 dark:border-gray-600 rounded-2xl pl-2 pr-5 py-0.5">
                                    <p className="text-blue-500 dark:text-blue-300 text-[12px] font-medium">{formatNumber(displayStreak)}</p>
                                </div>
                                <Image src="/icons/streak.svg" alt="Streak" width={27} height={27} className="absolute -right-3" />
                            </div>
                        </div>

                        <NotificationBell />

                        {displayUser ? (
                            <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                    <div className="p-0.5 rounded-full cursor-pointer">
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage src={displayUser.avatar} />
                                            <AvatarFallback>{displayUser.fullname.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                </DropdownMenuTrigger>
                                <UserDropdown user={displayUser} onLogout={handleLogout} />
                            </DropdownMenu>
                        ) : (
                            <Link href="/login" className="bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 rounded-[10px] font-bold text-[14px]">
                                Đăng nhập
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="lg:hidden fixed top-0 w-full h-10 bg-white dark:bg-black z-50 border-b border-gray-200 dark:border-gray-800">
                <div className="flex h-full justify-between items-center px-1.5">
                    <Link href="/">
                        <Image src="/images/logo.png" alt="Logo CNcode" width={60} height={30} className="object-contain" priority />
                    </Link>

                    <div className="flex gap-3 items-center">
                        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                            <Sun size={18} className="hidden dark:block text-white" />
                            <Moon size={18} className="block dark:hidden" />
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="relative flex items-center">
                                <div className="border border-gray-400 dark:border-gray-600 rounded-2xl pl-2 pr-4 py-0.5">
                                    <p className="text-blue-500 dark:text-blue-300 text-[10px] font-medium">{formatNumber(displayCoins)}</p>
                                </div>
                                <Image src="/icons/coins.svg" alt="Coins" width={20} height={20} className="absolute -right-2.5" />
                            </div>

                            <div className="relative flex items-center">
                                <div className="border border-gray-400 dark:border-gray-600 rounded-2xl pl-2 pr-5 py-0.5">
                                    <p className="text-blue-500 dark:text-blue-300 text-[10px] font-medium">{formatNumber(displayStreak)}</p>
                                </div>
                                <Image src="/icons/streak.svg" alt="Streak" width={22} height={22} className="absolute -right-2.5" />
                            </div>
                        </div>

                        <NotificationBell />

                        {displayUser ? (
                            <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                    <Avatar className="w-6 h-6 cursor-pointer">
                                        <AvatarImage src={displayUser.avatar} />
                                        <AvatarFallback>{displayUser.fullname.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <UserDropdown user={displayUser} onLogout={handleLogout} />
                            </DropdownMenu>
                        ) : (
                            <Link href="/login" className="bg-black text-white dark:bg-white dark:text-black px-2 py-1 rounded-[10px] font-bold text-[10px]">
                                Đăng nhập
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="lg:hidden fixed bottom-0 left-0 w-full z-50">
                <div className="w-full h-14 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] flex items-center px-2">
                    {menuMobile.map((m) => {
                        const isActive = pathname === m.link;
                        const Icon = m.icon;
                        return (
                            <Link
                                key={m.link}
                                href={m.link}
                                className="flex-1 flex flex-col items-center justify-center gap-1 active:scale-95 active:opacity-90 transition-all duration-150"
                            >
                                <Icon
                                    size={20}
                                    variant={isActive ? "Bold" : "Outline"}
                                    className={isActive ? "text-blue-500" : "text-gray-500 dark:text-gray-400"}
                                />
                                <span className={`text-[10px] font-medium ${isActive ? "text-blue-500" : "text-gray-500 dark:text-gray-400"}`}>
                                    {m.title}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            <div className="lg:hidden h-10" />
        </>
    );
}