import { ReactNode } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Thông tin đăng nhập"
}

export default function LoginLayout({ children }: { children: ReactNode }) {
    return children;
}