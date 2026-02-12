import { LogOut, PanelLeft } from "lucide-react";
import Link from "next/link";

export default function NavAdmin() {
    return (
        <header className="flex justify-between items-center">
            <div className="p-[0px_10px] flex items-center">
                <div className="flex items-center justify-center p-1.5 
                            transition-colors duration-200
                            hover:bg-black/10 dark:hover:bg-white/10 
                            rounded-[5px]">
                    <PanelLeft className="size-[18px]" />
                </div>
                <div className="mx-[15px] h-6 w-[1px] bg-black/20 dark:bg-white/30"></div>
                <p className="font-bold">Trang tổng quan</p>
            </div>
            <Link className="flex items-center" href="/">
                <p className="font-bold">Trang chủ</p>
                <LogOut className="size-[18px] mx-[10px]" />
            </Link>
        </header>
    )
}