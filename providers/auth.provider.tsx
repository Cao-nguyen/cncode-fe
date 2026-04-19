"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser, logout, selectIsLoaded } from "@/store/userSlice";
import axiosInstance from "@/lib/axiosInstance";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const isLoaded = useAppSelector(selectIsLoaded);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                return;
            }

            try {
                // ✅ SỬA: Thêm /api vào đầu URL
                const response = await axiosInstance.get("/api/user/me");
                if (response.data.success && response.data.data) {
                    dispatch(setUser({
                        user: response.data.data,
                        token: token,
                    }));
                } else {
                    dispatch(logout());
                }
            } catch (error) {
                console.error("Failed to fetch user:", error);
                dispatch(logout());
            }
        };

        if (!isLoaded) {
            fetchUser();
        }
    }, [dispatch, isLoaded]);

    return <>{children}</>;
}