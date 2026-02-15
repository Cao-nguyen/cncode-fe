import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from 'next/font/google'
import '../app/globals.css'

const inter = Plus_Jakarta_Sans({ subsets: ['vietnamese'] })

export const metadata: Metadata = {
    title: {
        default: 'CNcode',
        template: 'CNcode | %s',
    },
    description: 'CNcode - Nền tảng dạy và học công nghệ thông tin trực tuyến',
    icons: {
        icon: '/logo.png',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.className} bg-white text-black dark:bg-black dark:text-white`}>
                {children}
            </body>
        </html>
    )
}