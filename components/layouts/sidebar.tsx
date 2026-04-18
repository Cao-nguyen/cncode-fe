"use client";

import { LayoutDashboard, History, UserCircle, Key, ShieldX, Coins, LogOut, CircleUser, EllipsisVertical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, logout } from "@/store/userSlice";

const getInitials = (name: string): string => {
    return name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
};

export default function Sidebar({ open }: { open: boolean }) {
    const user = useSelector(selectUser);
    const dispatch = useDispatch();
    const router = useRouter();
    const path = usePathname();

    const handleLogout = () => {
        dispatch(logout());
        router.push("/");
    };

    const menuItems = [
        {
            category: "Tổng quan",
            categoryId: "home",
            listLink: [
                { title: "Trang tổng quan", link: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
                { title: "Hoạt động gần đây", link: "/admin/activity", icon: <History size={20} /> },
            ],
        },
        {
            category: "Quản lí người dùng",
            categoryId: "user",
            listLink: [
                { title: "Người dùng", link: "/admin/users", icon: <UserCircle size={20} /> },
                { title: "Phân quyền", link: "/admin/roles", icon: <Key size={20} /> },
                { title: "Vi phạm", link: "/admin/violate", icon: <ShieldX size={20} /> },
                { title: "Quản lí xu", link: "/admin/coins", icon: <Coins size={20} /> },
            ],
        },
    ];

    return (
        <aside className={`fixed left-0 top-0 z-20 w-70 min-h-screen transition-transform duration-300 ${open ? "-translate-x-full" : "translate-x-0"}`}>
            <div className="flex flex-col h-screen bg-white dark:bg-black">
                <div className="p-4 w-full flex items-center gap-3 border-b border-black/10 dark:border-white/10">
                    <Image style={{ width: "auto", height: "auto" }} src="/images/logo.png" alt="Logo CNCode" width={40} height={40} />
                    <p className="font-bold text-lg">CNcode Admin</p>
                </div>

                <nav className="flex-1 overflow-y-auto no-scrollbar py-4 px-3 space-y-1">
                    <Accordion type="single" collapsible className="w-full" defaultValue="home">
                        {menuItems.map((item, index) => (
                            <AccordionItem key={index} value={item.categoryId} className="border-b-0">
                                <AccordionTrigger className="font-semibold text-sm py-2 hover:no-underline">
                                    {item.category}
                                </AccordionTrigger>
                                <AccordionContent className="pb-2">
                                    <div className="space-y-1">
                                        {item.listLink.map((link, linkIndex) => (
                                            <Link
                                                key={linkIndex}
                                                href={link.link}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${path === link.link
                                                    ? "bg-[#E5E5E5] dark:bg-[#2C2C2C] text-gray-900 dark:text-white font-medium"
                                                    : "text-gray-600 dark:text-gray-400 hover:bg-[#ededed] hover:dark:bg-[#212121]"
                                                    }`}
                                            >
                                                {link.icon}
                                                <span>{link.title}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </nav>

                <div className="p-3 border-t border-black/10 dark:border-white/10">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="cursor-pointer flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-[#ededed] dark:hover:bg-[#212121] transition-colors">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <Avatar className="size-9">
                                        <AvatarImage src={user?.avatar || undefined} />
                                        <AvatarFallback>{user ? getInitials(user.name) : "AD"}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-sm truncate">{user?.name || "Đang tải..."}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || ""}</p>
                                    </div>
                                </div>
                                <EllipsisVertical size={18} className="shrink-0" />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex items-center gap-3">
                                    <Avatar className="size-10">
                                        <AvatarImage src={user?.avatar || undefined} />
                                        <AvatarFallback>{user ? getInitials(user.name) : "AD"}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm truncate">{user?.name || ""}</p>
                                        <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <div className="h-px bg-black/10 dark:bg-white/10 my-1" />
                            <DropdownMenuItem className="cursor-pointer">
                                <CircleUser size={16} />
                                Trang cá nhân
                            </DropdownMenuItem>
                            <div className="h-px bg-black/10 dark:bg-white/10 my-1" />
                            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500">
                                <LogOut size={16} />
                                Đăng xuất
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </aside>
    );
}