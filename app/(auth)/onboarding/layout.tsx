import { ReactNode } from "react";
import { Metadata } from "@/node_modules/next";

export const metadata: Metadata = {
    title: "Thông tin đăng nhập"
}

export default function LoginLayout({ children }: { children: ReactNode }) {
    return (
        <div>
            {children}
        </div>
    )
}