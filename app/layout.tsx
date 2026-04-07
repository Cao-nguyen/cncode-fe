import ToasterProvider from "@/providers/toaster.provider";
import AppThemeProvider from "@/providers/theme.provider";
import AOSProvider from "@/providers/aos.provider";
import ReduxProvider from "@/providers/redux.provider";
import SocketProvider from "@/providers/socket.provider";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "aos/dist/aos.css"
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cncode.io.vn"),
  title: {
    default: "CNcode",
    template: "CNcode | %s",
  },
  description: "CNcode - Nền tảng học công nghệ và sáng tạo",
  keywords: ["CNcode", "lập trình", "học code", "đổi mới sáng tạo"],
  authors: [{ name: "Lý Cao Nguyên" }],
  openGraph: {
    title: "CNcode",
    description: "CNcode - Nền tảng học công nghệ và sáng tạo",
    url: "https://cncode.io.vn",
    siteName: "CNcode",
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  icons: {
    icon: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <AppThemeProvider>
          <ReduxProvider>
            <SocketProvider>
              <ToasterProvider>
                <AOSProvider>
                  {children}
                </AOSProvider>
              </ToasterProvider>
            </SocketProvider>
          </ReduxProvider>
        </AppThemeProvider>
      </body>
    </html>
  );
}
