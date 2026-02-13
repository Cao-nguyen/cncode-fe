import { useScreen } from "@/src/context/screen-context";
import { EllipsisVertical, LayoutDashboard, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Sidebar() {
    const { screen } = useScreen();

    return (
        <aside className={`fixed left-0 top-0 z-20 w-[18%] min-h-screen transition-transform duration-300 ${screen ? '-translate-x-full' : 'translate-x-0'}`}>
            <div className="flex flex-col h-screen">
                <div className="p-[16px_10px_10px_10px] w-[100%] bg-white dark:bg-black flex fixed items-center gap-4">
                    <Image src="/logo.png" alt="Logo CNCode" width={70} height={0} />
                    <p className="">CNcode</p>
                </div>

                <nav className="flex-1 overflow-y-scroll no-scrollbar pt-[70px] pb-[10px] px-[10px] space-y-2">
                    <Link href="/admin/dashboard" className="flex items-center gap-4 p-[10px] bg-[#E5E5E5] dark:bg-[#2C2C2C] rounded-[10px] cursor-pointer">
                        <LayoutDashboard />
                        <p className="font-bold">Trang tổng quan</p>
                    </Link>
                    <Link href="/admin/dashboard" className="flex items-center gap-4 p-[10px] bg-[#E5E5E5] dark:bg-[#2C2C2C] rounded-[10px] cursor-pointer">
                        <LayoutDashboard />
                        <p className="font-bold">Trang tổng quan</p>
                    </Link>
                    <Link href="/admin/dashboard" className="flex items-center gap-4 p-[10px] bg-[#E5E5E5] dark:bg-[#2C2C2C] rounded-[10px] cursor-pointer">
                        <LayoutDashboard />
                        <p className="font-bold">Trang tổng quan</p>
                    </Link>
                    <Link href="/admin/dashboard" className="flex items-center gap-4 p-[10px] bg-[#E5E5E5] dark:bg-[#2C2C2C] rounded-[10px] cursor-pointer">
                        <LayoutDashboard />
                        <p className="font-bold">Trang tổng quan</p>
                    </Link>
                    <Link href="/admin/dashboard" className="flex items-center gap-4 p-[10px] bg-[#E5E5E5] dark:bg-[#2C2C2C] rounded-[10px] cursor-pointer">
                        <LayoutDashboard />
                        <p className="font-bold">Trang tổng quan</p>
                    </Link>
                    <Link href="/admin/dashboard" className="flex items-center gap-4 p-[10px] bg-[#E5E5E5] dark:bg-[#2C2C2C] rounded-[10px] cursor-pointer">
                        <LayoutDashboard />
                        <p className="font-bold">Trang tổng quan</p>
                    </Link>
                    <Link href="/admin/dashboard" className="flex items-center gap-4 p-[10px] bg-[#E5E5E5] dark:bg-[#2C2C2C] rounded-[10px] cursor-pointer">
                        <LayoutDashboard />
                        <p className="font-bold">Trang tổng quan</p>
                    </Link>
                    <Link href="/admin/dashboard" className="flex items-center gap-4 p-[10px] bg-[#E5E5E5] dark:bg-[#2C2C2C] rounded-[10px] cursor-pointer">
                        <LayoutDashboard />
                        <p className="font-bold">Trang tổng quan</p>
                    </Link>
                    <Link href="/admin/dashboard" className="flex items-center gap-4 p-[10px] bg-[#E5E5E5] dark:bg-[#2C2C2C] rounded-[10px] cursor-pointer">
                        <LayoutDashboard />
                        <p className="font-bold">Trang tổng quan</p>
                    </Link>
                    <Link href="/admin/dashboard" className="flex items-center gap-4 p-[10px] bg-[#E5E5E5] dark:bg-[#2C2C2C] rounded-[10px] cursor-pointer">
                        <LayoutDashboard />
                        <p className="font-bold">Trang tổng quan</p>
                    </Link>
                    <Link href="/admin/dashboard" className="flex items-center gap-4 p-[10px] bg-[#E5E5E5] dark:bg-[#2C2C2C] rounded-[10px] cursor-pointer">
                        <LayoutDashboard />
                        <p className="font-bold">Trang tổng quan</p>
                    </Link>
                    <Link href="/admin/dashboard" className="flex items-center gap-4 p-[10px] bg-[#E5E5E5] dark:bg-[#2C2C2C] rounded-[10px] cursor-pointer">
                        <LayoutDashboard />
                        <p className="font-bold">Trang tổng quan</p>
                    </Link>
                    <Link href="/admin/dashboard" className="flex items-center gap-4 p-[10px] bg-[#E5E5E5] dark:bg-[#2C2C2C] rounded-[10px] cursor-pointer">
                        <LayoutDashboard />
                        <p className="font-bold">Trang tổng quan</p>
                    </Link>
                    <Link href="/admin/dashboard" className="flex items-center gap-4 p-[10px] bg-[#E5E5E5] dark:bg-[#2C2C2C] rounded-[10px] cursor-pointer">
                        <LayoutDashboard />
                        <p className="font-bold">Trang tổng quan</p>
                    </Link>
                </nav>

                <div className="p-[10px] w-[100%] bg-white dark:bg-black flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>LCN</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="font-bold text-[14px] truncate">Lý Cao Nguyên</p>
                            <p className="text-[10px] truncate">chinhphucnguvan@gmail.com</p>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <EllipsisVertical className="size-[18px]" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#E5E5E5] dark:bg-[#2C2C2C] border-0">
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
                                <DropdownMenuItem className="outline-none">Trang cá nhân</DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuGroup>
                                <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10" />
                                <DropdownMenuItem className="outline-none text-red-500">
                                    <LogOut />
                                    Đăng xuất
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </aside>
    )
}