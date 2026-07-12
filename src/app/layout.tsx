import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Anouce from "@/components/anouncement";
import Header from "@/components/Header";
import Footer from "@/components/footer";
import { CartProvider } from "@/components/cartContext";
import LoadingBar from "@/components/loading";
import { AuthProvider } from "@/components/authContext";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "SHOP.CO",
  description: "Your favorite clothing marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to Google Fonts for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preload hero image */}
        <link rel="preload" href="/images/Hero.png" as="image" />
        <link rel="preload" href="/profile.png" as="image" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <LoadingBar />
            <Anouce />
            <Header />
            {children}
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
