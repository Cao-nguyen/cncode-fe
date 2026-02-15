import { useScreen } from "@/context/screen-context";
import { LogOut, Moon, PanelLeft, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function NavAdmin() {
    const { setScreen } = useScreen();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    return (
        <header className="flex justify-between items-center">
            <div className="p-[0px_10px] flex items-center">
                <div className="flex items-center justify-center p-1.5 
                            transition-colors duration-200
                            hover:bg-black/10 dark:hover:bg-white/10 
                            rounded-[5px]"
                    onClick={() => setScreen((s: boolean) => !s)}>
                    <PanelLeft className="size-[18px]" />
                </div>
                <div className="mx-[15px] h-6 w-[1px] bg-black/20 dark:bg-white/30"></div>
                <p className="font-bold">Trang tổng quan</p>
            </div>
            <div className="flex gap-1 items-center">
                <div
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")
                    }
                >
                    {theme === "dark" ?
                        <Sun className="dark:text-white cursor-pointer size-[18px]" />
                        : <Moon className="dark:text-white cursor-pointer size-[18px]" />}
                </div>
                <div className="mx-[15px] h-6 w-[0.5px] bg-black/20 dark:bg-white/30"></div>
                <Link className="flex items-center" href="/">
                    <p className="font-bold">Thoát</p>
                    <LogOut className="size-[18px] mx-[10px]" />
                </Link>
            </div>
        </header>
    )
}