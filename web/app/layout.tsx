// src/app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import TopNav from "./components/TopNav";
import Footer from "./components/Footer";
import Web3ModalProvider from '@/context/Web3ModalProvider';

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: "Kura | One app to manage your all financial from tradfi to crypto.",
  description: "Kura | One app to manage your all financial from tradfi to crypto.",
  keywords: ["finance", "web3", "crypto", "assets", "dashboard"],
  authors: [{ name: "Kura" }],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    apple: [
      { url: '/ios/AppIcon.appiconset/icon-60@3x.png', sizes: '180x180', type: 'image/png' },
      { url: '/ios/AppIcon.appiconset/icon-60@2x.png', sizes: '120x120', type: 'image/png' },
    ],
  },
  openGraph: {
    title: "Kura | One app to manage your all financial from tradfi to crypto.",
    description: "Kura | One app to manage your all financial from tradfi to crypto.",
    url: "https://kura-finance.com",
    siteName: "Kura",
    images: [
      {
        url: '/ios/AppIcon.appiconset/icon-1024.png',
        width: 1024,
        height: 1024,
        alt: 'Kura Icon',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Kura | One app to manage your all financial from tradfi to crypto.",
    description: "Kura | One app to manage your all financial from tradfi to crypto.",
    images: '/ios/AppIcon.appiconset/icon-1024.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Viewport & Mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Kura" />
        <meta name="theme-color" content="#8B5CF6" />

        {/* CSP is set via middleware.ts - no need for meta tag */}
        {/* Load Plaid Link script once globally to prevent duplication */}
        <Script
          src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-[#0B0B0F] text-white flex flex-col antialiased selection:bg-[#8B5CF6]/30">
        
        {/* 💡 用 Provider 包住整個應用程式，確保 Navbar 也能讀取錢包狀態 */}
        <Web3ModalProvider>
          {/* 全域頂部導航 */}
          <TopNav />
          
          {/* 把空間完全交給 children (也就是 dashboard 的 layout) */}
          <div className="flex flex-1 overflow-hidden">
            {children}
          </div>

          {/* 全域 Footer */}
          <Footer />
        </Web3ModalProvider>
        
      </body>
    </html>
  );
}