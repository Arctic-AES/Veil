import { connectLaceWallet, isLaceAvailable } from './laceWallet'

export type WalletInfo = {
  address: string
  network: 'midnight-testnet' | 'midnight-mainnet' | 'preprod' | string
  isDemoWallet: boolean
  kind: 'lace' | 'demo'
  shieldedAddress?: string
}

export class LaceNotInstalledError extends Error {
  constructor() {
    super(
      'Midnight Lace wallet not found. Install Lace (https://www.lace.io/) or use demo mode for local UI only.',
    )
    this.name = 'LaceNotInstalledError'
  }
}

export async function connectWallet(options?: {
  allowDemoFallback?: boolean
}): Promise<WalletInfo> {
  const allowDemo = options?.allowDemoFallback !== false

  if (isLaceAvailable()) {
    try {
      const lace = await connectLaceWallet()
      return {
        address: lace.shieldedAddress,
        network: lace.networkId,
        isDemoWallet: false,
        kind: 'lace',
        shieldedAddress: lace.shieldedAddress,
      }
    } catch (e) {
      if (!allowDemo) throw e
    }
  } else if (!allowDemo) {
    throw new LaceNotInstalledError()
  }

  const randomBytes = new Uint8Array(20)
  crypto.getRandomValues(randomBytes)
  const hex = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return {
    address: `demo1${hex}`,
    network: 'preprod',
    isDemoWallet: true,
    kind: 'demo',
  }
}

export const connectLace = connectWallet
