import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { LayoutWrapper } from './layout-wrapper'
import { Providers } from './helper/providers'
import './globals.css'

const inter = Plus_Jakarta_Sans({ subsets: ['vietnamese'] })

export const metadata: Metadata = {
  title: 'CNcode',
  description: 'CNcode - Nền tảng dạy và học công nghệ thông tin trực tuyến',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="./logo.png" />
      </head>
      <body className={`${inter.className} bg-white text-black dark:bg-black dark:text-white`}>
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  )
}
