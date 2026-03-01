"use client"

import { Providers } from '@/context/providers'
import { Header } from '@/components/layouts/header-main'
import { Footer } from '@/components/layouts/footer'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <Header />
      {children}
      <Footer />
    </Providers>
  )
}
