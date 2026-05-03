// components/layouts/header.tsx
'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
    User,
    Setting2 as Settings,
    LogoutCurve as LogOut,
    BookSaved as BookOpen,
    Document as FileText,
    Home,
    Heart,
    CloseCircle,
    ArrowRight2,
    ArchiveBox,
    BoxSearch,
    Briefcase,
    Global,
    GlobalSearch,
    ArchiveBook,
    DeviceMessage,
    Message,
    Link1,
    Clock,
    Coin1,
    MessageProgramming,
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
import { useAuthStore } from "@/store/auth.store";
import { useSocket } from "@/providers/socket.provider";

const formatNumber = (num: number) =>
    new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(num);

interface MenuItem { title: string; link: string; }
interface MobileMenuItem { title: string; link: string; icon: Icon; }
interface SheetItem { icon: React.ReactNode; title: string; subtitle: string; href: string; }
interface SheetSection { label: string; items: SheetItem[]; }

function buildSections(
    user: { fullname: string; role: string },
    iconSize: { width: number; height: number }
): SheetSection[] {
    return [
        {
            label: "Tài khoản",
            items: [
                { icon: <User variant="Bold" style={iconSize} />, title: "Trang cá nhân", subtitle: "Xem hồ sơ của bạn", href: `/profile/${user.fullname}` },
                ...(user.role === "admin" ? [{ icon: <Settings variant="Bold" style={iconSize} />, title: "Trang quản trị", subtitle: "Quản lý hệ thống", href: "/admin/dashboard" }] : []),
                ...(user.role === "teacher" ? [{ icon: <Settings variant="Bold" style={iconSize} />, title: "Trang quản lý", subtitle: "Quản lý lớp học", href: "/teacher/dashboard" }] : []),
                { icon: <Clock variant="Bold" style={iconSize} />, title: "Lịch sử giao dịch", subtitle: "Xem các giao dịch của bạn", href: "/me/transactions" },
                { icon: <Coin1 variant="Bold" style={iconSize} />, title: "Ưu đãi của tôi", subtitle: "Voucher & ưu đãi", href: "/me/voucher" },
            ],
        },
        {
            label: "Cộng đồng",
            items: [
                { icon: <Heart variant="Bold" style={iconSize} />, title: "Hành trình yêu thương", subtitle: "Câu chuyện của bạn", href: "/hanhtrinhyethuong" },
                { icon: <NhaHang variant="Bold" style={iconSize} />, title: "Tiếp thị liên kết", subtitle: "Nhận xu từ giới thiệu", href: "/affiliate" },
                { icon: <ArchiveBox variant="Bold" style={iconSize} />, title: "Góp ý", subtitle: "Chia sẻ ý kiến của bạn", href: "/gopy" },
                { icon: <BoxSearch variant="Bold" style={iconSize} />, title: "Hỏi đáp (FAQ)", subtitle: "Câu hỏi thường gặp", href: "/faq" },
                { icon: <MessageProgramming variant="Bold" style={iconSize} />, title: "Hỗ trợ dự án", subtitle: "Cùng nhau thực hiện ý tưởng", href: "/hotroduan" },
                { icon: <Global variant="Bold" style={iconSize} />, title: "Truyền thông chéo", subtitle: "Kết nối & chia sẻ", href: "/truyenthongcheo" },
            ],
        },
        {
            label: "Tiện ích",
            items: [
                { icon: <Link1 variant="Bold" style={iconSize} />, title: "Rút gọn liên kết", subtitle: "Sở hữu link ngắn", href: "/rutgonlink" },
                { icon: <Message variant="Bold" style={iconSize} />, title: "Gia sư AI", subtitle: "Học cùng trí tuệ nhân tạo", href: "/giasu-ai" },
                { icon: <DeviceMessage variant="Bold" style={iconSize} />, title: "Chat với Admin", subtitle: "Liên hệ hỗ trợ", href: "/chat-admin" },
                { icon: <Briefcase variant="Bold" style={iconSize} />, title: "CNjobs", subtitle: "Cơ hội việc làm", href: "/cnjobs" },
                { icon: <GlobalSearch variant="Bold" style={iconSize} />, title: "CNsocial", subtitle: "Mạng xã hội cộng đồng", href: "/cnsocial" },
            ],
        },
        {
            label: "Học tập",
            items: [
                { icon: <ArchiveBook variant="Bold" style={iconSize} />, title: "CNbooks", subtitle: "Thư viện sách số", href: "/cnbooks" },
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
}

const ROLE_BADGE: Record<string, string> = {
    admin: "bg-red-50 text-red-500",
    teacher: "bg-blue-50 text-blue-500",
    student: "bg-green-50 text-green-600",
    user: "bg-gray-100 text-gray-500",
};

interface DrawerProps {
    user: { fullname: string; username: string; avatar: string; role: string };
    onLogout: () => void;
    onClose: () => void;
    open: boolean;
}

function DesktopUserDrawer({ user, onLogout, onClose, open }: DrawerProps) {
    const drawerRef = useRef<HTMLDivElement>(null);
    const iconSize = { width: 18, height: 18 };
    const sections = buildSections(user, iconSize);
    const badgeClass = ROLE_BADGE[user.role] ?? "bg-gray-100 text-gray-500";

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        const timer = setTimeout(() => document.addEventListener("mousedown", handler), 100);
        return () => {
            clearTimeout(timer);
            document.removeEventListener("mousedown", handler);
        };
    }, [open, onClose]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onClose]);

    return (
        <>
            <div
                onClick={onClose}
                className="fixed inset-0 z-[60] bg-black/20 transition-opacity duration-300"
                style={{
                    opacity: open ? 1 : 0,
                    pointerEvents: open ? "auto" : "none",
                }}
            />
            <div
                ref={drawerRef}
                className="fixed top-0 right-0 bottom-0 z-[70] w-[308px] bg-white border-l border-gray-100 shadow-[-4px_0_24px_rgba(0,0,0,0.08)] flex flex-col transition-transform duration-300 will-change-transform"
                style={{
                    transform: open ? "translateX(0)" : "translateX(100%)",
                }}
            >
                <div className="p-5 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                            <Avatar className="w-12 h-12 border-2 border-gray-100">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback className="text-[15px] font-bold bg-main text-white">
                                    {user.fullname?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-green-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{user.fullname}</p>
                            <p className="text-xs text-gray-400 truncate mt-0.5">@{user.username}</p>
                            <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${badgeClass}`}>
                                {user.role}
                            </span>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-400 flex-shrink-0"
                        >
                            <CloseCircle variant="Bold" className="w-[18px] h-[18px]" />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar p-3">
                    {sections.map((section) => (
                        <div key={section.label} className="mb-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wider px-1 mb-1.5 text-gray-400">
                                {section.label}
                            </p>
                            <div className="rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                                {section.items.map((item, idx) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={onClose}
                                        className={`flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 transition-colors ${idx < section.items.length - 1 ? "border-b border-gray-100" : ""}`}
                                    >
                                        <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-white text-main shadow-sm flex-shrink-0">
                                            {item.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-semibold text-gray-800 truncate">{item.title}</p>
                                            <p className="text-[11px] text-gray-400 truncate mt-0.5">{item.subtitle}</p>
                                        </div>
                                        <ArrowRight2 variant="Bold" className="w-3 h-3 text-gray-300 flex-shrink-0" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={() => {
                            onClose();
                            onLogout();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-red-100 transition-colors"
                        style={{ background: "#fff1f2", border: "1px solid #fecdd3" }}
                    >
                        <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-white text-red-500 shadow-sm flex-shrink-0">
                            <LogOut variant="Bold" className="w-[18px] h-[18px]" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-[13px] font-semibold text-red-500">Đăng xuất</p>
                            <p className="text-[11px] text-red-300 mt-0.5">Thoát khỏi tài khoản</p>
                        </div>
                    </button>
                </div>
            </div>
        </>
    );
}

interface MobileSheetProps {
    user: { fullname: string; username: string; avatar: string; role: string };
    onLogout: () => void;
    onClose: () => void;
    open: boolean;
}

function MobileUserSheet({ user, onLogout, onClose, open }: MobileSheetProps) {
    const iconSize = { width: 20, height: 20 };
    const sections = buildSections(user, iconSize);
    const badgeClass = ROLE_BADGE[user.role] ?? "bg-gray-100 text-gray-500";

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
            if (!open) {
                const scrollY = document.body.style.top;
                document.body.style.position = "";
                document.body.style.top = "";
                document.body.style.width = "";
                if (scrollY) window.scrollTo(0, parseInt(scrollY) * -1);
            }
        };
    }, [open]);

    if (!open) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300"
                style={{ opacity: open ? 1 : 0 }}
                onClick={onClose}
            />
            <div
                className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl flex flex-col transition-transform duration-300 will-change-transform"
                style={{
                    transform: open ? "translateY(0)" : "translateY(100%)",
                    maxHeight: "85dvh",
                }}
            >
                <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                    <div className="w-10 h-1 bg-gray-300 rounded-full" />
                </div>
                <div className="px-4 pt-2 pb-4 flex items-center gap-3 flex-shrink-0">
                    <div className="relative flex-shrink-0">
                        <Avatar className="w-12 h-12 border-2 border-gray-100">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-base font-bold bg-main text-white">
                                {user.fullname?.charAt(0) || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-bold text-gray-900 truncate">{user.fullname}</p>
                        <p className="text-xs text-gray-400 truncate">@{user.username}</p>
                        <span className={`inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${badgeClass}`}>
                            {user.role}
                        </span>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 flex-shrink-0">
                        <CloseCircle variant="Bold" className="w-5 h-5" />
                    </button>
                </div>
                <div className="w-full h-px bg-gray-100 flex-shrink-0" />
                <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
                    {sections.map((section) => (
                        <div key={section.label} className="px-4 pt-4">
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                                {section.label}
                            </p>
                            <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                                {section.items.map((item, idx) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={onClose}
                                        className={`flex items-center gap-3 px-4 py-3 active:bg-gray-100 transition-colors ${idx < section.items.length - 1 ? "border-b border-gray-100" : ""}`}
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-main shadow-sm flex-shrink-0">
                                            {item.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-semibold text-gray-800">{item.title}</p>
                                            <p className="text-[11px] text-gray-400 truncate mt-0.5">{item.subtitle}</p>
                                        </div>
                                        <ArrowRight2 variant="Bold" className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="px-4 pt-4">
                        <button
                            onClick={() => {
                                onClose();
                                setTimeout(() => onLogout(), 350);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl active:bg-red-100 transition-colors"
                            style={{ background: "#fff1f2", border: "1px solid #fecdd3" }}
                        >
                            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-red-500 shadow-sm flex-shrink-0">
                                <LogOut variant="Bold" className="w-5 h-5" />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-[13px] font-semibold text-red-500">Đăng xuất</p>
                                <p className="text-[11px] text-red-300 mt-0.5">Thoát khỏi tài khoản</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, token, coins, updateCoins, updateStreak, setUser } = useAuthStore();
    const { socket, isConnected } = useSocket();
    const [sheetOpen, setSheetOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const displayCoins = user && token ? (coins ?? 0) : 0;
    const displayStreak = user && token ? (user?.streak ?? 0) : 0;
    const displayRole = user?.role || "user";

    // Kiểm tra token validity định kỳ
    useEffect(() => {
        const checkTokenValidity = async () => {
            const currentToken = localStorage.getItem('token');
            if (!currentToken) return;

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${currentToken}` },
                });

                if (!res.ok) {
                    const { logout: storeLogout } = useAuthStore.getState();
                    storeLogout();
                    router.push('/login');
                }
            } catch {
                // Lỗi mạng, bỏ qua
            }
        };

        const interval = setInterval(checkTokenValidity, 30000);
        return () => clearInterval(interval);
    }, [router]);

    // Lắng nghe force logout từ socket
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleForceLogout = () => {
            const { logout: storeLogout } = useAuthStore.getState();
            storeLogout();
            router.push('/login');
        };

        socket.on('force_logout', handleForceLogout);
        return () => { socket.off('force_logout', handleForceLogout); };
    }, [socket, isConnected, router]);

    useEffect(() => {
        if (!socket || !isConnected) return;
        const handleCoinsUpdated = (data: { userId: string; coins: number; amount?: number }) => {
            if (user?._id === data.userId) {
                const diff = data.coins - (user?.coins || 0);
                updateCoins(diff);
            }
        };
        socket.on("coins_updated", handleCoinsUpdated);
        return () => { socket.off("coins_updated", handleCoinsUpdated); };
    }, [socket, isConnected, user?._id, user?.coins, updateCoins]);

    useEffect(() => {
        if (!socket || !isConnected) return;
        const handleStreakUpdated = (data: { userId: string; streak: number; totalCoins: number }) => {
            if (user?._id === data.userId) {
                updateStreak(data.streak);
                const diff = data.totalCoins - (user?.coins || 0);
                if (diff !== 0) updateCoins(diff);
            }
        };
        socket.on("streak_updated", handleStreakUpdated);
        return () => { socket.off("streak_updated", handleStreakUpdated); };
    }, [socket, isConnected, user?._id, user?.coins, updateStreak, updateCoins]);

    useEffect(() => {
        if (!socket || !isConnected) return;
        const handleRoleChanged = (data: { userId: string; newRole: string; oldRole: string }) => {
            if (user?._id === data.userId && data.newRole !== user?.role) {
                if (user) setUser({ ...user, role: data.newRole as "user" | "teacher" | "admin" });
            }
        };
        socket.on("role_changed", handleRoleChanged);
        return () => { socket.off("role_changed", handleRoleChanged); };
    }, [socket, isConnected, user, setUser]);

    const handleLogout = async () => {
        await logout();
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
        fullname: user.fullName || "Người dùng",
        username: user.username || "",
        avatar: user.avatar || "/images/avatar.png",
        role: displayRole,
    } : null;

    return (
        <>
            <header className="hidden lg:block bg-white w-full h-[60px] fixed top-0 z-50 shadow-sm">
                <div className="flex h-full justify-between items-center px-4">
                    <Link href="/" className="flex-shrink-0">
                        <Image src="/images/logo.png" alt="Logo CNcode" width={100} height={55} priority />
                    </Link>
                    <nav className="flex h-full items-center gap-1">
                        {menu.map((item) => {
                            const isActive = pathname === item.link;
                            return (
                                <div key={item.link} className="relative h-full flex items-center">
                                    <Link
                                        href={item.link}
                                        className={`px-3 py-2 font-bold text-sm transition-all duration-200 ${isActive ? "text-main" : "text-gray-700 hover:text-main"}`}
                                    >
                                        {item.title}
                                    </Link>
                                    {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-main" />}
                                </div>
                            );
                        })}
                    </nav>
                    <div className="flex items-center gap-4">
                        {displayUser && (
                            <div className="flex items-center gap-4">
                                <div className="relative flex items-center">
                                    <div className="border border-gray-300 rounded-2xl pl-2 pr-4 py-0.5">
                                        <p className="text-main text-xs font-medium">{formatNumber(displayCoins)}</p>
                                    </div>
                                    <Image src="/icons/coins.svg" alt="Coins" width={25} height={25} className="absolute -right-3" />
                                </div>
                                <div className="relative flex items-center">
                                    <div className="border border-gray-300 rounded-2xl pl-2 pr-5 py-0.5">
                                        <p className="text-main text-xs font-medium">{formatNumber(displayStreak)}</p>
                                    </div>
                                    <Image src="/icons/streak.svg" alt="Streak" width={27} height={27} className="absolute -right-3" />
                                </div>
                            </div>
                        )}
                        <NotificationBell />
                        {displayUser ? (
                            <button onClick={() => setDrawerOpen(true)} className="relative p-0.5 rounded-full focus:outline-none group">
                                <Avatar className="w-8 h-8 ring-2 ring-transparent group-hover:ring-main/30 transition-all">
                                    <AvatarImage src={displayUser.avatar} />
                                    <AvatarFallback className="text-xs font-bold bg-main text-white">
                                        {displayUser.fullname?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                            </button>
                        ) : (
                            <Link href="/login" className="bg-main text-white px-4 py-2 rounded-lg font-bold text-sm">Đăng nhập</Link>
                        )}
                    </div>
                </div>
            </header>

            <div className="lg:hidden fixed top-0 w-full h-10 bg-white z-50 border-b border-gray-200">
                <div className="flex h-full justify-between items-center px-2">
                    <Link href="/">
                        <Image src="/images/logo.png" alt="Logo" width={60} height={30} className="object-contain" priority />
                    </Link>
                    <div className="flex items-center gap-3">
                        {displayUser && (
                            <div className="flex items-center gap-3">
                                {/* FIX: Tăng gap và thêm margin để coins và streak không dính nhau */}
                                <div className="relative flex items-center">
                                    <div className="border border-gray-300 rounded-2xl pl-1.5 pr-3 py-0.5">
                                        <p className="text-main text-[10px] font-medium">{formatNumber(displayCoins)}</p>
                                    </div>
                                    <Image src="/icons/coins.svg" alt="Coins" width={18} height={18} className="absolute -right-2" />
                                </div>
                                <div className="relative flex items-center">
                                    <div className="border border-gray-300 rounded-2xl pl-1.5 pr-4 py-0.5">
                                        <p className="text-main text-[10px] font-medium">{formatNumber(displayStreak)}</p>
                                    </div>
                                    <Image src="/icons/streak.svg" alt="Streak" width={20} height={20} className="absolute -right-2" />
                                </div>
                            </div>
                        )}
                        <NotificationBell />
                        {displayUser ? (
                            <button onClick={() => setSheetOpen(true)} className="relative">
                                <Avatar className="w-6 h-6">
                                    <AvatarImage src={displayUser.avatar} />
                                    <AvatarFallback className="text-[10px] font-bold bg-main text-white">
                                        {displayUser.fullname?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-green-500 rounded-full border border-white" />
                            </button>
                        ) : (
                            <Link href="/login" className="bg-main text-white px-2 py-1 rounded text-[10px] font-bold">Đăng nhập</Link>
                        )}
                    </div>
                </div>
            </div>

            {displayUser && <DesktopUserDrawer user={displayUser} onLogout={handleLogout} onClose={() => setDrawerOpen(false)} open={drawerOpen} />}
            {displayUser && <MobileUserSheet user={displayUser} onLogout={handleLogout} onClose={() => setSheetOpen(false)} open={sheetOpen} />}

            <div className="lg:hidden fixed bottom-0 left-0 w-full z-40">
                <div className="w-full h-14 bg-white border-t border-gray-200 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] flex items-center px-2">
                    {menuMobile.map((item) => {
                        const isActive = pathname === item.link;
                        const IconComp = item.icon;
                        return (
                            <Link key={item.link} href={item.link} className="flex-1 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all">
                                <IconComp variant="Bold" className={`w-5 h-5 ${isActive ? "text-main" : "text-gray-500"}`} />
                                <span className={`text-[10px] font-medium ${isActive ? "text-main" : "text-gray-500"}`}>{item.title}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
            <div className="lg:hidden h-10" />
        </>
    );
}