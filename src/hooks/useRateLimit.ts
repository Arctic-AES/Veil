import { useState, useEffect } from 'react'

export function useRateLimit() {
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const id = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(id)
  }, [cooldown])

  const handleRateLimit = (e: unknown) => {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('429') || msg.toLowerCase().includes('quota') || msg.includes('Too Many Requests')) {
      setCooldown(60) // 60 seconds cooldown
      return true
    }
    return false
  }

  return { cooldown, handleRateLimit }
}
