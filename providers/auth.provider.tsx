"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const checkAndSync = useAuthStore((state) => state.checkAndSync)
    const token = useAuthStore((state) => state.token)
    const user = useAuthStore((state) => state.user)
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const init = async () => {
            if (token && !user) {
                await checkAndSync();
            }
            setReady(true);
        };
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Chỉ chạy 1 lần khi mount

    if (!ready) return null;

    return <>{children}</>;
}