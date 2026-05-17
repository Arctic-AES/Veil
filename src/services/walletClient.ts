export type WalletInfo = {
  address: string
  network: 'midnight-testnet' | 'midnight-mainnet'
  isDemoWallet: boolean
}

export async function connectLace(): Promise<WalletInfo> {
  const isLaceInstalled =
    typeof window !== 'undefined' && (window as any).cardano?.lace

  if (!isLaceInstalled) {
    console.info('Lace extension not detected - using Veil sandbox wallet.')
  } else {
    console.info('Lace extension detected - using sandbox wallet for hackathon demo stability.')
  }

  const randomBytes = new Uint8Array(20)
  crypto.getRandomValues(randomBytes)
  const hex = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  await new Promise((r) => setTimeout(r, 350))

  return {
    address: `demo1${hex}`,
    network: 'midnight-testnet',
    isDemoWallet: true,
  }
}
