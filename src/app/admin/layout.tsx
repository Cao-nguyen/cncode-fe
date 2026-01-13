import { Providers } from '../helper/providers'
import '../globals.css'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="icon" href="./logo.png" />
            </head>
            <body className="bg-white text-black dark:bg-black dark:text-white">
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    )
}
