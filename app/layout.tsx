import ToasterProvider from "@/providers/toaster.provider";
import AppThemeProvider from "@/providers/theme.provider";
import AOSProvider from "@/providers/aos.provider";
import ReduxProvider from "@/providers/redux.provider";
import SocketProvider from "@/providers/socket.provider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "aos/dist/aos.css";
import "./globals.css";
import AuthProvider from "@/providers/auth.provider";

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
            <SocketProvider>
              <ToasterProvider>
                <AOSProvider>
                  <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
                    <AuthProvider>
                      {children}
                    </AuthProvider>
                  </GoogleOAuthProvider>
                </AOSProvider>
              </ToasterProvider>
            </SocketProvider>
          </ReduxProvider>
        </AppThemeProvider>
      </body>
    </html>
  );
}