import { CircleUser, EllipsisVertical, LayoutDashboard, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { usePathname } from "next/navigation";

export default function Sidebar({ open }: { open: boolean }) {

    const menuItems = [
        {
            category: "Tổng quan", categoryId: "home", listLink: [
                { title: "Trang tổng quan", link: "/admin/dashboard", icon: <LayoutDashboard /> },
                { title: "Trang học tập", link: "/admin/dasnhboard", icon: <LayoutDashboard /> },
            ],

        },
        {
            category: "Tổng quan", categoryId: "test", listLink: [
                { title: "Trang tổng quan", link: "/admin/d", icon: <LayoutDashboard /> },
                { title: "Trang học tập", link: "/admin/daeshboard", icon: <LayoutDashboard /> },
            ],
        }
    ]

    const path = usePathname()

    return (
        <aside className={`fixed left-0 top-0 z-20 w-[17%] min-h-screen transition-transform duration-300 ${open ? '-translate-x-full' : 'translate-x-0'}`}>
            <div className="flex flex-col h-screen">
                <div className="p-[16px_10px_10px_10px] w-[100%] bg-white dark:bg-black flex fixed items-center gap-4">
                    <Image src="/logo.png" alt="Logo CNCode" width={70} height={0} />
                    <p className="">CNcode</p>
                </div>

                <nav className="flex-1 overflow-y-scroll no-scrollbar pt-[70px] pb-[10px] px-[10px] space-y-0">
                    <Accordion type="single" collapsible className="max-w-lg" defaultValue="home">
                        {menuItems.map((item, index) => (
                            <AccordionItem key={index} value={item.categoryId} className="py-0 px-1 border-b-0 last:border-0">
                                <AccordionTrigger className="font-bold no-underline hover:no-underline py-1">{item.category}</AccordionTrigger>
                                <div className="space-y-2 mb-[10px]">
                                    {item.listLink.map((item, index) => (
                                        <div className="mt-[5px]">
                                            <AccordionContent key={index} className="p-0">
                                                <Link href={item.link} className={`flex items-center gap-4 p-[10px] ${path === item.link ? "bg-[#E5E5E5] dark:bg-[#2C2C2C]" : ""} ${path === item.link ? "" : "hover:bg-[#ededed] hover:dark:bg-[#212121]"} rounded-[10px] cursor-pointer`}>
                                                    {item.icon}
                                                    <p className="font-bold">{item.title}</p>
                                                </Link>
                                            </AccordionContent>
                                        </div>
                                    ))}
                                </div>
                            </AccordionItem>
                        ))}

                    </Accordion>
                </nav>

                <div className="p-[10px] w-[100%] bg-white dark:bg-black flex items-center justify-between gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="cursor-pointer flex items-center justify-between w-full gap-4">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <Avatar>
                                        <AvatarImage src="https://github.com/shadcn.png" />
                                        <AvatarFallback>LCN</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="font-bold text-[14px] truncate">Lý Cao Nguyên</p>
                                        <p className="text-[10px] truncate">chinhphucnguvan@gmail.com</p>
                                    </div>
                                </div>
                                <EllipsisVertical className="size-[18px] flex-shrink-0" />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="flex flex-col gap-1 bg-[#E5E5E5] dark:bg-[#2C2C2C] border-0">
                            <DropdownMenuLabel>
                                <div className="flex items-center gap-3 min-w-0 w-[150px]">
                                    <Avatar>
                                        <AvatarImage src="https://github.com/shadcn.png" />
                                        <AvatarFallback>LCN</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="font-bold text-[12px] truncate">Lý Cao Nguyên</p>
                                        <p className="text-[10px] truncate">chinhphucnguvan@gmail.com</p>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <div className="w-full h-[0.5px] bg-black/10 dark:bg-white/10" />
                            <DropdownMenuItem className="outline-none">
                                <CircleUser />
                                Trang cá nhân
                            </DropdownMenuItem>
                            <div className="w-full h-[0.5px] bg-black/10 dark:bg-white/10" />
                            <DropdownMenuItem className="outline-none text-red-500">
                                <LogOut />
                                Đăng xuất
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </aside >
    )
}