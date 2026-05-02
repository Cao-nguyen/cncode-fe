"use client";

import { useRouter, usePathname } from "next/navigation";
import { PanelLeft, LogOut, Menu, House } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import NotificationBell from "./NotificationBell";
import { useState, useEffect } from "react";

const PAGE_TITLES: Record<string, string> = {
    "/admin/dashboard": "Trang tổng quan",
    "/admin/activity": "Hoạt động gần đây",
    "/admin/users": "Người dùng",
    "/admin/roles": "Phân quyền",
    "/admin/violate": "Vi phạm",
    "/admin/coins": "Quản lí xu",
    "/admin/gioithieu": "Giới thiệu",
    "/admin/chinhsachbaohanh": "Chính sách bảo hành",
    "/admin/huongdanthanhtoan": "Hướng dẫn thanh toán",
    "/admin/quytrinhsudung": "Quy trình sử dụng",
    "/admin/antoanbaomat": "An toàn bảo mật",
    "/admin/dieukhoansudung": "Điều khoản sử dụng",
    "/admin/blog": "Bài viết",
    "/admin/chitietgiaodich": "Giao dịch",
};

interface NavAdminProps {
    open: boolean;
    onToggle: () => void;
}

export default function NavAdmin({ open, onToggle }: NavAdminProps) {
    const { logout } = useAuthStore();
    const router = useRouter();
    const path = usePathname();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const pageTitle = PAGE_TITLES[path] ?? "Admin";

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    const btnBase =
        "flex items-center justify-center rounded-lg p-2 text-gray-500 transition-colors hover:bg-black/[0.06] dark:text-gray-400 dark:hover:bg-white/[0.07]";

    return (
        <div className="rounded-t-2xl bg-white dark:bg-[#0f0f0f]">
            <header className="flex h-14 items-center justify-between px-2 sm:px-4">
                {/* Left section */}
                <div className="flex items-center gap-1 sm:gap-2">
                    {/* Menu button - luôn hiển thị trên mobile */}
                    <button
                        onClick={onToggle}
                        className={btnBase}
                        aria-label={open ? "Đóng sidebar" : "Mở sidebar"}
                    >
                        <Menu size={18} className="lg:hidden" />
                        <PanelLeft
                            size={18}
                            className={`hidden lg:block transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${open ? "rotate-0" : "rotate-180"
                                }`}
                        />
                    </button>

                    {/* Divider - ẩn trên mobile khi không đủ chỗ */}
                    {!isMobile && <div className="mx-1 h-5 w-px bg-black/[0.1] dark:bg-white/[0.1]" />}

                    {/* Breadcrumb - rút gọn trên mobile */}
                    <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[12.5px]">
                        <span className="text-gray-400 dark:text-gray-500 hidden sm:inline">Admin</span>
                        <span className="text-gray-400 dark:text-gray-500 sm:hidden">A</span>
                        <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">/</span>
                        <span className="text-gray-300 dark:text-gray-600 sm:hidden">/</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-100 truncate max-w-[120px] sm:max-w-none">
                            {isMobile && pageTitle.length > 15 ? pageTitle.slice(0, 12) + "..." : pageTitle}
                        </span>
                    </div>
                </div>

                {/* Right section */}
                <div className="flex items-center gap-0.5 sm:gap-1">
                    {/* Home button - ẩn text trên mobile */}
                    <button
                        onClick={() => router.push("/")}
                        className={btnBase}
                        aria-label="Về trang chủ"
                    >
                        <House size={18} />
                    </button>

                    {/* Divider - ẩn trên mobile */}
                    {!isMobile && <div className="mx-1 h-5 w-px bg-black/[0.1] dark:bg-white/[0.1]" />}

                    {/* Notification */}
                    <NotificationBell />

                    {/* Divider - ẩn trên mobile */}
                    {!isMobile && <div className="mx-1 h-5 w-px bg-black/[0.1] dark:bg-white/[0.1]" />}

                    {/* Logout button - rút gọn trên mobile */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1 sm:gap-1.5 rounded-lg px-2 sm:px-3 py-2 text-[10px] sm:text-[12.5px] font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                        <LogOut size={isMobile ? 14 : 16} />
                        <span className="hidden sm:inline">Đăng xuất</span>
                    </button>
                </div>
            </header>
        </div>
    );
}