import Footer from "@/components/layouts/footer"
import Header from "@/components/layouts/header"

export default function UserLayoutMain({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <Header />
            <div className="min-h-[calc(100dvh-96px)] lg:min-h-[calc(100dvh-60px)] pt-10 pb-14 lg:pt-[60px] lg:pb-0">
                {children}
            </div>
            <Footer />
        </>
    )
}
