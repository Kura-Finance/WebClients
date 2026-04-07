// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import TopNav from "./components/TopNav";
import Web3ModalProvider from '@/context/Web3ModalProvider';

export const metadata: Metadata = {
  title: "Kura | Your Financial Nexus",
  description: "Track your cross-border fiat and web3 assets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="h-screen bg-[#0B0B0F] text-white flex flex-col overflow-hidden antialiased selection:bg-[#8B5CF6]/30">
        
        {/* 💡 用 Provider 包住整個應用程式，確保 Navbar 也能讀取錢包狀態 */}
        <Web3ModalProvider>
          {/* 全域頂部導航 */}
          <TopNav />
          
          {/* 把空間完全交給 children (也就是 dashboard 的 layout) */}
          <div className="flex flex-1 overflow-hidden">
            {children}
          </div>
        </Web3ModalProvider>
        
      </body>
    </html>
  );
}