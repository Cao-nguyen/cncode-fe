"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import { useRouter } from "@/node_modules/next/navigation";
import { Loader2 } from "lucide-react";

import { useAuthStore } from "@/store/auth.store";
import Sidebar from "@/components/layouts/sidebar";
import NavAdmin from "@/components/layouts/nav-admin";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { user, token, checkAndSync } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useLayoutEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (token && !user) checkAndSync();
    }, [token, user, checkAndSync]);

    useEffect(() => {
        const handle = () => setSidebarOpen(window.innerWidth >= 1024);
        handle();
        window.addEventListener("resize", handle);
        return () => window.removeEventListener("resize", handle);
    }, []);

    if (!mounted) {
        return (
            <div className="flex h-screen items-center justify-center bg-white dark:bg-black">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!token || !user) {
        router.push("/login");
        return null;
    }

    if (user.role !== "admin") {
        router.push("/");
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-[#0a0a0a]">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div
                className={`flex min-h-screen flex-col transition-[padding-left] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${sidebarOpen ? "lg:pl-64" : "lg:pl-0"
                    }`}
            >
                <div className="m-2.5 flex h-[calc(100vh-20px)] flex-col rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.06] dark:bg-[#0f0f0f] dark:ring-white/[0.06]">
                    <NavAdmin
                        open={sidebarOpen}
                        onToggle={() => setSidebarOpen((v) => !v)}
                    />
                    <div className="h-px w-full bg-black/[0.06] dark:bg-white/[0.06]" />
                    <main className="flex-1 overflow-y-auto p-4 lg:p-6 scroll-auto no-scrollbar">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}