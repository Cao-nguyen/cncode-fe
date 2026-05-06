"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const { checkAndSync, token, user, _hasHydrated, forceLogout } = useAuthStore();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        // Kiểm tra nếu chưa hydrate xong thì đợi
        if (!_hasHydrated) {
            return;
        }

        const init = async () => {
            try {
                // Nếu có token nhưng không có user, sync lại
                if (token && !user) {
                    await checkAndSync();
                }

                // Kiểm tra token có còn hợp lệ không (nếu có token nhưng checkAndSync thất bại)
                if (token && !useAuthStore.getState().user) {
                    // Token không hợp lệ -> force logout
                    forceLogout();
                }
            } catch (error) {
                console.error("AuthProvider init error:", error);
                forceLogout();
            } finally {
                setReady(true);
            }
        };

        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [_hasHydrated]); // Chạy lại khi hydrate xong

    // Chưa hydrate xong hoặc chưa init xong -> không render
    if (!_hasHydrated || !ready) {
        // Có thể hiển thị loading spinner nếu muốn
        return null;
    }

    return <>{children}</>;
}