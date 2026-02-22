import { ReactNode } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Đăng ký"
}

export default function RegisterLayout({ children }: { children: ReactNode }) {
    return children;
}