'use client'

import { usePathname } from 'next/navigation'
import { Header } from '../../components/layouts/header-main'
import { Footer } from '../../components/layouts/footer'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isAdmin = pathname.startsWith('/admin')

    return (
        <>
            {!isAdmin && <Header />}
            {children}
            {!isAdmin && <Footer />}
        </>
    )
}
