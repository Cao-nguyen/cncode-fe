import { AuthGuard } from "@/components/common/AuthGuard";

export default function UserLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <AuthGuard>
            <div className="custom-scroll">
                {children}
            </div>
        </AuthGuard>
    );
}