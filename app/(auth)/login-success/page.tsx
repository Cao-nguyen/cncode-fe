"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginSuccess() {
    const params = useSearchParams();

    useEffect(() => {
        const token = params.get("token");

        if (token) {
            localStorage.setItem("token", token);
            window.location.href = "/";
        }
    }, []);

    return <div>Logging in...</div>;
}