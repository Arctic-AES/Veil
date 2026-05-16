import { useState } from 'react'
import { useFlow } from './useFlow'
import { connectLace } from '../services/walletClient'

export function useWallet() {
  const { state, dispatch } = useFlow()
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function connect() {
    setConnecting(true)
    setError(null)
    try {
      const info = await connectLace()
      dispatch({ type: 'SET_WALLET', address: info.address })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to connect')
    } finally {
      setConnecting(false)
    }
  }

  return {
    address: state.walletAddress,
    connected: !!state.walletAddress,
    connecting,
    error,
    connect,
  }
}
