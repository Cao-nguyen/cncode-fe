import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ToasterProvider from "@/providers/toaster.provider";
import "./globals.css";
import AppThemeProvider from "@/providers/theme.provider";

const inter = Inter({
  subsets: ["latin"],
});

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
        className={`
          ${inter.className} 
          antialiased
        `}
      >
        <AppThemeProvider>
          <ToasterProvider>
            {children}
          </ToasterProvider>
        </AppThemeProvider>
      </body>
    </html>
  );
}
