import { LogOut, Moon, PanelLeft, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";

export default function NavAdmin({ setOpen, open }: { setOpen: (open: boolean) => void, open: boolean }) {
    const { theme, setTheme } = useTheme();

    return (
        <header className="flex justify-between items-center">
            <div className="p-[0px_10px] flex items-center">
                <div className="flex items-center justify-center p-1.5 
                            transition-colors duration-200
                            hover:bg-black/10 dark:hover:bg-white/10 
                            rounded-[5px]"
                    onClick={() => setOpen(!open)}>
                    <PanelLeft className="size-4.5" />
                </div>
                <div className="mx-3.75 h-6 w-px bg-black/20 dark:bg-white/30"></div>
                <p className="font-bold">Trang tổng quan</p>
            </div>
            <div className="flex gap-1 items-center">
                <div className="flex items-center gap-1">
                    <Sun
                        onClick={() => setTheme("light")}
                        className="hidden dark:block cursor-pointer size-4.5"
                    />
                    <Moon
                        onClick={() => setTheme("dark")}
                        className="block dark:hidden cursor-pointer size-4.5"
                    />
                </div>
                <div className="mx-3.75 h-6 w-[0.5px] bg-black/20 dark:bg-white/30"></div>
                <Link className="flex items-center" href="/">
                    <p className="font-bold">Thoát</p>
                    <LogOut className="size-4.5 mx-2.5" />
                </Link>
            </div>
        </header>
    )
}