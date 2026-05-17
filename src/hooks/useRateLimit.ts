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
    if (
      msg.includes('429') ||
      msg.toLowerCase().includes('quota') ||
      msg.toLowerCase().includes('rate') ||
      msg.includes('Too Many Requests') ||
      msg.includes('RESOURCE_EXHAUSTED')
    ) {
      setCooldown(30)
      return true
    }
    return false
  }

  return { cooldown, handleRateLimit }
}
