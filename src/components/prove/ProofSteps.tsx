import clsx from 'clsx'
import type { ProofProgress } from '../../services/zkProver'
import s from './ProofSteps.module.css'

const STEPS: { key: ProofProgress['step']; label: string }[] = [
  { key: 'witness', label: 'Preparing eligibility data' },
  { key: 'compact', label: 'Generating zero-knowledge proof' },
  { key: 'commit', label: 'Signing commitment' },
  { key: 'verify', label: 'Verifying locally' },
]

type Props = {
  progress: ProofProgress[]
  running: boolean
}

export default function ProofSteps({ progress, running }: Props) {
  const lastDone = progress.length
  return (
    <ul className={s.steps}>
      {STEPS.map((step, i) => {
        const done = i < lastDone
        const active = running && i === lastDone
        const ms = done ? progress[i]?.ms : null
        return (
          <li key={step.key} className={clsx(done && s.done, active && s.active)}>
            <span className={s.num}>{i + 1}</span>
            <span>{step.label}</span>
            <span className={s.ms}>
              {done ? `${ms} ms` : active ? 'running…' : '—'}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
