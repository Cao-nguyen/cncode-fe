"use client";

import Sidebar from "@/components/layouts/sidebar";
import NavAdmin from "@/components/layouts/nav-admin";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectUser, selectIsLoaded } from "@/store/userSlice";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const user = useSelector(selectUser);
    const isLoaded = useSelector(selectIsLoaded);

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (!user) {
        router.push("/login");
        return null;
    }

    if (user.role !== "admin") {
        router.push("/");
        return null;
    }

    return <AdminLayoutUI>{children}</AdminLayoutUI>;
}

function AdminLayoutUI({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative overflow-x-hidden h-screen">
            <Sidebar open={open} />

            <div className={`transition-all duration-300 ${open ? "ml-0 w-full" : "ml-[17%] w-[83%]"}`}>
                <div className="m-2.5 rounded-3xl h-[calc(100vh-20px)] bg-[#EEEEEE] dark:bg-[#171717] p-2.5">
                    <NavAdmin setOpen={setOpen} open={open} />
                    <div className="m-[10px_0px] h-[0.5px] w-full bg-black/20 dark:bg-white/30" />
                    {children}
                </div>
            </div>
        </div>
    );
}