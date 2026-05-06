import { ReactNode } from "react";
import type { Metadata } from "next"; // Sửa đường dẫn đúng

export const metadata: Metadata = {
    title: "Đăng nhập"
}

export default function LoginLayout({ children }: { children: ReactNode }) {
    return (
        <div>
            {children}
        </div>

    );
}