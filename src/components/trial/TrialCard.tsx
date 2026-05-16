import clsx from 'clsx'
import type { TrialMatch } from '../../shared/types'
import Tag from '../ui/Tag'
import ScoreRing from '../ui/ScoreRing'
import Button from '../ui/Button'
import s from './TrialCard.module.css'

type Props = {
  trial: TrialMatch
  preliminaryScore: number
  featured?: boolean
  onSelect: () => void
}

export default function TrialCard({ trial, preliminaryScore, featured, onSelect }: Props) {
  return (
    <div className={clsx(s.trial, featured && s.featured)}>
      <div className={s.meta}>
        <div className={s.tags}>
          {featured && <Tag tone="teal">Top match</Tag>}
          <Tag>{trial.status}</Tag>
          {trial.conditions.slice(0, 2).map((c) => (
            <Tag key={c} tone="violet">
              {c}
            </Tag>
          ))}
        </div>
        <div className={s.title}>{trial.title}</div>
        <div className={s.sub}>{trial.nctId}</div>
        <div className={s.crit}>
          {trial.eligibilityCriteria
            .split(/[.;]/)
            .filter(Boolean)
            .slice(0, 4)
            .map((line, i) => (
              <span key={i}>
                <span className={s.ck}>✓</span>
                {line.trim().slice(0, 40)}
              </span>
            ))}
        </div>
      </div>
      <ScoreRing score={preliminaryScore} label="Pre-score" />
      <div className={s.cta}>
        <Button variant={featured ? 'primary' : 'ghost'} onClick={onSelect}>
          Verify privately →
        </Button>
      </div>
    </div>
  )
}
