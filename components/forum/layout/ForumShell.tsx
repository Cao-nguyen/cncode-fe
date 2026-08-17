'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Element4, CloseCircle, ArrowRight2 } from 'iconsax-react';
import { X } from 'lucide-react';
import ForumNavRail from './ForumNavRail';
import ForumMobileNav from './ForumMobileNav';
import NotificationBell from '@/components/layouts/NotificationBell';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth.store';
import { getAvatarUrl, avatarImageProps } from '@/lib/utils/imageUrl';
import Image from 'next/image';
import Link from 'next/link';

interface ForumShellProps {
    children: React.ReactNode;
}

const HEADER_MENU_ICONS: Record<string, string> = {
    "trang_ca_nhan": "/header_menu/trang_ca_nhan.png",
    "kho_qua_tang": "/header_menu/kho_qua_tang.png",
    "trang_quan_tri": "/header_menu/trang_quan_tri.png",
    "trang_quan_li": "/header_menu/trang_quan_li.png",
    "lich_su_giao_dich": "/header_menu/lich_su_giao_dich.png",
    "hanh_trinh_yeu_thuong": "/header_menu/hanh_trinh_yeu_thuong.png",
    "tiep_thi_lien_ket": "/header_menu/tiep_thi_lien_ket.png",
    "gop_y": "/header_menu/gop_y.png",
    "hoi_dap": "/header_menu/hoi_dap.png",
    "ho_tro_du_an": "/header_menu/ho_tro_du_an.png",
    "truyen_thong_cheo": "/header_menu/truyen_thong_cheo.png",
    "rut_gon_lien_ket": "/header_menu/rut_gon_lien_ket.png",
    "gia_su_ai": "/header_menu/gia_su_ai.png",
    "chat_voi_admin": "/header_menu/chat_voi_admin.png",
    "cnjobs": "/header_menu/cnjobs.png",
    "cnsocial": "/header_menu/cnsocial.png",
    "cnbooks": "/header_menu/cnbooks.png",
    "huong_nghiep": "/header_menu/huong_nghiep.png",
    "khu_vuon_hoc_tap": "/header_menu/khu_vuon_hoc_tap.png",
    "dau_truong_hoc_tap": "/header_menu/dau_truong_hoc_tap.png",
    "bai_viet_cua_toi": "/header_menu/bai_viet_cua_toi.png",
    "cai_dat": "/header_menu/cai_dat.png",
    "dang_xuat": "/header_menu/dang_xuat.png",
    "khoa_hoc_cua_toi": "/header_menu/khoa_hoc_cua_toi.png",
};

const ROLE_BADGE: Record<string, string> = {
    admin: "bg-red-50 text-red-500",
    teacher: "bg-blue-50 text-blue-500",
    student: "bg-green-50 text-[var(--cn-success)]",
    user: "bg-gray-100 text-gray-500",
};

function buildMenuGroups(user: { username: string; role: string }) {
    const iconSize = { width: 22, height: 22 };
    return [
        {
            label: "Tài khoản",
            items: [
                { icon: HEADER_MENU_ICONS.trang_ca_nhan, title: "Trang cá nhân", subtitle: "Xem hồ sơ của bạn", href: `/p/${user.username}` },
                { icon: HEADER_MENU_ICONS.kho_qua_tang, title: "Kho quà của tôi", subtitle: "Quản lý quà tặng", href: "/me/shop" },
                ...(user.role === "admin" ? [{ icon: HEADER_MENU_ICONS.trang_quan_tri, title: "Trang quản trị", subtitle: "Quản lý hệ thống", href: "/admin/dashboard" }] : []),
                ...(user.role === "teacher" ? [{ icon: HEADER_MENU_ICONS.trang_quan_li, title: "Trang quản lý", subtitle: "Quản lý lớp học", href: "/quanly" }] : []),
                { icon: HEADER_MENU_ICONS.lich_su_giao_dich, title: "Lịch sử giao dịch", subtitle: "Xem các giao dịch của bạn", href: "/me/lichsugiaodich" },
            ],
        },
        {
            label: "Cài đặt",
            items: [
                { icon: HEADER_MENU_ICONS.cai_dat, title: "Cài đặt", subtitle: "Tuỳ chỉnh tài khoản", href: "/me/settings" },
            ],
        },
    ];
}

export default function ForumShell({ children }: ForumShellProps) {
    const router = useRouter();
    const { user, logout, token, coins } = useAuthStore();
    const [menuOpen, setMenuOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const drawerRef = useRef<HTMLDivElement>(null);

    const displayCoins = user && token ? (coins ?? 0) : 0;
    const displayStreak = user && token ? (user?.streak ?? 0) : 0;
    const displayRole = user?.role || "user";

    const displayUser = user && token ? {
        fullname: user.fullName || "Người dùng",
        username: user.username || "",
        avatar: user.avatar || "/images/avatar.png",
        role: displayRole,
    } : null;

    const handleLogout = async () => {
        await logout();
        router.push("/");
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const menuButton = target.closest('[aria-label="Menu"]');
            const notificationButton = target.closest('[aria-label="Thông báo"]');
            const avatarButton = target.closest('[aria-label="Avatar"]');
            
            if (!menuButton && !notificationButton && !avatarButton && menuOpen) {
                setMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpen]);

    // Close drawer when clicking outside
    useEffect(() => {
        if (!drawerOpen) return;
        const handler = (e: MouseEvent) => {
            if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
                setDrawerOpen(false);
            }
        };
        const timer = setTimeout(() => document.addEventListener("mousedown", handler), 100);
        return () => {
            clearTimeout(timer);
            document.removeEventListener("mousedown", handler);
        };
    }, [drawerOpen]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setMenuOpen(false);
                setDrawerOpen(false);
            }
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, []);

    return (
        <div className="fixed inset-0 flex flex-col overflow-hidden bg-[var(--cn-bg-main)]">
            {/* Forum Header */}
            <div className="flex items-center gap-3 px-4 py-2 border-b border-[var(--cn-border)] bg-[var(--cn-bg-card)]">
                <div className="flex items-center gap-3">
                    <Link href="/" className="relative">
                        <img src="/images/logo.png" alt="Logo CNcode" width={100} height={55} />
                    </Link>
                </div>

                <div className="flex-1" />

                <div className="flex items-center gap-4">
                    {/* Menu Dropdown */}
                    <div className="relative inline-block">
                        <button
                            type="button"
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="relative p-1.5 lg:p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-950/30 dark:hover:to-indigo-950/30 transition-all duration-200 group"
                            aria-label="Menu"
                        >
                            <Element4
                                variant="Bold"
                                className="w-4 lg:w-5 h-4 lg:h-5 text-[var(--cn-text-sub)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                            />
                        </button>

                        {menuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                                    onClick={() => setMenuOpen(false)}
                                />
                                <div className="fixed inset-y-0 right-0 w-full max-w-md
                                    md:absolute md:inset-y-auto md:right-0 md:mt-3 md:w-96 md:max-w-[420px]
                                    bg-[var(--cn-bg-card)] border-l md:border border-[var(--cn-border)]
                                    md:rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 z-50 overflow-hidden">
                                    <div className="p-4 border-b border-[var(--cn-border)] flex items-center justify-between">
                                        <h3 className="text-base font-bold text-[var(--cn-text-main)]">Menu</h3>
                                        <button
                                            onClick={() => setMenuOpen(false)}
                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--cn-bg-section)] hover:bg-[var(--cn-hover)] transition-colors text-[var(--cn-text-muted)]"
                                        >
                                            <CloseCircle variant="Bold" className="w-[18px] h-[18px]" />
                                        </button>
                                    </div>

                                    {/* Coins and Streak */}
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="relative flex items-center">
                                            <div className="border border-[var(--cn-border)] rounded-2xl pl-3 pr-6 py-1.5">
                                                <p className="text-[var(--cn-primary)] text-sm font-medium">{displayCoins}</p>
                                            </div>
                                            <img src="/icons/coins.svg" alt="Coins" width={30} height={30} className="absolute -right-3" />
                                        </div>
                                        <div className="relative flex items-center">
                                            <div className="border border-orange-300 bg-orange-50 dark:bg-orange-950/20 rounded-2xl pl-3 pr-7 py-1.5 shadow-sm shadow-orange-200/50">
                                                <p className="text-orange-600 dark:text-orange-400 text-sm font-bold">{displayStreak}</p>
                                            </div>
                                            <img
                                                src={displayStreak > 0 ? "/icons/streak-1.svg" : "/icons/streak.svg"}
                                                alt="Streak"
                                                width={35}
                                                height={35}
                                                className="absolute -right-3 drop-shadow-md"
                                            />
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="p-4 pt-0 max-h-[calc(100vh-280px)] overflow-y-auto">
                                        {buildMenuGroups(displayUser || { username: '', role: 'user' })
                                            .map(group => ({
                                                ...group,
                                                items: group.items.filter(item =>
                                                    item.title.toLowerCase().includes(searchQuery.toLowerCase())
                                                )
                                            }))
                                            .filter(group => group.items.length > 0)
                                            .map((group, groupIdx, groups) => (
                                                <div key={group.label} className={groupIdx < groups.length - 1 ? "mb-3" : ""}>
                                                    <p className="text-[10px] font-bold text-[var(--cn-text-muted)] mb-2 px-1">{group.label}</p>
                                                    {group.items.map((item, idx) => (
                                                        <Link
                                                            key={item.href}
                                                            href={item.href}
                                                            onClick={() => setMenuOpen(false)}
                                                            className="flex items-center gap-3 px-3 py-2.5 mb-1.5 rounded-xl hover:bg-[var(--cn-bg-section)] transition-all duration-200"
                                                        >
                                                            <Image
                                                                src={item.icon}
                                                                alt={item.title}
                                                                width={40}
                                                                height={40}
                                                                className="flex-shrink-0"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-[var(--cn-text-main)]">{item.title}</p>
                                                                <p className="text-xs text-[var(--cn-text-muted)] truncate">{item.subtitle}</p>
                                                            </div>
                                                            <ArrowRight2 variant="Bold" className="w-3 h-3 text-[var(--cn-text-muted)] flex-shrink-0" />
                                                        </Link>
                                                    ))}
                                                    {groupIdx < groups.length - 1 && (
                                                        <div className="h-px bg-[var(--cn-border)] my-3" />
                                                    )}
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <NotificationBell onOpen={() => setMenuOpen(false)} />
                    {displayUser ? (
                        <div className="relative inline-block">
                            <button
                                onClick={() => setDrawerOpen(true)}
                                aria-label="Avatar"
                                className="relative p-0.5 rounded-full focus:outline-none group"
                            >
                                <Avatar className="w-8 h-8 ring-2 ring-[var(--cn-border)] group-hover:ring-[var(--cn-primary)]/30 transition-all">
                                    <AvatarImage src={getAvatarUrl(displayUser.avatar)} {...avatarImageProps} />
                                    <AvatarFallback className="text-xs font-bold bg-[var(--cn-primary)] text-white">
                                        {displayUser.fullname?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                            </button>

                            {drawerOpen && (
                                <>
                                    <div
                                        onClick={() => setDrawerOpen(false)}
                                        className="fixed inset-0 z-[60] bg-black/20 transition-opacity duration-300"
                                        style={{
                                            opacity: drawerOpen ? 1 : 0,
                                            pointerEvents: drawerOpen ? "auto" : "none",
                                        }}
                                    />
                                    <div
                                        ref={drawerRef}
                                        className="fixed top-0 right-0 bottom-0 z-[70] w-[308px] bg-[var(--cn-bg-card)] border-l border-[var(--cn-border)] shadow-[var(--cn-shadow-lg)] flex flex-col transition-transform duration-300 will-change-transform"
                                        style={{
                                            transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
                                        }}
                                    >
                                        <div className="p-5 border-b border-[var(--cn-border)] flex-shrink-0">
                                            <div className="flex items-center gap-3">
                                                <div className="relative flex-shrink-0">
                                                    <Avatar className="w-12 h-12 border-2 border-[var(--cn-border)]">
                                                        <AvatarImage src={getAvatarUrl(displayUser.avatar)} {...avatarImageProps} />
                                                        <AvatarFallback className="text-[15px] font-bold bg-[var(--cn-primary)] text-white">
                                                            {displayUser.fullname?.charAt(0) || "U"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-green-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-[var(--cn-text-main)] truncate">{displayUser.fullname}</p>
                                                    <p className="text-xs text-[var(--cn-text-muted)] truncate mt-0.5">@{displayUser.username}</p>
                                                    <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${ROLE_BADGE[displayUser.role] ?? "bg-gray-100 text-gray-500"}`}>
                                                        {displayUser.role}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => setDrawerOpen(false)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--cn-bg-section)] hover:bg-[var(--cn-hover)] transition-colors text-[var(--cn-text-muted)] flex-shrink-0"
                                                >
                                                    <CloseCircle variant="Bold" className="w-[18px] h-[18px]" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex-1 overflow-y-auto no-scrollbar p-3">
                                            {buildMenuGroups(displayUser).map((section) => (
                                                <div key={section.label} className="mb-3">
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider px-1 mb-1.5 text-[var(--cn-text-muted)]">
                                                        {section.label}
                                                    </p>
                                                    <div className="rounded-2xl overflow-hidden bg-[var(--cn-bg-section)] border border-[var(--cn-border)]">
                                                        {section.items.map((item, idx) => (
                                                            <Link
                                                                key={item.href}
                                                                href={item.href}
                                                                onClick={() => setDrawerOpen(false)}
                                                                className={`flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--cn-hover)] transition-colors ${idx < section.items.length - 1 ? "border-b border-[var(--cn-border)]" : ""}`}
                                                            >
                                                                <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-white text-[var(--cn-primary)] shadow-sm flex-shrink-0">
                                                                    <Image
                                                                        src={item.icon}
                                                                        alt={item.title}
                                                                        width={18}
                                                                        height={18}
                                                                    />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-[13px] font-semibold text-[var(--cn-text-main)] truncate">{item.title}</p>
                                                                    <p className="text-[11px] text-[var(--cn-text-muted)] truncate mt-0.5">{item.subtitle}</p>
                                                                </div>
                                                                <ArrowRight2 variant="Bold" className="w-3 h-3 text-[var(--cn-text-muted)] flex-shrink-0" />
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    setDrawerOpen(false);
                                                    handleLogout();
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-red-100 transition-colors"
                                                style={{ background: "#fff1f2", border: "1px solid #fecdd3" }}
                                            >
                                                <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-white text-red-500 shadow-sm flex-shrink-0">
                                                    <img src={HEADER_MENU_ICONS.dang_xuat} alt="Đăng xuất" className="w-[18px] h-[18px]" />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <p className="text-[13px] font-semibold text-red-500">Đăng xuất</p>
                                                    <p className="text-[11px] text-red-300 mt-0.5">Thoát khỏi tài khoản</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className="bg-[var(--cn-primary)] text-white px-4 py-2 rounded-[var(--cn-radius-sm)] font-bold text-sm">Đăng nhập</Link>
                    )}
                </div>
            </div>

            <div className="flex min-h-0 flex-1">
                <ForumNavRail />

                <main className="min-h-0 flex-1 overflow-hidden pb-16 md:pb-0">
                    {children}
                </main>
            </div>

            <ForumMobileNav />
        </div>
    );
}
