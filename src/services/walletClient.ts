/**
 * Wallet connection (Lace).
 * Stub now — replace with real Lace SDK call when ready.
 */
export type WalletInfo = {
  address: string
  network: 'midnight-testnet' | 'midnight-mainnet'
}

export async function connectLace(): Promise<WalletInfo> {
  // Check if Lace is actually installed in the browser
  const isLaceInstalled = typeof window !== 'undefined' && (window as any).cardano?.lace

  if (!isLaceInstalled) {
    throw new Error('Lace Wallet extension is not installed. Please install it to continue.')
  }

  // Simulate connection delay for now until real Midnight SDK is hooked up
  await new Promise((r) => setTimeout(r, 700))
  return {
    address: 'addr1q9j2k8z4f3a...8f3a',
    network: 'midnight-testnet',
  }
}
