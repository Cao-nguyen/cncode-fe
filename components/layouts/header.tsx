'use client'

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
    User,
    Setting2 as Settings,
    LogoutCurve as LogOut,
    BookSaved as BookOpen,
    Document as FileText,
    Home,
    Heart,
    CloseCircle
} from "iconsax-react";
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
                <User variant="Bold" className="mr-2" style={{ width: 22, height: 22 }} />
                <Link href={`/profile/${user.fullname}`}>Trang cá nhân</Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
                <FileText variant="Bold" className="mr-2" style={{ width: 22, height: 22 }} />
                <Link href="/me/transactions">Giao dịch của tôi</Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
                <Cuahangso variant="Bold" className="mr-2" style={{ width: 22, height: 22 }} />
                <Link href="/me/cuahangso">Cửa hàng số</Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
                <Heart variant="Bold" className="mr-2" style={{ width: 22, height: 22 }} />
                <Link href="/hanhtrinhyethuong">Hành trình yêu thương</Link>
            </DropdownMenuItem>

            {user.role === "admin" && (
                <DropdownMenuItem>
                    <Settings variant="Bold" className="mr-2" style={{ width: 22, height: 22 }} />
                    <Link href="/admin/dashboard">Trang quản trị</Link>
                </DropdownMenuItem>
            )}

            {user.role === "teacher" && (
                <DropdownMenuItem>
                    <Settings variant="Bold" className="mr-2" style={{ width: 22, height: 22 }} />
                    <Link href="/teacher/dashboard">Trang quản lý</Link>
                </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem>
                <BookOpen variant="Bold" className="mr-2" style={{ width: 22, height: 22 }} />
                <Link href="/me/khoahoc">Khoá học của tôi</Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
                <FileText variant="Bold" className="mr-2" style={{ width: 22, height: 22 }} />
                <Link href="/me/baiviet">Bài viết của tôi</Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
                <Home variant="Bold" className="mr-2" style={{ width: 22, height: 22 }} />
                <Link href="/khuvuonhoctap">Khu vườn học tập</Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
                <NhaHang variant="Bold" className="mr-2" style={{ width: 22, height: 22 }} />
                <Link href="/nhahangcongnghe">Nhà hàng công nghệ</Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
                <Settings variant="Bold" className="mr-2" style={{ width: 22, height: 22 }} />
                <Link href="/me/settings">Cài đặt</Link>
            </DropdownMenuItem>

            <DropdownMenuItem className="text-red-500" onClick={onLogout}>
                <LogOut variant="Bold" className="mr-2" style={{ width: 22, height: 22 }} />
                Đăng xuất
            </DropdownMenuItem>
        </DropdownMenuContent>
    );
}

// ─── Mobile Bottom Sheet ──────────────────────────────────────────────────────

interface MobileSheetProps {
    user: { fullname: string; username: string; avatar: string; role: string };
    onLogout: () => void;
    onClose: () => void;
    open: boolean;
}

interface SheetSection {
    label: string;
    items: {
        icon: React.ReactNode;
        title: string;
        subtitle: string;
        href: string;
    }[];
}

function MobileUserSheet({ user, onLogout, onClose, open }: MobileSheetProps) {
    // Dùng position:fixed thay overflow:hidden để tránh layout shift
    useEffect(() => {
        if (open) {
            const scrollY = window.scrollY;
            document.body.style.position = "fixed";
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = "100%";
        } else {
            const scrollY = document.body.style.top;
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";
            if (scrollY) window.scrollTo(0, parseInt(scrollY) * -1);
        }
        return () => {
            const scrollY = document.body.style.top;
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";
            if (scrollY) window.scrollTo(0, parseInt(scrollY) * -1);
        };
    }, [open]);

    const iconSize = { width: 20, height: 20 };

    const sections: SheetSection[] = [
        {
            label: "Tài khoản",
            items: [
                { icon: <User variant="Bold" style={iconSize} />, title: "Trang cá nhân", subtitle: "Xem hồ sơ của bạn", href: `/profile/${user.fullname}` },
                { icon: <FileText variant="Bold" style={iconSize} />, title: "Giao dịch của tôi", subtitle: "Lịch sử giao dịch", href: "/me/transactions" },
                { icon: <Cuahangso variant="Bold" style={iconSize} />, title: "Cửa hàng số", subtitle: "Sản phẩm số của bạn", href: "/me/cuahangso" },
                { icon: <Heart variant="Bold" style={iconSize} />, title: "Hành trình yêu thương", subtitle: "Câu chuyện của bạn", href: "/hanhtrinhyethuong" },
                ...(user.role === "admin" ? [{ icon: <Settings variant="Bold" style={iconSize} />, title: "Trang quản trị", subtitle: "Quản lý hệ thống", href: "/admin/dashboard" }] : []),
                ...(user.role === "teacher" ? [{ icon: <Settings variant="Bold" style={iconSize} />, title: "Trang quản lý", subtitle: "Quản lý lớp học", href: "/teacher/dashboard" }] : []),
            ],
        },
        {
            label: "Học tập",
            items: [
                { icon: <BookOpen variant="Bold" style={iconSize} />, title: "Khoá học của tôi", subtitle: "Tiếp tục học tập", href: "/me/khoahoc" },
                { icon: <FileText variant="Bold" style={iconSize} />, title: "Bài viết của tôi", subtitle: "Quản lý nội dung", href: "/me/baiviet" },
                { icon: <Home variant="Bold" style={iconSize} />, title: "Khu vườn học tập", subtitle: "Không gian của bạn", href: "/khuvuonhoctap" },
                { icon: <NhaHang variant="Bold" style={iconSize} />, title: "Nhà hàng công nghệ", subtitle: "Khám phá công nghệ", href: "/nhahangcongnghe" },
            ],
        },
        {
            label: "Cài đặt",
            items: [
                { icon: <Settings variant="Bold" style={iconSize} />, title: "Cài đặt", subtitle: "Tuỳ chỉnh tài khoản", href: "/me/settings" },
            ],
        },
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            {/* Sheet */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl transition-transform duration-300 ease-out`}
                style={{
                    transform: open ? "translateY(0)" : "translateY(100%)",
                    maxHeight: "85dvh",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                    <div className="w-10 h-1 bg-gray-200 rounded-full" />
                </div>

                {/* Header: Avatar + Info */}
                <div className="px-4 pt-2 pb-4 flex items-center gap-3 flex-shrink-0">
                    <Avatar className="w-12 h-12 border-2 border-gray-100">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="text-base font-bold">{user.fullname?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-bold text-gray-900 truncate">{user.fullname}</p>
                        <p className="text-[12px] text-gray-400 truncate">@{user.username}</p>
                        <span className="inline-block mt-0.5 text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">
                            {user.role}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 flex-shrink-0"
                    >
                        <CloseCircle variant="Bold" style={{ width: 20, height: 20 }} />
                    </button>
                </div>

                <div className="w-full h-px bg-gray-100 flex-shrink-0" />

                {/* Scrollable content */}
                <div className="overflow-y-auto flex-1 pb-6">
                    {sections.map((section) => (
                        <div key={section.label} className="px-4 pt-4">
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                                {section.label}
                            </p>
                            <div className="bg-gray-50 rounded-2xl overflow-hidden">
                                {section.items.map((item, idx) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={onClose}
                                        className={`flex items-center gap-3 px-4 py-3 active:bg-gray-100 transition-colors ${idx < section.items.length - 1 ? "border-b border-gray-100" : ""}`}
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-gray-600 shadow-sm flex-shrink-0">
                                            {item.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-semibold text-gray-800 leading-tight">{item.title}</p>
                                            <p className="text-[11px] text-gray-400 leading-tight truncate">{item.subtitle}</p>
                                        </div>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-gray-300 flex-shrink-0">
                                            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Logout */}
                    <div className="px-4 pt-4">
                        <button
                            onClick={() => { onClose(); onLogout(); }}
                            className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 rounded-2xl active:bg-red-100 transition-colors"
                        >
                            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-red-500 shadow-sm flex-shrink-0">
                                <LogOut variant="Bold" style={{ width: 20, height: 20 }} />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-[13px] font-semibold text-red-500 leading-tight">Đăng xuất</p>
                                <p className="text-[11px] text-red-300 leading-tight">Thoát khỏi tài khoản</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface MenuItem {
    title: string;
    link: string;
}

interface MobileMenuItem {
    title: string;
    link: string;
    icon: Icon;
}

// ─── Main Header ──────────────────────────────────────────────────────────────

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, token, coins } = useAuthStore();
    const [sheetOpen, setSheetOpen] = useState(false);

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
        username: user.username || '',
        avatar: user.avatar || "/images/avatar.png",
        role: user.role || 'user',
    } : null;

    const displayCoins = displayUser ? (coins ?? 0) : 0;
    const displayStreak = displayUser ? (user?.streak ?? 0) : 0;

    return (
        <>
            {/* ── Desktop ── */}
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
                                        className={`px-2.5 py-1.75 font-bold text-[14px] transition-all duration-200 relative ${isActive ? "text-main" : "text-gray-700 hover:text-main"}`}
                                    >
                                        {m.title}
                                    </Link>
                                    {isActive && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-main rounded-t-full" />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="mr-1.5 lg:mr-4 flex gap-3 items-center">
                        {displayUser && (
                            <div className="flex items-center gap-5 mr-1">
                                <div className="relative flex items-center">
                                    <div className="border border-gray-400 rounded-2xl pl-2 pr-4 py-0.5">
                                        <p className="text-main text-[12px] font-medium">{formatNumber(displayCoins)}</p>
                                    </div>
                                    <Image src="/icons/coins.svg" alt="Coins" width={25} height={25} className="absolute -right-3" />
                                </div>
                                <div className="relative flex items-center">
                                    <div className="border border-gray-400 rounded-2xl pl-2 pr-5 py-0.5">
                                        <p className="text-main text-[12px] font-medium">{formatNumber(displayStreak)}</p>
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
                            <Link href="/login" className="bg-main text-white px-3.5 py-2 rounded-[8px] font-bold text-[14px]">
                                Đăng nhập
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Mobile top bar ── */}
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
                                        <p className="text-main text-[10px] font-medium">{formatNumber(displayCoins)}</p>
                                    </div>
                                    <Image src="/icons/coins.svg" alt="Coins" width={20} height={20} className="absolute -right-2.5" />
                                </div>
                                <div className="relative flex items-center">
                                    <div className="border border-gray-400 rounded-2xl pl-2 pr-5 py-0.5">
                                        <p className="text-main text-[10px] font-medium">{formatNumber(displayStreak)}</p>
                                    </div>
                                    <Image src="/icons/streak.svg" alt="Streak" width={22} height={22} className="absolute -right-2.5" />
                                </div>
                            </div>
                        )}

                        <NotificationBell />

                        {displayUser ? (
                            /* Avatar mở bottom sheet thay vì dropdown */
                            <button
                                onClick={() => setSheetOpen(true)}
                                className="focus:outline-none"
                            >
                                <Avatar className="w-6 h-6 cursor-pointer">
                                    <AvatarImage src={displayUser.avatar} />
                                    <AvatarFallback>{displayUser.fullname?.charAt(0) || 'U'}</AvatarFallback>
                                </Avatar>
                            </button>
                        ) : (
                            <Link href="/login" className="bg-main text-white px-2 py-1.5 rounded-[5px] font-bold text-[10px]">
                                Đăng nhập
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Mobile Bottom Sheet ── */}
            {displayUser && (
                <MobileUserSheet
                    user={displayUser}
                    onLogout={handleLogout}
                    onClose={() => setSheetOpen(false)}
                    open={sheetOpen}
                />
            )}

            {/* ── Mobile bottom nav ── */}
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
                                    variant="Bold"
                                    style={{ width: 22, height: 22 }}
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