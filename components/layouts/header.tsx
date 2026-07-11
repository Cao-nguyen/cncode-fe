
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
    Element4,
    SearchNormal1,
} from "iconsax-react";
import { X, Search } from "lucide-react";
import {
    Home as Trangchu,
    Message2 as Diendan,
    Book as Khoahoc,
    DocumentCode as Luyentap,
    Calendar2 as Sukien,
    DocumentText as Baiviet,
    Bag2 as Cuahangso,
    ShoppingBag as NhaHang,
    Briefcase as Huongnghiep,
    Medal as Dautruong,
} from "iconsax-react";
import type { Icon } from "iconsax-react";
import NotificationBell from "./NotificationBell";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth.store";
import { useUnreadMessagesStore } from "@/store/unreadMessages.store";
import { useSocket } from "@/providers/socket.provider";
import { getImageUrl } from "@/lib/utils/imageUrl";
import { userApi } from "@/lib/api/user.api";

const formatNumber = (num: number) =>
    new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(num);

interface MenuItem { title: string; link: string; }
interface MobileMenuItem { title: string; link: string; icon: Icon; }
interface SheetItem { icon: React.ReactNode; title: string; subtitle: string; href: string; }
interface SheetSection { label: string; items: SheetItem[]; }

const menuMobile: MobileMenuItem[] = [
    { title: "Trang chủ", link: "/", icon: Trangchu },
    { title: "Diễn đàn", link: "/forum", icon: Diendan },
    { title: "Khoá học", link: "/khoahoc", icon: Khoahoc },
    { title: "Luyện tập", link: "/luyentap", icon: Luyentap },
    { title: "Sự kiện", link: "/sukien", icon: Sukien },
    { title: "Bài viết", link: "/blog", icon: Baiviet },
    { title: "Cửa hàng", link: "/cuahangso", icon: Cuahangso },
];

const mobileIconMap: Record<string, string> = {
    "/": "/favicon/home.png",
    "/forum": "/favicon/chat.png",
    "/khoahoc": "/favicon/open-book.png",
    "/luyentap": "/favicon/terminal.png",
    "/sukien": "/favicon/appointment.png",
    "/blog": "/favicon/computer.png",
    "/cuahangso": "/favicon/shopping-bag.png",
};

interface MenuGroup {
    label: string;
    items: { icon: string; title: string; subtitle: string; href: string; }[];
}

function buildMenuGroups(): MenuGroup[] {
    return [
        {
            label: "CỘNG ĐỒNG",
            items: [
                { icon: HEADER_MENU_ICONS.ho_tro_du_an, title: "Hỗ trợ dự án", subtitle: "Cùng nhau thực hiện ý tưởng", href: "/hotroduan" },
                { icon: HEADER_MENU_ICONS.hoi_dap, title: "Hỏi đáp (FAQ)", subtitle: "Câu hỏi thường gặp", href: "/faq" },
                { icon: HEADER_MENU_ICONS.truyen_thong_cheo, title: "Truyền thông chéo", subtitle: "Kết nối & chia sẻ", href: "/truyenthongcheo" },
                { icon: HEADER_MENU_ICONS.tiep_thi_lien_ket, title: "Tiếp thị liên kết", subtitle: "Nhận xu từ giới thiệu", href: "/me/affiliate" },
                { icon: HEADER_MENU_ICONS.hanh_trinh_yeu_thuong, title: "Hành trình yêu thương", subtitle: "Câu chuyện của bạn", href: "/hanhtrinhyeuthuong" },
            ],
        },
        {
            label: "NỀN TẢNG",
            items: [
                { icon: HEADER_MENU_ICONS.gop_y, title: "Góp ý", subtitle: "Chia sẻ ý kiến của bạn", href: "/gopy" },
                { icon: HEADER_MENU_ICONS.gia_su_ai, title: "Gia sư AI", subtitle: "Học cùng trí tuệ nhân tạo", href: "/giasuai" },
                { icon: HEADER_MENU_ICONS.chat_voi_admin, title: "Chat với Admin", subtitle: "Liên hệ hỗ trợ", href: "/chatwithadmin" },
            ],
        },
        {
            label: "TIỆN ÍCH",
            items: [
                { icon: HEADER_MENU_ICONS.rut_gon_lien_ket, title: "Rút gọn liên kết", subtitle: "Sở hữu link ngắn", href: "/rutgonlink" },
                { icon: HEADER_MENU_ICONS.cnjobs, title: "CNjobs", subtitle: "Cơ hội việc làm", href: "/cnjobs" },
                { icon: HEADER_MENU_ICONS.cnsocial, title: "CNsocial", subtitle: "Mạng xã hội cộng đồng", href: "/cnsocial" },
                { icon: HEADER_MENU_ICONS.huong_nghiep, title: "Hướng nghiệp", subtitle: "Định hướng tương lai", href: "/huongnghiep" },
            ],
        },
        {
            label: "HỌC TẬP",
            items: [
                { icon: HEADER_MENU_ICONS.khoa_hoc_cua_toi, title: "Khoá học của tôi", subtitle: "Tiếp tục học tập", href: "/me/khoahoc" },
                { icon: HEADER_MENU_ICONS.bai_viet_cua_toi, title: "Bài viết của tôi", subtitle: "Quản lý nội dung", href: "/me/blog" },
                { icon: HEADER_MENU_ICONS.cnbooks, title: "CNbooks", subtitle: "Thư viện sách số", href: "/cnbooks" },
                { icon: HEADER_MENU_ICONS.khu_vuon_hoc_tap, title: "Khu vườn học tập", subtitle: "Không gian của bạn", href: "/khuvuonhoctap" },
                { icon: HEADER_MENU_ICONS.dau_truong_hoc_tap, title: "Đấu trường học tập", subtitle: "Thử thách và leo rank", href: "/dautruonghoctap" },
            ],
        },
    ];
}

function buildSections(
    user: { username: string; role: string },
    iconSize: { width: number; height: number }
): SheetSection[] {
    return [
        {
            label: "Tài khoản",
            items: [
                { icon: <Image src={HEADER_MENU_ICONS.trang_ca_nhan} alt="Trang cá nhân" width={iconSize.width} height={iconSize.height} />, title: "Trang cá nhân", subtitle: "Xem hồ sơ của bạn", href: `/p/${user.username}` },
                { icon: <Image src={HEADER_MENU_ICONS.kho_qua_tang} alt="Kho quà" width={iconSize.width} height={iconSize.height} />, title: "Kho quà của tôi", subtitle: "Quản lý quà tặng", href: "/me/shop" },
                ...(user.role === "admin" ? [{ icon: <Image src={HEADER_MENU_ICONS.trang_quan_tri} alt="Quản trị" width={iconSize.width} height={iconSize.height} />, title: "Trang quản trị", subtitle: "Quản lý hệ thống", href: "/admin/dashboard" }] : []),
                ...(user.role === "teacher" ? [{ icon: <Image src={HEADER_MENU_ICONS.trang_quan_li} alt="Quản lý" width={iconSize.width} height={iconSize.height} />, title: "Trang quản lý", subtitle: "Quản lý lớp học", href: "/quanly" }] : []),
                { icon: <Image src={HEADER_MENU_ICONS.lich_su_giao_dich} alt="Lịch sử" width={iconSize.width} height={iconSize.height} />, title: "Lịch sử giao dịch", subtitle: "Xem các giao dịch của bạn", href: "/me/lichsugiaodich" },
            ],
        },
        {
            label: "Cài đặt",
            items: [
                { icon: <Image src={HEADER_MENU_ICONS.cai_dat} alt="Cài đặt" width={iconSize.width} height={iconSize.height} />, title: "Cài đặt", subtitle: "Tuỳ chỉnh tài khoản", href: "/me/settings" },
            ],
        },
    ];
}

const ROLE_BADGE: Record<string, string> = {
    admin: "bg-red-50 text-red-500",
    teacher: "bg-blue-50 text-blue-500",
    student: "bg-green-50 text-[var(--cn-success)]",
    user: "bg-gray-100 text-gray-500",
};

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

interface DrawerProps {
    user: { fullname: string; username: string; avatar: string; role: string };
    onLogout: () => void;
    onClose: () => void;
    open: boolean;
}

function DesktopUserDrawer({ user, onLogout, onClose, open }: DrawerProps) {
    const drawerRef = useRef<HTMLDivElement>(null);
    const iconSize = { width: 22, height: 22 };
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
                className="fixed top-0 right-0 bottom-0 z-[70] w-[308px] bg-[var(--cn-bg-card)] border-l border-[var(--cn-border)] shadow-[var(--cn-shadow-lg)] flex flex-col transition-transform duration-300 will-change-transform"
                style={{
                    transform: open ? "translateX(0)" : "translateX(100%)",
                }}
            >
                <div className="p-5 border-b border-[var(--cn-border)] flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                            <Avatar className="w-12 h-12 border-2 border-[var(--cn-border)]">
                                <AvatarImage src={getImageUrl(user.avatar)} />
                                <AvatarFallback className="text-[15px] font-bold bg-[var(--cn-primary)] text-white">
                                    {user.fullname?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-green-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[var(--cn-text-main)] truncate">{user.fullname}</p>
                            <p className="text-xs text-[var(--cn-text-muted)] truncate mt-0.5">@{user.username}</p>
                            <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${badgeClass}`}>
                                {user.role}
                            </span>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--cn-bg-section)] hover:bg-[var(--cn-hover)] transition-colors text-[var(--cn-text-muted)] flex-shrink-0"
                        >
                            <CloseCircle variant="Bold" className="w-[18px] h-[18px]" />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar p-3">
                    {sections.map((section) => (
                        <div key={section.label} className="mb-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wider px-1 mb-1.5 text-[var(--cn-text-muted)]">
                                {section.label}
                            </p>
                            <div className="rounded-2xl overflow-hidden bg-[var(--cn-bg-section)] border border-[var(--cn-border)]">
                                {section.items.map((item, idx) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={onClose}
                                        className={`flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--cn-hover)] transition-colors ${idx < section.items.length - 1 ? "border-b border-[var(--cn-border)]" : ""}`}
                                    >
                                        <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-white text-[var(--cn-primary)] shadow-sm flex-shrink-0">
                                            {item.icon}
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
                            onClose();
                            onLogout();
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
    );
}

interface MobileSheetProps {
    user: { fullname: string; username: string; avatar: string; role: string };
    onLogout: () => void;
    onClose: () => void;
    open: boolean;
}

function MobileUserSheet({ user, onLogout, onClose, open }: MobileSheetProps) {
    const iconSize = { width: 24, height: 24 };
    const sections = buildSections(user, iconSize);
    const badgeClass = ROLE_BADGE[user.role] ?? "bg-gray-100 text-gray-500";

    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const sheetRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        if (!open) return;

        const handleTouchStart = (e: TouchEvent) => {
            const target = e.target as HTMLElement;

            const isAtTop = contentRef.current?.scrollTop === 0;

            if (sheetRef.current?.contains(target) && isAtTop) {
                setStartY(e.touches[0].clientY);
                setIsDragging(true);
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isDragging) return;
            const deltaY = e.touches[0].clientY - startY;
            if (deltaY > 0 && sheetRef.current) {
                e.preventDefault();
                setCurrentY(deltaY);
                sheetRef.current.style.transform = `translateY(${deltaY}px)`;
                sheetRef.current.style.transition = 'none';
            }
        };

        const handleTouchEnd = () => {
            if (!isDragging) return;
            setIsDragging(false);

            const deltaY = currentY;
            if (sheetRef.current) {
                sheetRef.current.style.transition = 'transform 0.3s ease-out';
                if (deltaY > 100) {
                    sheetRef.current.style.transform = 'translateY(100%)';
                    setTimeout(() => {
                        onClose();
                        if (sheetRef.current) {
                            sheetRef.current.style.transform = '';
                            sheetRef.current.style.transition = '';
                        }
                    }, 300);
                } else {
                    sheetRef.current.style.transform = 'translateY(0)';
                    setTimeout(() => {
                        if (sheetRef.current) {
                            sheetRef.current.style.transition = '';
                        }
                    }, 300);
                }
                setCurrentY(0);
            }
        };

        const sheetElement = sheetRef.current;
        sheetElement?.addEventListener('touchstart', handleTouchStart);
        sheetElement?.addEventListener('touchmove', handleTouchMove, { passive: false });
        sheetElement?.addEventListener('touchend', handleTouchEnd);

        return () => {
            sheetElement?.removeEventListener('touchstart', handleTouchStart);
            sheetElement?.removeEventListener('touchmove', handleTouchMove);
            sheetElement?.removeEventListener('touchend', handleTouchEnd);
        };
    }, [open, isDragging, startY, currentY, onClose]);

    if (!open) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300"
                style={{ opacity: open ? 1 : 0 }}
                onClick={onClose}
            />
            <div
                ref={sheetRef}
                className="fixed bottom-0 left-0 right-0 z-[70] bg-[var(--cn-bg-card)] rounded-t-3xl flex flex-col transition-transform duration-300 will-change-transform"
                style={{
                    transform: open ? "translateY(0)" : "translateY(100%)",
                    maxHeight: "85dvh",
                }}
            >
                { }
                <div
                    className="flex justify-center pt-3 pb-1 flex-shrink-0"
                    onTouchStart={(e) => {

                        if (contentRef.current?.scrollTop === 0) {
                            const touch = e.touches[0];
                            setStartY(touch.clientY);
                            setIsDragging(true);
                        }
                    }}
                    onTouchMove={(e) => {
                        if (!isDragging) return;
                        const deltaY = e.touches[0].clientY - startY;
                        if (deltaY > 0 && sheetRef.current) {
                            e.preventDefault();
                            setCurrentY(deltaY);
                            sheetRef.current.style.transform = `translateY(${deltaY}px)`;
                            sheetRef.current.style.transition = 'none';
                        }
                    }}
                    onTouchEnd={() => {
                        if (!isDragging) return;
                        setIsDragging(false);
                        const deltaY = currentY;
                        if (sheetRef.current) {
                            sheetRef.current.style.transition = 'transform 0.3s ease-out';
                            if (deltaY > 100) {
                                sheetRef.current.style.transform = 'translateY(100%)';
                                setTimeout(() => {
                                    onClose();
                                    if (sheetRef.current) {
                                        sheetRef.current.style.transform = '';
                                        sheetRef.current.style.transition = '';
                                    }
                                }, 300);
                            } else {
                                sheetRef.current.style.transform = 'translateY(0)';
                                setTimeout(() => {
                                    if (sheetRef.current) {
                                        sheetRef.current.style.transition = '';
                                    }
                                }, 300);
                            }
                            setCurrentY(0);
                        }
                    }}
                >
                    <div className="w-10 h-1 bg-[var(--cn-border)] rounded-full" />
                </div>

                <div className="px-4 pt-2 pb-4 flex items-center gap-3 flex-shrink-0">
                    <div className="relative flex-shrink-0">
                        <Avatar className="w-12 h-12 border-2 border-[var(--cn-border)]">
                            <AvatarImage src={getImageUrl(user.avatar)} />
                            <AvatarFallback className="text-base font-bold bg-[var(--cn-primary)] text-white">
                                {user.fullname?.charAt(0) || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-bold text-[var(--cn-text-main)] truncate">{user.fullname}</p>
                        <p className="text-xs text-[var(--cn-text-muted)] truncate">@{user.username}</p>
                        <span className={`inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${badgeClass}`}>
                            {user.role}
                        </span>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--cn-bg-section)] text-[var(--cn-text-muted)] flex-shrink-0">
                        <CloseCircle variant="Bold" className="w-5 h-5" />
                    </button>
                </div>

                <div className="w-full h-px bg-[var(--cn-border)] flex-shrink-0" />

                <div
                    ref={contentRef}
                    className="flex-1 overflow-y-auto no-scrollbar pb-6"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    {sections.map((section) => (
                        <div key={section.label} className="px-4 pt-4">
                            <p className="text-[11px] font-semibold text-[var(--cn-text-muted)] uppercase tracking-wider mb-2 px-1">
                                {section.label}
                            </p>
                            <div className="bg-[var(--cn-bg-section)] rounded-2xl overflow-hidden border border-[var(--cn-border)]">
                                {section.items.map((item, idx) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={onClose}
                                        className={`flex items-center gap-3 px-4 py-3 active:bg-[var(--cn-hover)] transition-colors ${idx < section.items.length - 1 ? "border-b border-[var(--cn-border)]" : ""}`}
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[var(--cn-primary)] shadow-sm flex-shrink-0">
                                            {item.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-semibold text-[var(--cn-text-main)]">{item.title}</p>
                                            <p className="text-[11px] text-[var(--cn-text-muted)] truncate mt-0.5">{item.subtitle}</p>
                                        </div>
                                        <ArrowRight2 variant="Bold" className="w-3.5 h-3.5 text-[var(--cn-text-muted)] flex-shrink-0" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="px-4 pt-4 pb-8">
                        <button
                            onClick={() => {
                                onClose();
                                setTimeout(() => onLogout(), 350);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl active:bg-red-100 transition-colors"
                            style={{ background: "#fff1f2", border: "1px solid #fecdd3" }}
                        >
                            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-red-500 shadow-sm flex-shrink-0">
                                <img src={HEADER_MENU_ICONS.dang_xuat} alt="Đăng xuất" className="w-5 h-5" />
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
    const { getTotalUnread } = useUnreadMessagesStore();
    const [sheetOpen, setSheetOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activeStreakIcon, setActiveStreakIcon] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const mobileDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!menuOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuOpen]);

    useEffect(() => {
        if (!mobileMenuOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target as Node)) {
                setMobileMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [mobileMenuOpen]);

    const unreadCount = getTotalUnread();

    const displayCoins = user && token ? (coins ?? 0) : 0;
    const displayStreak = user && token ? (user?.streak ?? 0) : 0;
    const displayRole = user?.role || "user";

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

            }
        };

        const interval = setInterval(checkTokenValidity, 30000);
        return () => clearInterval(interval);
    }, [router]);

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

                // Activate streak icon animation
                setActiveStreakIcon(true);
                setTimeout(() => setActiveStreakIcon(false), 3000);
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
        { title: "Bài viết", link: "/blog" },
        { title: "Cửa hàng số", link: "/cuahangso" },
    ];

    const displayUser = user && token ? {
        fullname: user.fullName || "Người dùng",
        username: user.username || "",
        avatar: user.avatar || "/images/avatar.png",
        role: displayRole,
    } : null;

    // Avatar error debugging
    useEffect(() => {
        if (displayUser) {
            const testImage = new window.Image();
            testImage.onload = () => console.log('✅ Avatar loaded successfully:', displayUser.avatar);
            testImage.onerror = (e) => console.error('❌ Avatar failed to load:', displayUser.avatar, e);
            testImage.src = getImageUrl(displayUser.avatar);
        }
    }, [displayUser?.avatar]);

    // Increment streak when user loads the page
    // DISABLED: Backend endpoint /api/users/increment-streak not available (404 error)
    useEffect(() => {
        const incrementDailyStreak = async () => {
            if (!user || !token) {
                console.log('❌ Streak: No user or token');
                return;
            }

            console.log('🔄 Attempting to increment streak for user:', user._id);
            try {
                // Temporarily disabled due to missing backend endpoint
                console.log('⚠️ Streak increment disabled - backend endpoint not available');
                return;

                // const result = await userApi.incrementStreak(token);
                // console.log('✅ Streak increment result:', result);

                // if (result.success && result.data) {
                //     const { streak, coins, alreadyCompleted } = result.data;

                //     // Update local state with server values
                //     if (streak !== user.streak) {
                //         updateStreak(streak);
                //     }

                //     // Update coins if changed
                //     const currentCoins = user.coins || 0;
                //     if (coins !== currentCoins) {
                //         const diff = coins - currentCoins;
                //         updateCoins(diff);
                //     }

                //     // Show animation only if actually incremented (not already completed)
                //     if (!alreadyCompleted) {
                //         setActiveStreakIcon(true);
                //         setTimeout(() => setActiveStreakIcon(false), 3000);
                //     }
                // }
            } catch (error) {
                // Silent fail - streak increment is not critical
                console.error('❌ Failed to increment streak:', error);
            }
        };

        incrementDailyStreak();
    }, [user?._id, token, updateStreak, updateCoins]); // Only run when user logs in or page loads

    return (
        <>
            <header className="hidden lg:block bg-[var(--cn-bg-card)] w-full h-[60px] fixed top-0 z-50 shadow-[var(--cn-shadow-sm)]">
                <div className="flex h-full justify-between items-center px-4">
                    <div className="flex-shrink-0 relative group mr-2.5">
                        <Link href="/">
                            <img src="/images/logo.png" alt="Logo CNcode" width={100} height={55} />
                        </Link>
                    </div>
                    <nav className="flex h-full items-center gap-5">
                        {menuMobile.map((item) => {
                            const isActive = item.link === '/' ? pathname === item.link : pathname.startsWith(item.link);
                            const showBadge = item.link === '/forum' && unreadCount > 0;
                            const iconSrc = mobileIconMap[item.link] || "/favicon/home.png";
                            return (
                                <div key={item.link} className="relative h-full flex items-center group">
                                    <Link
                                        href={item.link}
                                        className={`relative px-7 py-2 rounded-lg transition-all duration-200 ${isActive ? "text-[var(--cn-primary)]" : "text-[var(--cn-text-sub)] hover:text-[var(--cn-primary)] hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                                    >
                                        <img
                                            src={iconSrc}
                                            alt={item.title}
                                            className="w-[23px] h-[23px]"
                                            style={{
                                                filter: isActive
                                                    ? 'brightness(0) saturate(100%) invert(27%) sepia(87%) saturate(2000%) hue-rotate(200deg) brightness(95%) contrast(90%)'
                                                    : 'grayscale(100%)',
                                                opacity: isActive ? 1 : 0.5
                                            }}
                                        />
                                    </Link>
                                    {showBadge && (
                                        <span className="absolute top-2 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg" />
                                    )}
                                    {isActive && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--cn-primary)]" />}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                                        {item.title}
                                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                                    </div>
                                </div>
                            );
                        })}
                    </nav>
                    <div className="flex items-center gap-4">
                        <div className="relative inline-block" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="relative p-1.5 lg:p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-950/30 dark:hover:to-indigo-950/30 transition-all duration-200 group"
                                aria-label="Layout"
                            >
                                <Element4
                                    variant="Bold"
                                    className="w-4 lg:w-5 h-4 lg:h-5 text-[var(--cn-text-sub)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                                />
                            </button>

                            {menuOpen && (
                                <>
                                    {/* Mobile backdrop */}
                                    <div
                                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                                        onClick={() => setMenuOpen(false)}
                                    />

                                    {/* Menu panel - mobile sidebar, desktop dropdown */}
                                    <div className="fixed inset-y-0 right-0 w-full max-w-md
                                        md:absolute md:inset-y-auto md:right-0 md:mt-3 md:w-96 md:max-w-[420px]
                                        bg-[var(--cn-bg-card)] border-l md:border border-[var(--cn-border)]
                                        md:rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 z-50 overflow-hidden
                                        animate-[slideInRight_0.3s_ease-out] md:animate-[slideDown_0.2s_ease-out]">
                                        {/* Header of menu */}
                                        <div className="p-4 border-b border-[var(--cn-border)]">
                                            <h3 className="text-base font-bold text-[var(--cn-text-main)]">Menu</h3>
                                        </div>
                                        {/* Search Bar */}
                                        <div className="p-4 pb-3">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="Tìm kiếm menu..."
                                                    className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                />
                                                {searchQuery && (
                                                    <button
                                                        onClick={() => setSearchQuery("")}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
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
                                                    className={`absolute -right-3 drop-shadow-md transition-all duration-300 ${activeStreakIcon ? 'scale-110 animate-bounce' : ''}`}
                                                />
                                            </div>
                                        </div>
                                        {/* Menu Items */}
                                        <div className="p-4 pt-0 max-h-[calc(100vh-280px)] overflow-y-auto">
                                            {buildMenuGroups()
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
                                                                onClick={() => {
                                                                    setMenuOpen(false);
                                                                    setSearchQuery("");
                                                                }}
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
                                                            </Link>
                                                        ))}
                                                        {groupIdx < groups.length - 1 && (
                                                            <div className="h-px bg-[var(--cn-border)] my-3" />
                                                        )}
                                                    </div>
                                                ))}
                                            {buildMenuGroups().every(group =>
                                                group.items.every(item => !item.title.toLowerCase().includes(searchQuery.toLowerCase()))
                                            ) && searchQuery && (
                                                    <div className="text-center py-8 text-gray-400 text-sm">
                                                        Không tìm thấy kết quả cho {`"${searchQuery}"`}
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <NotificationBell />
                        {displayUser ? (
                            <button onClick={() => setDrawerOpen(true)} className="relative p-0.5 rounded-full focus:outline-none group">
                                <Avatar key={displayUser.avatar} className="w-8 h-8 ring-2 ring-[var(--cn-border)] group-hover:ring-[var(--cn-primary)]/30 transition-all">
                                    <AvatarImage src={getImageUrl(displayUser.avatar)} />
                                    <AvatarFallback className="text-xs font-bold bg-[var(--cn-primary)] text-white">
                                        {displayUser.fullname?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                            </button>
                        ) : (
                            <Link href="/login" className="bg-[var(--cn-primary)] text-white px-4 py-2 rounded-[var(--cn-radius-sm)] font-bold text-sm">Đăng nhập</Link>
                        )}
                    </div>
                </div>
            </header>

            <div className="lg:hidden fixed top-0 w-full h-10 bg-[var(--cn-bg-card)] z-50 border-b border-[var(--cn-border)]">
                <div className="flex h-full justify-between items-center px-2">
                    <div className="relative mr-2.5">
                        <Link href="/">
                            <img src="/images/logo.png" alt="Logo" width={60} height={30} className="object-contain" />
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative inline-block" ref={mobileDropdownRef}>
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="relative p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-950/30 dark:hover:to-indigo-950/30 transition-all duration-200 group"
                                aria-label="Layout"
                            >
                                <Element4
                                    variant="Bold"
                                    className="w-4 h-4 text-[var(--cn-text-sub)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                                />
                            </button>

                            {mobileMenuOpen && (
                                <>
                                    {/* Mobile backdrop */}
                                    <div
                                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                                        onClick={() => setMobileMenuOpen(false)}
                                    />

                                    {/* Menu panel - mobile sidebar, desktop dropdown */}
                                    <div className="fixed inset-y-0 right-0 w-full flex flex-col
                                        md:absolute md:inset-y-auto md:right-0 md:mt-3 md:w-80 md:max-w-[320px]
                                        bg-[var(--cn-bg-card)] border-l md:border border-[var(--cn-border)]
                                        md:rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 z-50 overflow-hidden
                                        animate-[slideInRight_0.3s_ease-out] md:animate-[slideDown_0.2s_ease-out]">
                                        {/* Header of menu */}
                                        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-[var(--cn-border)]">
                                            <h3 className="text-base font-bold text-[var(--cn-text-main)]">Menu</h3>
                                            <button
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                                aria-label="Đóng"
                                            >
                                                <X className="w-5 h-5 text-gray-500" />
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
                                                    className={`absolute -right-3 drop-shadow-md transition-all duration-300 ${activeStreakIcon ? 'scale-110 animate-bounce' : ''}`}
                                                />
                                            </div>
                                        </div>
                                        {/* Search Bar */}
                                        <div className="p-4 pb-3">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="Tìm kiếm menu..."
                                                    className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                />
                                                {searchQuery && (
                                                    <button
                                                        onClick={() => setSearchQuery("")}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {/* Menu Items */}
                                        <div className="p-4 pt-0 flex-1 overflow-y-auto">
                                            {buildMenuGroups()
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
                                                                onClick={() => {
                                                                    setMobileMenuOpen(false);
                                                                    setSearchQuery("");
                                                                }}
                                                                className="flex items-center gap-3 px-3 py-2.5 mb-1.5 rounded-xl hover:bg-[var(--cn-bg-section)] active:bg-[var(--cn-bg-section)] transition-all duration-200"
                                                            >
                                                                <Image
                                                                    src={item.icon}
                                                                    alt={item.title}
                                                                    width={32}
                                                                    height={32}
                                                                    className="flex-shrink-0"
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-semibold text-[var(--cn-text-main)]">{item.title}</p>
                                                                    <p className="text-xs text-[var(--cn-text-muted)] truncate">{item.subtitle}</p>
                                                                </div>
                                                            </Link>
                                                        ))}
                                                        {groupIdx < groups.length - 1 && (
                                                            <div className="h-px bg-[var(--cn-border)] my-3" />
                                                        )}
                                                    </div>
                                                ))}
                                            {buildMenuGroups().every(group =>
                                                group.items.every(item => !item.title.toLowerCase().includes(searchQuery.toLowerCase()))
                                            ) && searchQuery && (
                                                    <div className="text-center py-8 text-gray-400 text-sm">
                                                        Không tìm thấy kết quả cho {`"${searchQuery}"`}
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <NotificationBell />
                        {displayUser ? (
                            <button onClick={() => setSheetOpen(true)} className="relative">
                                <Avatar className="w-6 h-6 ring-2 ring-[var(--cn-border)]">
                                    <AvatarImage src={getImageUrl(displayUser.avatar)} />
                                    <AvatarFallback className="text-[10px] font-bold bg-[var(--cn-primary)] text-white">
                                        {displayUser.fullname?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-green-500 rounded-full border border-white" />
                            </button>
                        ) : (
                            <Link href="/login" className="bg-[var(--cn-primary)] text-white px-2 py-1 rounded text-[10px] font-bold">Đăng nhập</Link>
                        )}
                    </div>
                </div>
            </div>

            {displayUser && <DesktopUserDrawer user={displayUser} onLogout={handleLogout} onClose={() => setDrawerOpen(false)} open={drawerOpen} />}
            {displayUser && <MobileUserSheet user={displayUser} onLogout={handleLogout} onClose={() => setSheetOpen(false)} open={sheetOpen} />}

            <div className="lg:hidden fixed bottom-0 left-0 w-full z-40">
                <div className="w-full h-14 bg-[var(--cn-bg-card)] border-t border-[var(--cn-border)] rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] flex items-center px-2">
                    {menuMobile.map((item) => {
                        const isActive = item.link === '/' ? pathname === item.link : pathname.startsWith(item.link);
                        const showBadge = item.link === '/forum' && unreadCount > 0;
                        const iconSrc = mobileIconMap[item.link] || "/favicon/home.png";
                        return (
                            <div key={item.link} className="relative flex-1 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all">
                                <Link href={item.link} className="w-full h-full flex flex-col items-center justify-center gap-1">
                                    <div className="relative">
                                        <img
                                            src={iconSrc}
                                            alt={item.title}
                                            className={`w-5 h-5 ${isActive ? "opacity-100" : "opacity-50"}`}
                                            style={{
                                                filter: isActive
                                                    ? 'brightness(0) saturate(100%) invert(27%) sepia(87%) saturate(2000%) hue-rotate(200deg) brightness(95%) contrast(90%)'
                                                    : 'grayscale(100%)'
                                            }}
                                        />
                                        {showBadge && (
                                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                        )}
                                    </div>
                                    <span className={`text-[10px] font-medium ${isActive ? "text-[var(--cn-primary)]" : "text-[var(--cn-text-muted)]"}`}>{item.title}</span>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="lg:hidden h-10" />
        </>
    );
}
