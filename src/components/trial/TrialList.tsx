import type { TrialMatch } from '../../shared/types'
import TrialCard from './TrialCard'

type Props = {
  trials: TrialMatch[]
  onSelect: (trial: TrialMatch) => void
}

const FAKE_SCORES = [97, 88, 74, 65, 60]

export default function TrialList({ trials, onSelect }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {trials.map((trial, i) => (
        <TrialCard
          key={trial.nctId}
          trial={trial}
          preliminaryScore={FAKE_SCORES[i] ?? 50}
          featured={i === 0}
          onSelect={() => onSelect(trial)}
        />
      ))}
    </div>
  )
}
