import { Header } from "@/components/layouts/header"

export default function UserLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <Header />
            <div className="mt-0 2xl:mt-15">
                {children}
            </div>
        </>
    )
}