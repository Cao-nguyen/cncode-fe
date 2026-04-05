import { Footer } from "@/components/layouts/footer"
import { Header } from "@/components/layouts/header"

export default function UserLayoutMain({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <Header />
            <div className="min-h-screen mt-0 lg:mt-15">
                {children}
            </div>
            <Footer />
        </>
    )
}