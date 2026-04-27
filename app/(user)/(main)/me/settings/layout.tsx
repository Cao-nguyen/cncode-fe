import { ReactNode } from "react";
import { Metadata } from "@/node_modules/next";

export const metadata: Metadata = {
    title: "Cài đặt"
}

export default function MeSettingsLayout({ children }: { children: ReactNode }) {
    return (
        <main>{children}</main>
    )
}