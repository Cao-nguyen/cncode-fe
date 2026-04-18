import Header from "@/components/layouts/header"

export default function UserLayoutMain({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <Header />
            {children}
        </>
    )
}