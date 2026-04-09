// src/AppKitConfig.ts - AppKit initialization with WalletConnect support
import '@walletconnect/react-native-compat'

import { createAppKit } from '@reown/appkit-react-native'
import { EthersAdapter } from '@reown/appkit-ethers-react-native'
import { mainnet, polygon, arbitrum, avalanche, bsc, fantom } from 'viem/chains'
import { storageAdapter } from './StorageAdapter'

const projectId = process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  throw new Error(
    'WALLETCONNECT_PROJECT_ID environment variable is not defined. ' +
    'Please obtain it from https://dashboard.reown.com/ and set it in your environment variables.'
  )
}

const ethersAdapter = new EthersAdapter()

/**
 * AppKit Configuration
 * Supports multiple EVM chains for wallet connection
 * Enables wallet detection and QR code connection via WalletConnect
 */
export const appKit = createAppKit({
  projectId,
  networks: [mainnet, polygon, arbitrum, avalanche, bsc, fantom],
  defaultNetwork: mainnet,
  adapters: [ethersAdapter],
  storage: storageAdapter,

  metadata: {
    name: 'Kura',
    description: 'Your best finance partner app',
    url: 'https://kura-web-642134687769.europe-west1.run.app',
    icons: ['https://assets.reown.com/reown-studio/b6bfe22e-dbc4-4b7e-92c4-704c99fbc51c/image-3.png'],
    redirect: {
      native: 'kura://',
      universal: 'https://kura-web-642134687769.europe-west1.run.app'
    }
  }
})