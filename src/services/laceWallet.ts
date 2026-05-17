import '@midnight-ntwrk/dapp-connector-api'
import type { ConnectedAPI, InitialAPI } from '@midnight-ntwrk/dapp-connector-api'

export type LaceConnection = {
  networkId: string
  shieldedAddress: string
  unshieldedAddress: string
  api: ConnectedAPI
}

const NETWORK = import.meta.env.VITE_MIDNIGHT_NETWORK?.trim() || 'preprod'

function getLaceApi(): InitialAPI | null {
  if (typeof window === 'undefined') return null
  const midnight = window.midnight
  if (!midnight) return null
  return midnight.mnLace ?? midnight.lace ?? Object.values(midnight)[0] ?? null
}

export function isLaceAvailable(): boolean {
  return !!getLaceApi()
}

export async function connectLaceWallet(): Promise<LaceConnection> {
  const wallet = getLaceApi()
  if (!wallet) {
    throw new Error(
      'Midnight Lace wallet not found. Install Lace and enable the Midnight network extension.',
    )
  }

  const api = await wallet.connect(NETWORK)
  const connectionStatus = await api.getConnectionStatus()
  if (!connectionStatus) {
    throw new Error('Lace did not return a connected status.')
  }

  const shielded = await api.getShieldedAddresses()
  const unshielded = await api.getUnshieldedAddress()

  return {
    networkId: NETWORK,
    shieldedAddress: shielded.shieldedAddress,
    unshieldedAddress: unshielded.unshieldedAddress,
    api,
  }
}

export function getMidnightNetworkId(): string {
  return NETWORK
}
