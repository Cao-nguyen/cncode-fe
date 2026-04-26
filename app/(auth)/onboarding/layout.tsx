import { ReactNode } from "react";
import { Metadata } from "@/node_modules/next";
import { AuthGuard } from "@/components/common/AuthGuard";

export const metadata: Metadata = {
    title: "Thông tin đăng nhập"
}

export default function LoginLayout({ children }: { children: ReactNode }) {
    return (
        <AuthGuard>
            {children}
        </AuthGuard>
    )
}