"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    History,
    UserCircle,
    Key,
    ShieldX,
    CircleUser,
    LogOut,
    ChevronDown,
    X,
    EllipsisVertical,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/auth.store";

// ----------------------------------------------------------------
// helpers
// ----------------------------------------------------------------
const getInitials = (name: string) =>
    name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

// ----------------------------------------------------------------
// menu config
// ----------------------------------------------------------------
const menuItems = [
    {
        category: "Tổng quan",
        categoryId: "home",
        listLink: [
            {
                title: "Trang tổng quan",
                link: "/admin/dashboard",
                icon: <LayoutDashboard size={18} />,
            },
            {
                title: "Hoạt động gần đây",
                link: "/admin/activity",
                icon: <History size={18} />,
            },
        ],
    },
    {
        category: "Quản lí người dùng",
        categoryId: "user",
        listLink: [
            {
                title: "Người dùng",
                link: "/admin/users",
                icon: <UserCircle size={18} />,
            },
            {
                title: "Phân quyền",
                link: "/admin/roles",
                icon: <Key size={18} />,
            },
            {
                title: "Vi phạm",
                link: "/admin/violate",
                icon: <ShieldX size={18} />,
            },
            {
                title: "Quản lí xu",
                link: "/admin/coins",
                icon: (
                    <img
                        src="/icons/coins.svg"
                        alt="xu"
                        width={18}
                        height={18}
                        className="h-[18px] w-[18px]"
                    />
                ),
            },
        ],
    },
];

// ----------------------------------------------------------------
// props
// ----------------------------------------------------------------
interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

// ----------------------------------------------------------------
// component
// ----------------------------------------------------------------
export default function Sidebar({ open, onClose }: SidebarProps) {
    const { user, logout } = useAuthStore();
    const path = usePathname();
    const router = useRouter();

    // Chỉ đóng sidebar trên mobile (< 1024px)
    const handleLinkClick = () => {
        if (window.innerWidth < 1024) onClose();
    };

    // accordion state — all open by default
    const [expanded, setExpanded] = useState<Record<string, boolean>>(
        Object.fromEntries(menuItems.map((m) => [m.categoryId, true]))
    );

    const toggle = (id: string) =>
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

    const handleLogout = () => {
        logout();
        router.push("/");
        if (window.innerWidth < 1024) onClose();
    };

    return (
        <>
            {/* ── mobile overlay ── */}
            {open && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* ── sidebar panel ── */}
            <aside
                className={[
                    // layout
                    "fixed left-0 top-0 z-40 flex h-screen w-64 flex-col",
                    // style
                    "border-r border-black/[0.07] bg-white dark:border-white/[0.07] dark:bg-[#0f0f0f]",
                    // animation
                    "transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                    // mobile: ẩn/hiện theo open; desktop: luôn hiện
                    open ? "translate-x-0" : "-translate-x-full",
                ].join(" ")}
            >
                {/* ── logo ── */}
                <div className="flex items-center justify-between border-b border-black/[0.07] px-4 py-[18px] dark:border-white/[0.07]">
                    <div className="flex items-center gap-2.5">
                        <img
                            src="/images/logo.png"
                            alt="CNCode logo"
                            width={50}
                            height={50}
                        />
                        <div>
                            <p className="text-[13px] font-bold leading-none text-gray-900 dark:text-gray-50">
                                CNcode
                            </p>
                            <p className="mt-0.5 text-[10px] font-medium text-gray-400 dark:text-gray-500">
                                Trang quản trị
                            </p>
                        </div>
                    </div>

                    {/* close btn — mobile only */}
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 dark:hover:bg-white/10 lg:hidden"
                        aria-label="Đóng sidebar"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* ── nav ── */}
                <nav className="flex-1 overflow-y-auto px-2.5 py-3 [scrollbar-width:thin]">
                    {menuItems.map((section) => (
                        <div key={section.categoryId} className="mb-1">
                            {/* section header */}
                            <button
                                onClick={() => toggle(section.categoryId)}
                                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 transition hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                            >
                                {section.category}
                                <ChevronDown
                                    size={14}
                                    className={[
                                        "transition-transform duration-200",
                                        expanded[section.categoryId]
                                            ? "rotate-0"
                                            : "-rotate-90",
                                    ].join(" ")}
                                />
                            </button>

                            {/* links */}
                            <div
                                className="overflow-hidden transition-[max-height] duration-200 ease-in-out"
                                style={{
                                    maxHeight: expanded[section.categoryId]
                                        ? `${section.listLink.length * 56}px`
                                        : "0px",
                                }}
                            >
                                <div className="mt-0.5 flex flex-col gap-0.5 pb-2">
                                    {section.listLink.map((item) => {
                                        const active = path === item.link;
                                        return (
                                            <Link
                                                key={item.link}
                                                href={item.link}
                                                onClick={handleLinkClick}
                                                className={[
                                                    "flex items-center gap-2.5 rounded-[9px] px-3 py-[9px] text-[13px] transition-colors",
                                                    active
                                                        ? "bg-gray-100 font-semibold text-gray-900 dark:bg-white/[0.08] dark:text-white"
                                                        : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/[0.04]",
                                                ].join(" ")}
                                            >
                                                <span
                                                    className={
                                                        active
                                                            ? "opacity-100"
                                                            : "opacity-60"
                                                    }
                                                >
                                                    {item.icon}
                                                </span>
                                                <span className="flex-1">
                                                    {item.title}
                                                </span>
                                                {active && (
                                                    <span className="h-[6px] w-[6px] rounded-full bg-blue-500" />
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </nav>

                {/* ── user ── */}
                <div className="border-t border-black/[0.07] p-2.5 dark:border-white/[0.07]">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-left transition hover:bg-gray-50 dark:hover:bg-white/[0.04]">
                                <Avatar className="h-8 w-8 flex-shrink-0">
                                    <AvatarImage
                                        src={user?.avatar ?? undefined}
                                    />
                                    <AvatarFallback className="text-xs">
                                        {user
                                            ? getInitials(user.fullName)
                                            : "AD"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[12.5px] font-semibold text-gray-900 dark:text-gray-50">
                                        {user?.fullName ?? "Admin"}
                                    </p>
                                    <p className="truncate text-[10.5px] text-gray-400 dark:text-gray-500">
                                        {user?.email ?? ""}
                                    </p>
                                </div>
                                <EllipsisVertical
                                    size={15}
                                    className="shrink-0 text-gray-400"
                                />
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            side="top"
                            align="end"
                            className="w-56"
                        >
                            <DropdownMenuLabel>
                                <div className="flex items-center gap-2.5">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage
                                            src={user?.avatar ?? undefined}
                                        />
                                        <AvatarFallback className="text-xs">
                                            {user
                                                ? getInitials(user.fullName)
                                                : "AD"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="truncate text-[13px] font-semibold">
                                            {user?.fullName ?? ""}
                                        </p>
                                        <p className="truncate text-[11px] text-gray-400">
                                            {user?.email ?? ""}
                                        </p>
                                    </div>
                                </div>
                            </DropdownMenuLabel>

                            <div className="my-1 h-px bg-black/[0.07] dark:bg-white/[0.07]" />

                            <DropdownMenuItem className="cursor-pointer gap-2 text-[13px]">
                                <CircleUser size={15} />
                                Trang cá nhân
                            </DropdownMenuItem>

                            <div className="my-1 h-px bg-black/[0.07] dark:bg-white/[0.07]" />

                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="cursor-pointer gap-2 text-[13px] text-red-500 focus:text-red-500"
                            >
                                <LogOut size={15} />
                                Đăng xuất
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </aside>
        </>
    );
}