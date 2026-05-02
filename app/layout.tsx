// app/layout.tsx
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "aos/dist/aos.css";
import "./globals.css";

import ToasterProvider from "@/providers/toaster.provider";
import AOSProvider from "@/providers/aos.provider";
import AuthProvider from "@/providers/auth.provider";
import { SocketProvider } from "@/providers/socket.provider";
import SessionProvider from "@/providers/session.provider";

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
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#ffffff" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.documentElement.classList.remove('dark');
              document.documentElement.style.colorScheme = 'light';
              localStorage.removeItem('theme');
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <SocketProvider>
            <SessionProvider>
              <GoogleOAuthProvider clientId={googleClientId}>
                <ToasterProvider>
                  <AOSProvider>{children}</AOSProvider>
                </ToasterProvider>
              </GoogleOAuthProvider>
            </SessionProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}