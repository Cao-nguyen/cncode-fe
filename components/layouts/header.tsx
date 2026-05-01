'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
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
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatNumber = (num: number) =>
    new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(num);

// ─── Types ────────────────────────────────────────────────────────────────────

interface MenuItem { title: string; link: string; }
interface MobileMenuItem { title: string; link: string; icon: Icon; }
interface SheetItem { icon: React.ReactNode; title: string; subtitle: string; href: string; }
interface SheetSection { label: string; items: SheetItem[]; }

// ─── Shared sections builder ───────────────────────────────────────────────────

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
                { icon: <NhaHang variant="Bold" style={iconSize} />, title: "Tiếp thị liên kết", subtitle: "Affiliate & hoa hồng", href: "/me/tiepthilienket" },
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

// ─── Desktop Right Drawer ─────────────────────────────────────────────────────

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
        const t = setTimeout(() => document.addEventListener("mousedown", handler), 100);
        return () => { clearTimeout(t); document.removeEventListener("mousedown", handler); };
    }, [open, onClose]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onClose]);

    return (
        <>
            <div
                onClick={onClose}
                aria-hidden="true"
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 60,
                    background: "rgba(0,0,0,0.2)",
                    opacity: open ? 1 : 0,
                    pointerEvents: open ? "auto" : "none",
                    transition: "opacity 0.25s ease",
                }}
            />

            <div
                ref={drawerRef}
                style={{
                    position: "fixed",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 70,
                    width: 308,
                    display: "flex",
                    flexDirection: "column",
                    background: "#ffffff",
                    borderLeft: "1px solid #f0f0f0",
                    boxShadow: "-4px 0 24px rgba(0,0,0,0.08)",
                    transform: open ? "translateX(0)" : "translateX(100%)",
                    transition: "transform 0.3s cubic-bezier(0.32,0.72,0,1)",
                    willChange: "transform",
                }}
            >
                <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid #f5f5f5", flexShrink: 0 }}>
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
                            <p className="text-[14px] font-bold text-gray-900 truncate leading-tight">{user.fullname}</p>
                            <p className="text-[12px] text-gray-400 truncate mt-0.5">@{user.username}</p>
                            <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${badgeClass}`}>
                                {user.role}
                            </span>
                        </div>
                        <button
                            onClick={onClose}
                            aria-label="Đóng menu"
                            className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-400"
                        >
                            <CloseCircle variant="Bold" style={{ width: 18, height: 18 }} />
                        </button>
                    </div>
                </div>

                <div className="no-scrollbar flex-1 overflow-y-auto" style={{ padding: "12px 12px 20px" }}>
                    {sections.map((section) => (
                        <div key={section.label} className="mb-2.5">
                            <p className="text-[10px] font-semibold uppercase tracking-wider px-1 mb-1.5 text-gray-400">
                                {section.label}
                            </p>
                            <div className="rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                                {section.items.map((item, idx) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={onClose}
                                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 transition-colors"
                                        style={{
                                            borderBottom: idx < section.items.length - 1 ? "1px solid #f0f0f0" : "none",
                                            textDecoration: "none",
                                        }}
                                    >
                                        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-xl bg-white text-main shadow-sm">
                                            {item.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-semibold text-gray-800 leading-tight truncate">{item.title}</p>
                                            <p className="text-[11px] text-gray-400 leading-tight truncate mt-0.5">{item.subtitle}</p>
                                        </div>
                                        <ArrowRight2 variant="Bold" style={{ width: 12, height: 12, color: "#d1d5db", flexShrink: 0 }} />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={() => { onClose(); onLogout(); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-red-100 transition-colors"
                        style={{ background: "#fff1f2", border: "1px solid #fecdd3" }}
                    >
                        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-xl bg-white text-red-500 shadow-sm">
                            <LogOut variant="Bold" style={iconSize} />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-[13px] font-semibold text-red-500 leading-tight">Đăng xuất</p>
                            <p className="text-[11px] text-red-300 leading-tight mt-0.5">Thoát khỏi tài khoản</p>
                        </div>
                    </button>
                </div>
            </div>
        </>
    );
}

// ─── Mobile Bottom Sheet with TikTok-style drag ──────────────────────────────

// ─── Mobile Bottom Sheet with TikTok-style drag ──────────────────────────────

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
    const sheetRef = useRef<HTMLDivElement>(null);
    const startY = useRef<number>(0);
    const currentTranslateY = useRef<number>(0);
    const [isDragging, setIsDragging] = useState(false);
    const [translateY, setTranslateY] = useState(0);
    const [isClosing, setIsClosing] = useState(false);

    // Lock body scroll when open
    useEffect(() => {
        if (open) {
            const scrollY = window.scrollY;
            document.body.style.position = "fixed";
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = "100%";
            setTranslateY(0);
            setIsClosing(false);
        } else {
            const scrollY = document.body.style.top;
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";
            if (scrollY) window.scrollTo(0, parseInt(scrollY) * -1);
            setTranslateY(0);
            setIsDragging(false);
        }
        return () => {
            const scrollY = document.body.style.top;
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";
            if (scrollY) window.scrollTo(0, parseInt(scrollY) * -1);
        };
    }, [open]);

    // Handle touch start
    const handleTouchStart = (e: React.TouchEvent) => {
        if (isClosing) return;
        startY.current = e.touches[0].clientY;
        setIsDragging(true);
    };

    // Handle touch move - follow finger smoothly
    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || isClosing) return;

        const currentY = e.touches[0].clientY;
        const diff = currentY - startY.current;

        // Only allow dragging down (positive diff)
        if (diff > 0) {
            // Smooth follow with damping
            const newTranslateY = Math.min(diff, 300);
            setTranslateY(newTranslateY);
            currentTranslateY.current = newTranslateY;
        }
    };

    // Handle touch end - determine if should close or bounce back
    const handleTouchEnd = () => {
        if (!isDragging || isClosing) {
            setIsDragging(false);
            return;
        }

        setIsDragging(false);

        // Close if dragged more than 100px
        if (currentTranslateY.current > 100) {
            setIsClosing(true);
            setTranslateY(500);
            setTimeout(() => {
                onClose();
                setIsClosing(false);
                setTranslateY(0);
                currentTranslateY.current = 0;
            }, 300);
        } else {
            // Bounce back animation
            setTranslateY(0);
            currentTranslateY.current = 0;
        }
    };

    // Get transform style based on drag state
    const getTransformStyle = () => {
        if (isClosing) {
            return "translateY(100%)";
        }
        if (translateY > 0) {
            return `translateY(${translateY}px)`;
        }
        return "translateY(0)";
    };

    // Determine if transition should be applied
    const shouldTransition = !isDragging && !isClosing;

    return (
        <>
            {/* Backdrop with fade based on drag */}
            <div
                className={`fixed inset-0 z-[60] transition-opacity duration-300 ${open && !isClosing ? "bg-black/40" : "bg-black/0 pointer-events-none"
                    }`}
                style={{
                    opacity: open && !isClosing ? Math.max(0, 1 - translateY / 500) : 0,
                    pointerEvents: open && !isClosing ? "auto" : "none",
                }}
                onClick={() => {
                    if (!isClosing) {
                        setIsClosing(true);
                        setTranslateY(500);
                        setTimeout(() => onClose(), 300);
                    }
                }}
            />

            {/* Draggable Sheet */}
            <div
                ref={sheetRef}
                className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl flex flex-col"
                style={{
                    transform: getTransformStyle(),
                    transition: shouldTransition ? "transform 0.3s cubic-bezier(0.32,0.72,0,1)" : "none",
                    maxHeight: "85dvh",
                    willChange: "transform",
                    touchAction: "pan-y",
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Drag handle - visual indicator only */}
                <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                    <div className="w-10 h-1 bg-gray-300 rounded-full" />
                </div>

                {/* Header */}
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
                        <p className="text-[12px] text-gray-400 truncate">@{user.username}</p>
                        <span className={`inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${badgeClass}`}>
                            {user.role}
                        </span>
                    </div>
                    <button
                        onClick={() => {
                            setIsClosing(true);
                            setTranslateY(500);
                            setTimeout(() => onClose(), 300);
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 flex-shrink-0"
                    >
                        <CloseCircle variant="Bold" style={{ width: 20, height: 20 }} />
                    </button>
                </div>

                <div className="w-full h-px bg-gray-100 flex-shrink-0" />

                {/* Scrollable Content */}
                <div className="no-scrollbar overflow-y-auto flex-1 pb-6">
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
                                        onClick={() => {
                                            setIsClosing(true);
                                            setTranslateY(500);
                                            setTimeout(() => onClose(), 300);
                                        }}
                                        className={`flex items-center gap-3 px-4 py-3 active:bg-gray-100 transition-colors ${idx < section.items.length - 1 ? "border-b border-gray-100" : ""}`}
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-main shadow-sm flex-shrink-0">
                                            {item.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-semibold text-gray-800 leading-tight">{item.title}</p>
                                            <p className="text-[11px] text-gray-400 leading-tight truncate mt-0.5">{item.subtitle}</p>
                                        </div>
                                        <ArrowRight2 variant="Bold" style={{ width: 14, height: 14, color: "#d1d5db", flexShrink: 0 }} />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Logout */}
                    <div className="px-4 pt-4">
                        <button
                            onClick={() => {
                                setIsClosing(true);
                                setTranslateY(500);
                                setTimeout(() => { onClose(); onLogout(); }, 300);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl active:bg-red-100 transition-colors"
                            style={{ background: "#fff1f2", border: "1px solid #fecdd3" }}
                        >
                            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-red-500 shadow-sm flex-shrink-0">
                                <LogOut variant="Bold" style={{ width: 20, height: 20 }} />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-[13px] font-semibold text-red-500 leading-tight">Đăng xuất</p>
                                <p className="text-[11px] text-red-300 leading-tight mt-0.5">Thoát khỏi tài khoản</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Main Header ──────────────────────────────────────────────────────────────

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, token, coins, updateCoins, updateStreak, setUser } = useAuthStore();
    const { socket, isConnected } = useSocket();
    const [sheetOpen, setSheetOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Use derived values directly from store instead of local state
    const displayCoins = user && token ? (coins ?? 0) : 0;
    const displayStreak = user && token ? (user?.streak ?? 0) : 0;
    const displayRole = user?.role || "user";

    // ========== REALTIME SOCKET HANDLERS ==========

    // Listen for coins updates
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleCoinsUpdated = (data: { userId: string; coins: number; amount?: number }) => {
            if (user?._id === data.userId) {
                const diff = data.coins - (user?.coins || 0);
                updateCoins(diff);
                if (diff > 0) {
                    toast.success(`✨ +${diff} xu!`, { duration: 2000 });
                } else if (diff < 0) {
                    toast.info(`📉 ${diff} xu`, { duration: 2000 });
                }
            }
        };

        socket.on("coins_updated", handleCoinsUpdated);
        return () => { socket.off("coins_updated", handleCoinsUpdated); };
    }, [socket, isConnected, user?._id, user?.coins, updateCoins]);

    // Listen for streak updates
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleStreakUpdated = (data: { userId: string; streak: number; totalCoins: number }) => {
            if (user?._id === data.userId) {
                updateStreak(data.streak);
                const diff = data.totalCoins - (user?.coins || 0);
                if (diff !== 0) {
                    updateCoins(diff);
                }
                toast.success(`🔥 Streak: ${data.streak} ngày liên tiếp!`, { duration: 2000 });
            }
        };

        socket.on("streak_updated", handleStreakUpdated);
        return () => { socket.off("streak_updated", handleStreakUpdated); };
    }, [socket, isConnected, user?._id, user?.coins, updateStreak, updateCoins]);

    // Listen for role changes
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleRoleChanged = (data: { userId: string; newRole: string; oldRole: string }) => {
            if (user?._id === data.userId && data.newRole !== user?.role) {
                if (user) {
                    setUser({ ...user, role: data.newRole as "user" | "teacher" | "admin" });
                }
                const roleLabel = data.newRole === "teacher" ? "Giáo viên" : data.newRole === "admin" ? "Quản trị viên" : "Người dùng";
                toast.info(`🔄 Vai trò của bạn đã được cập nhật thành ${roleLabel}`, { duration: 3000 });
            }
        };

        socket.on("role_changed", handleRoleChanged);
        return () => { socket.off("role_changed", handleRoleChanged); };
    }, [socket, isConnected, user, setUser]);

    const handleLogout = async () => {
        await logout();
        toast.success("Đã đăng xuất", { description: "Hẹn gặp lại bạn sau!", duration: 2000 });
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
            {/* ─────────────────── DESKTOP ─────────────────── */}
            <header className="hidden lg:block bg-white w-full h-15 fixed top-0 z-50 shadow-sm">
                <div className="flex h-full justify-between items-center">

                    <div className="ml-1.5 lg:ml-4">
                        <Link href="/">
                            <Image src="/images/logo.png" alt="Logo CNcode" width={100} height={55} priority />
                        </Link>
                    </div>

                    <nav className="flex h-full items-center">
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
                    </nav>

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
                            <button
                                onClick={() => setDrawerOpen(true)}
                                aria-label="Mở menu tài khoản"
                                className="relative p-0.5 rounded-full cursor-pointer focus:outline-none group"
                            >
                                <Avatar className="w-8 h-8 ring-2 ring-transparent group-hover:ring-main/30 transition-all duration-200">
                                    <AvatarImage src={displayUser.avatar} />
                                    <AvatarFallback className="text-xs font-bold bg-main text-white">
                                        {displayUser.fullname?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                            </button>
                        ) : (
                            <Link href="/login" className="bg-main text-white px-3.5 py-2 rounded-[8px] font-bold text-[14px]">
                                Đăng nhập
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* ─────────────────── MOBILE TOP BAR ─────────────────── */}
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
                            <button onClick={() => setSheetOpen(true)} className="focus:outline-none relative">
                                <Avatar className="w-6 h-6 cursor-pointer">
                                    <AvatarImage src={displayUser.avatar} />
                                    <AvatarFallback className="text-[10px] font-bold bg-main text-white">
                                        {displayUser.fullname?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white" />
                            </button>
                        ) : (
                            <Link href="/login" className="bg-main text-white px-2 py-1.5 rounded-[5px] font-bold text-[10px]">
                                Đăng nhập
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* ─────────────────── DESKTOP DRAWER ─────────────────── */}
            {displayUser && (
                <DesktopUserDrawer
                    user={displayUser}
                    onLogout={handleLogout}
                    onClose={() => setDrawerOpen(false)}
                    open={drawerOpen}
                />
            )}

            {/* ─────────────────── MOBILE BOTTOM SHEET ─────────────────── */}
            {displayUser && (
                <MobileUserSheet
                    user={displayUser}
                    onLogout={handleLogout}
                    onClose={() => setSheetOpen(false)}
                    open={sheetOpen}
                />
            )}

            {/* ─────────────────── MOBILE BOTTOM NAV ─────────────────── */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full z-50">
                <div className="w-full h-14 bg-white border-t border-gray-200 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] flex items-center px-2">
                    {menuMobile.map((m) => {
                        const isActive = pathname === m.link;
                        const IconComp = m.icon;
                        return (
                            <Link
                                key={m.link}
                                href={m.link}
                                className="flex-1 flex flex-col items-center justify-center gap-1 active:scale-95 active:opacity-90 transition-all duration-150"
                            >
                                <IconComp
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