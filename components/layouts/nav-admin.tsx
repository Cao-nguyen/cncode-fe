import { LogOut, Moon, Sun, PanelLeft } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";

export default function NavAdmin({ setOpen, open }: { setOpen: (open: boolean) => void; open: boolean }) {
    const { setTheme, theme } = useTheme();

    return (
        <header className="flex justify-between items-center">
            <div className="px-2.5 flex items-center">
                <button
                    className="flex items-center justify-center p-2 transition-colors duration-200 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg"
                    onClick={() => setOpen(!open)}
                >
                    <PanelLeft size={18} />
                </button>
                <div className="mx-3 h-5 w-px bg-black/20 dark:bg-white/30" />
                <p className="font-semibold">Trang tổng quan</p>
            </div>
            <div className="flex gap-2 items-center">
                <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                >
                    <Sun size={18} className="hidden dark:block" />
                    <Moon size={18} className="block dark:hidden" />
                </button>
                <div className="mx-2 h-5 w-px bg-black/20 dark:bg-white/30" />
                <Link href="/" className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                    <span className="font-medium text-sm">Thoát</span>
                    <LogOut size={18} />
                </Link>
            </div>
        </header>
    );
}