// src/context/Web3ModalProvider.tsx
'use client'

import React, { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createConfig, http, WagmiProvider, type State } from 'wagmi'
import { injected, walletConnect } from 'wagmi/connectors'
import { mainnet, arbitrum, polygon } from 'wagmi/chains' // 引入你想要支援的區塊鏈
import AppSessionHydrator from '@/components/AppSessionHydrator'

// 1. 設定 React Query
const queryClient = new QueryClient()

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
const walletMetadataUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'
const connectors = walletConnectProjectId
  ? [
      walletConnect({
        projectId: walletConnectProjectId,
        showQrModal: true,
        metadata: {
          name: 'Kura',
          description: 'Kura wallet connection',
          url: walletMetadataUrl,
          icons: ['https://walletconnect.com/walletconnect-logo.png'],
        },
      }),
      injected(),
    ]
  : [injected()]

const config = createConfig({
  chains: [mainnet, arbitrum, polygon],
  connectors,
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