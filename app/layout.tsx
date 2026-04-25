// 應用程式根版面配置
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Web3ModalProvider from '@/context/Web3ModalProvider';
import { PlaidProvider } from '@/context/PlaidProvider';

export const metadata: Metadata = {
  metadataBase: new URL('https://kura-finance.com'),
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
        {/* 視窗與行動裝置設定 */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Kura" />
        <meta name="theme-color" content="#8B5CF6" />
        <Script id="kura-theme-init" strategy="beforeInteractive">
          {`
            (function () {
              try {
                var stored = localStorage.getItem('kura-theme');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                var mode = stored === 'light' || stored === 'dark' ? stored : (prefersDark ? 'dark' : 'light');
                if (mode === 'dark') document.documentElement.classList.add('dark');
              } catch (_) {}
            })();
          `}
        </Script>

        {/* CSP 由 `middleware.ts` 設定，這裡不需要 meta 標籤 */}
        {/* 全域載入 Plaid Link 腳本，實際偵測由 `PlaidProvider` 處理 */}
        <Script
          src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="w-full h-screen bg-[var(--kura-bg)] text-[var(--kura-text)] flex flex-col antialiased selection:bg-[var(--kura-primary)]/30">
        
        {/* 用 provider 包住整個應用程式，確保導覽列也能讀取錢包狀態 */}
        <PlaidProvider>
          <Web3ModalProvider>
            {/* 版面空間完全交給 children（也就是 dashboard 版面） */}
            <div className="flex flex-col flex-1 overflow-hidden w-full h-full">
              {children}
            </div>
          </Web3ModalProvider>
        </PlaidProvider>
        
      </body>
    </html>
  );
}