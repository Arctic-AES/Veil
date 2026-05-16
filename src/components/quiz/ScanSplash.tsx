import { useEffect, useState } from 'react'
import s from './ScanSplash.module.css'

type Phase = { t: string; sub: string }

type Props = {
  phases: Phase[]
  durationMs: number
  onDone: () => void
}

export default function ScanSplash({ phases, durationMs, onDone }: Props) {
  const [i, setI] = useState(0)

  useEffect(() => {
    const phaseMs = durationMs / phases.length
    const iv = setInterval(() => setI((x) => Math.min(x + 1, phases.length - 1)), phaseMs)
    const done = setTimeout(onDone, durationMs)
    return () => {
      clearInterval(iv)
      clearTimeout(done)
    }
  }, [phases.length, durationMs, onDone])

  const cur = phases[i] ?? phases[0]
  return (
    <div className={s.splash}>
      <div className={s.orb}>{'\u{1F9E0}'}</div>
      <div className={s.text}>{cur.t}</div>
      <div className={s.sub}>{cur.sub}</div>
      <div className={s.progress}>
        <div className={s.bar} style={{ animationDuration: `${durationMs}ms` }} />
      </div>
    </div>
  )
}
