import s from './ScoreRing.module.css'

type Props = { score: number; label?: string }

export default function ScoreRing({ score, label = 'Match' }: Props) {
  const pct = Math.max(0, Math.min(100, score))
  return (
    <div className={s.wrap}>
      <div
        className={s.ring}
        style={{ ['--p' as string]: `${pct}%` } as React.CSSProperties}
      >
        <span>{pct}%</span>
      </div>
      <div className={s.label}>{label}</div>
    </div>
  )
}
