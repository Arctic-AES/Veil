import { useState } from 'react'
import { useFlow } from './useFlow'
import { connectWallet } from '../services/walletClient'

export function useWallet() {
  const { state, dispatch } = useFlow()
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function connect() {
    setConnecting(true)
    setError(null)
    try {
      const info = await connectWallet()
      dispatch({ type: 'SET_WALLET', address: info.address, kind: info.kind })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to connect')
    } finally {
      setConnecting(false)
    }
  }

  return {
    address: state.walletAddress,
    kind: state.walletKind,
    connected: !!state.walletAddress,
    connecting,
    error,
    connect,
  }
}
