import { useMemo } from 'react'
import { useFlow } from '../hooks/useFlow'
import { useTrialMatches } from '../hooks/useTrialMatches'
import { computePreliminaryScore } from '../api/scoring'
import TrialList from '../components/trial/TrialList'
import Button from '../components/ui/Button'
import s from './MatchesPage.module.css'

export default function MatchesPage() {
  const { state, dispatch } = useFlow()
  const { trials, loading, totalCount, error, retry } = useTrialMatches()

  // Compute preliminary scores locally from the quiz condition vs each trial.
  // Real string-similarity computation — no fabricated values.
  const { sortedTrials, scores, topScore } = useMemo(() => {
    const condition = state.quiz.condition
    const scored = trials.map((t) => ({
      trial: t,
      score: computePreliminaryScore(condition, t),
    }))
    scored.sort((a, b) => b.score - a.score)
    return {
      sortedTrials: scored.map((x) => x.trial),
      scores: scored.map((x) => x.score),
      topScore: scored.length > 0 ? scored[0].score : 0,
    }
  }, [trials, state.quiz.condition])

  function selectTrial(trial: typeof sortedTrials[number]) {
    dispatch({ type: 'SELECT_TRIAL', trial })
    dispatch({ type: 'SET_STEP', step: 3 })
  }

  const topMatchStr = sortedTrials.length > 0 ? `${topScore}%` : '—'
  const searched = loading
    ? '…'
    : totalCount > 0
      ? totalCount.toLocaleString()
      : sortedTrials.length.toLocaleString()

  return (
    <div>
      <div className={s.head}>
        <div>
          <div className={s.eyebrow}>Step 02 — Preliminary matches</div>
          <h2 className={s.title}>{loading ? 'Searching…' : `${sortedTrials.length} trials look like a fit`}</h2>
          <p className={s.subtitle}>
            Based on your answers so far. Tap a trial to verify your eligibility privately.
          </p>
        </div>
        <div className={s.stats}>
          <Stat n={searched} l="Trials searched" />
          <Stat n={topMatchStr} l="Top match" />
          <Stat n="Private" l="Screening" />
        </div>
      </div>

      {error && (
        <div className={s.errorBanner} role="alert">
          <div className={s.errorIcon}>!</div>
          <div className={s.errorBody}>
            <div className={s.bannerT}>Could not load trials</div>
            <div className={s.bannerS}>{error}</div>
          </div>
          <Button variant="ghost" onClick={retry}>
            Retry
          </Button>
        </div>
      )}

      <div className={s.banner}>
        <div className={s.bannerIcon}>i</div>
        <div>
          <div className={s.bannerT}>These are preliminary — we haven't seen your records yet.</div>
          <div className={s.bannerS}>
            Scoring uses only your 3 quiz answers. To get a real eligibility check, you'll import your records in the next step.
          </div>
        </div>
      </div>

      <TrialList trials={sortedTrials} scores={scores} onSelect={selectTrial} />

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
