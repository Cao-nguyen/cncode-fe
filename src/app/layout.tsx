import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Header } from '../components/layouts/header-main'
import { Providers } from './helper/providers'
import './globals.css'

const inter = Inter({ subsets: ['vietnamese'] })

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
      <body className={`${inter.className}`}>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  )
}
