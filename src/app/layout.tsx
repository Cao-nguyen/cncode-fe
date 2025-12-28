import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Header } from '../components/header/headerMain'
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
    <html lang="en">
      <head>
        <link rel="icon" href="./logo.png" />
      </head>
      <body className={`${inter.className} bg-black text-white`}>
        <Header />
        {children}
      </body>
    </html>
  )
}
