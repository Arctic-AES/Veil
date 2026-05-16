import clsx from 'clsx'
import { useFlow } from '../../hooks/useFlow'
import s from './Stepper.module.css'

const STEPS = [
  { n: 1, label: 'Find' },
  { n: 2, label: 'Match' },
  { n: 3, label: 'Verify' },
  { n: 4, label: 'Prove' },
] as const

export default function Stepper() {
  const { state } = useFlow()
  return (
    <div className={s.stepper}>
      {STEPS.map((step, i) => (
        <div key={step.n} className={s.row}>
          <div
            className={clsx(
              s.step,
              state.step === step.n && s.active,
              state.step > step.n && s.done,
            )}
          >
            <span className={s.num}>{step.n}</span>
            <span className={s.label}>{step.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={clsx(s.bar, state.step > step.n && s.barDone)} />
          )}
        </div>
      ))}
    </div>
  )
}
