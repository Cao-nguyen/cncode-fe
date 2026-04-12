"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, logout, setLoaded } from "@/store/userSlice";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            dispatch(setLoaded());
            return;
        }

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Unauthorized");
                return res.json();
            })
            .then((user) => {
                dispatch(setUser({ user, token }));
            })
            .catch(() => {
                localStorage.removeItem("token");
                dispatch(logout());
            });
    }, [dispatch]);

    return <>{children}</>;
}