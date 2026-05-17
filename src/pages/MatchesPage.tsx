import { useFlow } from '../hooks/useFlow'
import { useTrialMatches } from '../hooks/useTrialMatches'
import TrialList from '../components/trial/TrialList'
import Button from '../components/ui/Button'
import s from './MatchesPage.module.css'

export default function MatchesPage() {
  const { dispatch } = useFlow()
  const { trials, loading, totalCount } = useTrialMatches()

  function selectTrial(trial: typeof trials[number]) {
    dispatch({ type: 'SELECT_TRIAL', trial })
    dispatch({ type: 'SET_STEP', step: 3 })
  }

  const matchRate = totalCount > 0 ? Math.round((trials.length / totalCount) * 100) : 0
  const topMatch = trials.length > 0 ? matchRate + '%' : '—'
  const searched = loading ? '…' : totalCount > 0 ? totalCount.toLocaleString() : trials.length.toLocaleString()

  return (
    <div>
      <div className={s.head}>
        <div>
          <div className={s.eyebrow}>Step 02 — Preliminary matches</div>
          <h2 className={s.title}>{loading ? 'Searching…' : `${trials.length} trials look like a fit`}</h2>
          <p className={s.subtitle}>
            Based on your answers so far. Tap a trial to verify your eligibility privately — we'll read your records on this device only.
          </p>
        </div>
        <div className={s.stats}>
          <Stat n={searched} l="Trials searched" />
          <Stat n={topMatch} l="Match rate" />
          <Stat n="Gemini 2.5" l="AI model" />
        </div>
      </div>

      <div className={s.banner}>
        <div className={s.bannerIcon}>i</div>
        <div>
          <div className={s.bannerT}>These are preliminary — we haven't seen your records yet.</div>
          <div className={s.bannerS}>
            Scoring uses only your 3 quiz answers. To get a real eligibility check, you'll import your records to this device in the next step. They stay here. The trial sponsors still don't know you exist.
          </div>
        </div>
      </div>

      <TrialList trials={trials} onSelect={selectTrial} />

      <div className={s.nav}>
        <Button variant="ghost" onClick={() => dispatch({ type: 'SET_STEP', step: 1 })}>
          ← Adjust answers
        </Button>
        <span className={s.hint}>Pick a trial to continue</span>
      </div>
    </div>
  )
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className={s.stat}>
      <span className={s.statN}>{n}</span>
      <span className={s.statL}>{l}</span>
    </div>
  )
}
