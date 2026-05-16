/**
 * Wallet connection (Lace).
 * Stub now — replace with real Lace SDK call when ready.
 */
export type WalletInfo = {
  address: string
  network: 'midnight-testnet' | 'midnight-mainnet'
}

export async function connectLace(): Promise<WalletInfo> {
  // TODO: replace with window.lace?.enable() or @midnight-ntwrk/lace-wallet-connector
  await new Promise((r) => setTimeout(r, 700))
  return {
    address: 'addr1q9j2k8z4f3a...8f3a',
    network: 'midnight-testnet',
  }
}
