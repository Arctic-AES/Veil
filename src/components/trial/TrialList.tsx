import type { TrialMatch } from '../../shared/types'
import TrialCard from './TrialCard'

type Props = {
  trials: TrialMatch[]
  scores: number[]
  onSelect: (trial: TrialMatch) => void
}

export default function TrialList({ trials, scores, onSelect }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {trials.map((trial, i) => (
        <TrialCard
          key={trial.nctId}
          trial={trial}
          preliminaryScore={scores[i] ?? 0}
          featured={i === 0}
          onSelect={() => onSelect(trial)}
        />
      ))}
    </div>
  )
}
