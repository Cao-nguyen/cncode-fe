import type { Metadata } from "next"
import { Toaster } from 'sonner';
import { Inter } from 'next/font/google'
import Providers from "./provider";
import '../app/globals.css'

const inter = Inter({
  subsets: ["latin", "vietnamese"],
})

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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} font-sans bg-white text-black dark:bg-black dark:text-white antialiased`}
      >
        <Providers>{children}</Providers>
        <Toaster
          position="top-right"
          richColors
          closeButton
        />
      </body>
    </html>
  );
}
