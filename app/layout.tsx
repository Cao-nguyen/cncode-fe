import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ToasterProvider from "@/providers/toaster.provider";
import AppThemeProvider from "@/providers/theme.provider";
import AOSProvider from "@/providers/aos.provider";
import "aos/dist/aos.css"
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'CNcode',
    template: 'CNcode | %s',
  },
  description: 'CNcode - Nền tảng học công nghệ và sáng tạo đổi mới',
  icons: {
    icon: '/images/logo.png',
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
        className={`
          ${inter.className} 
          antialiased
        `}
      >
        <AppThemeProvider>
          <ToasterProvider>
            <AOSProvider>
              {children}
            </AOSProvider>
          </ToasterProvider>
        </AppThemeProvider>
      </body>
    </html >
  );
}
