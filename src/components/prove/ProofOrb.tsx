import clsx from 'clsx'
import s from './ProofOrb.module.css'

type Props = { done?: boolean }

export default function ProofOrb({ done }: Props) {
  return (
    <div className={s.anim}>
      <div className={clsx(s.ring, s.r2)} />
      <div className={clsx(s.ring, s.r1)} />
      <div className={clsx(s.orb, done && s.done)}>
        {done ? '✓' : '\u{1F512}'}
      </div>
    </div>
  )
}
