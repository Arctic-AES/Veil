import { useEffect, useState } from 'react'
import s from './HeroVisual.module.css'

export default function HeroVisual() {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; delay: number; duration: number }[]>([])

  useEffect(() => {
    const list = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      delay: Math.random() * 4,
      duration: 6 + Math.random() * 6,
    }))
    setParticles(list)
  }, [])

  return (
    <div className={s.hero} aria-hidden="true">
      <div className={s.meshGrid} />
      <div className={s.shieldContainer}>
        <div className={s.glowBackdrop} />
        <div className={s.pulsingCore} />
        <div className={s.orbitalRing} />
        <div className={s.innerShield}>
          <div className={s.shieldIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
        </div>
      </div>
      {particles.map((p) => (
        <div
          key={p.id}
          className={s.particle}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
      <div className={s.vignette} />
    </div>
  )
}
