'use client'

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { User, Settings, LogOut, BookOpen, FileText, Home, Heart } from "lucide-react";
import {
    Home as Trangchu,
    Message2 as Diendan,
    Book as Khoahoc,
    DocumentCode as Luyentap,
    Calendar2 as Sukien,
    DocumentText as Baiviet,
    Bag2 as Cuahangso,
    ShoppingBag as NhaHang,
} from "iconsax-react";
import type { Icon } from "iconsax-react";
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
import { useState, useEffect } from "react";

const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(num);
};

interface UserDropdownProps {
    user: { fullname: string; avatar: string; role: string };
    onLogout: () => void;
}

function UserDropdown({ user, onLogout }: UserDropdownProps) {
    return (
        <DropdownMenuContent align="end" className="w-55">
            <div className="flex items-center gap-3 px-2 py-2">
                <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.fullname?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-bold">{user.fullname}</p>
                    <p className="text-xs text-gray-500">Tài khoản: {user.role}</p>
                </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
                <User size={18} strokeWidth={1.5} className="mr-1" />
                <Link href={`/profile/${user.fullname}`}>Trang cá nhân</Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
                <FileText size={18} strokeWidth={1.5} className="mr-1" />
                <Link href="/me/transactions">Giao dịch của tôi</Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
                <Cuahangso size={18} variant="Outline" className="mr-1" />
                <Link href="/me/cuahangso">Cửa hàng số</Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
                <Heart size={18} strokeWidth={1.5} className="mr-1" />
                <Link href="/hanhtrinhyethuong">Hành trình yêu thương</Link>
            </DropdownMenuItem>

            {user.role === "admin" && (
                <DropdownMenuItem>
                    <Settings size={18} strokeWidth={1.5} className="mr-1" />
                    <Link href="/admin/dashboard">Trang quản trị</Link>
                </DropdownMenuItem>
            )}

            {user.role === "teacher" && (
                <DropdownMenuItem>
                    <Settings size={18} strokeWidth={1.5} className="mr-1" />
                    <Link href="/teacher/dashboard">Trang quản lý</Link>
                </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem>
                <BookOpen size={18} strokeWidth={1.5} className="mr-1" />
                <Link href="/me/khoahoc">Khoá học của tôi</Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
                <FileText size={18} strokeWidth={1.5} className="mr-1" />
                <Link href="/me/baiviet">Bài viết của tôi</Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
                <Home size={18} strokeWidth={1.5} className="mr-1" />
                <Link href="/khuvuonhoctap">Khu vườn học tập</Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
                <NhaHang size={18} variant="Outline" className="mr-1" />
                <Link href="/nhahangcongnghe">Nhà hàng công nghệ</Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
                <Settings size={18} strokeWidth={1.5} className="mr-1" />
                <Link href="/me/settings">Cài đặt</Link>
            </DropdownMenuItem>

            <DropdownMenuItem className="text-red-500" onClick={onLogout}>
                <LogOut size={18} strokeWidth={1.5} className="mr-1" />
                Đăng xuất
            </DropdownMenuItem>
        </DropdownMenuContent>
    );
}

interface MenuItem {
    title: string;
    link: string;
}

interface MobileMenuItem {
    title: string;
    link: string;
    icon: Icon;
}

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, token, coins } = useAuthStore();

    const handleLogout = () => {
        logout();
        toast.success('Đã đăng xuất', {
            description: 'Hẹn gặp lại bạn sau!',
            duration: 2000,
        });
        router.push("/");
    };

    const menu: MenuItem[] = [
        { title: "Trang chủ", link: "/" },
        { title: "Diễn đàn", link: "/forum" },
        { title: "Khoá học", link: "/khoahoc" },
        { title: "Luyện tập", link: "/luyentap" },
        { title: "Sự kiện", link: "/sukien" },
        { title: "Bài viết", link: "/baiviet" },
        { title: "Cửa hàng", link: "/cuahangso" },
    ];

    const menuMobile: MobileMenuItem[] = [
        { title: "Trang chủ", link: "/", icon: Trangchu },
        { title: "Diễn đàn", link: "/forum", icon: Diendan },
        { title: "Khoá học", link: "/khoahoc", icon: Khoahoc },
        { title: "Luyện tập", link: "/luyentap", icon: Luyentap },
        { title: "Sự kiện", link: "/sukien", icon: Sukien },
        { title: "Bài viết", link: "/baiviet", icon: Baiviet },
        { title: "Cửa hàng", link: "/cuahangso", icon: Cuahangso },
    ];

    const displayUser = user && token ? {
        fullname: user.fullName || 'Người dùng',
        avatar: user.avatar || "/images/avatar.png",
        role: user.role || 'user',
    } : null;

    const displayCoins = displayUser ? (coins ?? 0) : 0;
    const displayStreak = displayUser ? (user?.streak ?? 0) : 0;

    return (
        <>
            {/* Desktop */}
            <div className="hidden lg:block bg-white w-full h-15 fixed top-0 z-50 shadow-sm">
                <div className="flex h-full justify-between items-center">
                    <div className="ml-1.5 lg:ml-4">
                        <Link href="/">
                            <Image src="/images/logo.png" alt="Logo CNcode" width={100} height={55} priority />
                        </Link>
                    </div>

                    <div className="flex h-full items-center">
                        {menu.map((m) => {
                            const isActive = pathname === m.link;
                            return (
                                <div key={m.link} className="relative lg:px-1 xl:px-3 h-full flex items-center">
                                    <Link
                                        href={m.link}
                                        className={`
                                            px-2.5 py-1.75 font-bold text-[14px] transition-all duration-200
                                            ${isActive
                                                ? "text-main"
                                                : "text-gray-700 hover:text-main"
                                            }
                                            relative
                                        `}
                                    >
                                        {m.title}
                                    </Link>
                                    {isActive && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-main rounded-t-full" />
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-main rounded-t-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                                </div>
                            );
                        })}
                    </div>

                    <div className="mr-1.5 lg:mr-4 flex gap-3 items-center">
                        {displayUser && (
                            <div className="flex items-center gap-5 mr-1">
                                <div className="relative flex items-center">
                                    <div className="border border-gray-400 rounded-2xl pl-2 pr-4 py-0.5">
                                        <p className="text-main text-[12px] font-medium">
                                            {formatNumber(displayCoins)}
                                        </p>
                                    </div>
                                    <Image src="/icons/coins.svg" alt="Coins" width={25} height={25} className="absolute -right-3" />
                                </div>

                                <div className="relative flex items-center">
                                    <div className="border border-gray-400 rounded-2xl pl-2 pr-5 py-0.5">
                                        <p className="text-main text-[12px] font-medium">
                                            {formatNumber(displayStreak)}
                                        </p>
                                    </div>
                                    <Image src="/icons/streak.svg" alt="Streak" width={27} height={27} className="absolute -right-3" />
                                </div>
                            </div>
                        )}

                        <NotificationBell />

                        {displayUser ? (
                            <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                    <div className="p-0.5 rounded-full cursor-pointer">
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage src={displayUser.avatar} />
                                            <AvatarFallback>{displayUser.fullname?.charAt(0) || 'U'}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                </DropdownMenuTrigger>
                                <UserDropdown user={displayUser} onLogout={handleLogout} />
                            </DropdownMenu>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-main text-white px-3.5 py-2 rounded-[8px] font-bold text-[14px]"
                            >
                                Đăng nhập
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile top bar */}
            <div className="lg:hidden fixed top-0 w-full h-10 bg-white z-50 border-b border-gray-200">
                <div className="flex h-full justify-between items-center px-1.5">
                    <Link href="/">
                        <Image src="/images/logo.png" alt="Logo CNcode" width={60} height={30} className="object-contain" priority />
                    </Link>

                    <div className="flex gap-3 items-center">
                        {displayUser && (
                            <div className="flex items-center gap-3">
                                <div className="relative flex items-center">
                                    <div className="border border-gray-400 rounded-2xl pl-2 pr-4 py-0.5">
                                        <p className="text-main text-[10px] font-medium">
                                            {formatNumber(displayCoins)}
                                        </p>
                                    </div>
                                    <Image src="/icons/coins.svg" alt="Coins" width={20} height={20} className="absolute -right-2.5" />
                                </div>

                                <div className="relative flex items-center">
                                    <div className="border border-gray-400 rounded-2xl pl-2 pr-5 py-0.5">
                                        <p className="text-main text-[10px] font-medium">
                                            {formatNumber(displayStreak)}
                                        </p>
                                    </div>
                                    <Image src="/icons/streak.svg" alt="Streak" width={22} height={22} className="absolute -right-2.5" />
                                </div>
                            </div>
                        )}

                        <NotificationBell />

                        {displayUser ? (
                            <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                    <Avatar className="w-6 h-6 cursor-pointer">
                                        <AvatarImage src={displayUser.avatar} />
                                        <AvatarFallback>{displayUser.fullname?.charAt(0) || 'U'}</AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <UserDropdown user={displayUser} onLogout={handleLogout} />
                            </DropdownMenu>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-main text-white px-2 py-1.5 rounded-[5px] font-bold text-[10px]"
                            >
                                Đăng nhập
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile bottom nav */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full z-50">
                <div className="w-full h-14 bg-white border-t border-gray-200 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] flex items-center px-2">
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
                                    variant="Bold"
                                    className={isActive ? "text-main" : "text-gray-500"}
                                />
                                <span className={`text-[10px] font-medium ${isActive ? "text-main" : "text-gray-500"}`}>
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