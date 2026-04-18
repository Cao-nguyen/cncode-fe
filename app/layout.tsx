import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "aos/dist/aos.css";
import "./globals.css";

import ToasterProvider from "@/providers/toaster.provider";
import AppThemeProvider from "@/providers/theme.provider";
import AOSProvider from "@/providers/aos.provider";
import ReduxProvider from "@/providers/redux.provider";
import AuthProvider from "@/providers/auth.provider";
import { SocketProvider } from "@/providers/socket.provider";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cncode.io.vn"),
  title: {
    default: "CNcode",
    template: "CNcode | %s",
  },
  icons: {
    icon: "/images/logo.png",
  },
  description: "CNcode - Nền tảng học công nghệ và sáng tạo",
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
            <AuthProvider>
              <SocketProvider>
                <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
                  <ToasterProvider>
                    <AOSProvider>
                      {children}
                    </AOSProvider>
                  </ToasterProvider>
                </GoogleOAuthProvider>
              </SocketProvider>
            </AuthProvider>
          </ReduxProvider>
        </AppThemeProvider>
      </body>
    </html>
  );
}