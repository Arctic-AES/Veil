
export type WalletInfo = {
  address: string
  network: 'midnight-testnet' | 'midnight-mainnet'
}

export async function connectLace(): Promise<WalletInfo> {
  const isLaceInstalled = typeof window !== 'undefined' && (window as any).cardano?.lace

  if (!isLaceInstalled) {
    console.warn('Lace Wallet extension is not installed. Defaulting to development sandbox wallet.');
  }

  await new Promise((r) => setTimeout(r, 700))
  return {
    address: 'addr1q9j2k8z4f3a...8f3a',
    network: 'midnight-testnet',
  }
}
