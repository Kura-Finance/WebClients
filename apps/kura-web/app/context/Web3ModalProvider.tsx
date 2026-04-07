// src/context/Web3ModalProvider.tsx
'use client'

import React, { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createConfig, http, WagmiProvider, type State } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { mainnet, arbitrum, polygon } from 'wagmi/chains' // 引入你想要支援的區塊鏈
import AppSessionHydrator from '@/components/AppSessionHydrator'

// 1. 設定 React Query
const queryClient = new QueryClient()

const config = createConfig({
  chains: [mainnet, arbitrum, polygon],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [polygon.id]: http(),
  },
  ssr: false,
})

// 6. 建立 Provider 元件
export default function Web3ModalProvider({
  children,
  initialState
}: {
  children: ReactNode
  initialState?: State
}) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <AppSessionHydrator />
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}