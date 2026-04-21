"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, PanelLeft, LogOut, Menu, House } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import NotificationBell from "./NotificationBell";

// ----------------------------------------------------------------
// page title map — add entries as new pages are created
// ----------------------------------------------------------------
const PAGE_TITLES: Record<string, string> = {
    "/admin/dashboard": "Trang tổng quan",
    "/admin/activity": "Hoạt động gần đây",
    "/admin/users": "Người dùng",
    "/admin/roles": "Phân quyền",
    "/admin/violate": "Vi phạm",
    "/admin/coins": "Quản lí xu",
};

// ----------------------------------------------------------------
// props
// ----------------------------------------------------------------
interface NavAdminProps {
    open: boolean;
    onToggle: () => void;
}

// ----------------------------------------------------------------
// component
// ----------------------------------------------------------------
export default function NavAdmin({ open, onToggle }: NavAdminProps) {
    const { theme, setTheme } = useTheme();
    const { logout } = useAuthStore();
    const router = useRouter();
    const path = usePathname();

    const pageTitle = PAGE_TITLES[path] ?? "Admin";

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    const btnBase =
        "flex items-center justify-center rounded-lg p-2 text-gray-500 transition-colors hover:bg-black/[0.06] dark:text-gray-400 dark:hover:bg-white/[0.07]";

    return (
        <header className="flex h-14 items-center justify-between border-b border-black/[0.07] px-4 dark:border-white/[0.07]">
            {/* ── left ── */}
            <div className="flex items-center gap-2">
                {/* sidebar toggle */}
                <button
                    onClick={onToggle}
                    className={btnBase}
                    aria-label={open ? "Đóng sidebar" : "Mở sidebar"}
                >
                    <Menu size={18} className="lg:hidden" />
                    <PanelLeft size={18} className="hidden lg:block" />
                </button>

                <div className="mx-1 h-5 w-px bg-black/[0.1] dark:bg-white/[0.1]" />

                {/* breadcrumb */}
                <div className="flex items-center gap-1.5 text-[12.5px]">
                    <span className="text-gray-400 dark:text-gray-500">
                        Admin
                    </span>
                    <span className="text-gray-300 dark:text-gray-600">/</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-100">
                        {pageTitle}
                    </span>
                </div>
            </div>

            {/* ── right ── */}
            <div className="flex items-center gap-1">
                {/* về trang chủ */}
                <button
                    onClick={() => router.push("/")}
                    className={btnBase}
                    aria-label="Về trang chủ"
                >
                    <House size={18} />
                </button>

                <div className="mx-1 h-5 w-px bg-black/[0.1] dark:bg-white/[0.1]" />

                {/* notification */}
                <NotificationBell />

                {/* theme toggle */}
                <button
                    onClick={() =>
                        setTheme(theme === "dark" ? "light" : "dark")
                    }
                    className={btnBase}
                    aria-label="Đổi giao diện"
                >
                    <Sun size={18} className="hidden dark:block" aria-hidden />
                    <Moon size={18} className="block dark:hidden" aria-hidden />
                </button>

                <div className="mx-1 h-5 w-px bg-black/[0.1] dark:bg-white/[0.1]" />

                {/* logout */}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12.5px] font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                    aria-label="Đăng xuất"
                >
                    <span className="hidden sm:inline">Đăng xuất</span>
                    <LogOut size={16} />
                </button>
            </div>
        </header>
    );
}