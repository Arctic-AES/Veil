import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { useEligibility } from '../../hooks/useEligibility'
import { useFlow } from '../../hooks/useFlow'
import { parseCriteria } from '../../api/parseCriteria'
import s from './ScreeningPanel.module.css'

export default function ScreeningPanel() {
  const { state, dispatch } = useFlow()
  const { result, running, error, cooldown, run } = useEligibility()

  const [criteriaOpen, setCriteriaOpen] = useState(false)
  const [overrides, setOverrides] = useState<Record<number, boolean>>({})

  useEffect(() => {
    if (state.patient && state.selectedTrial && !result && !running && cooldown === 0 && !error) {
      run()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.patient, state.selectedTrial, cooldown])

  useEffect(() => {
    setOverrides({})
    setCriteriaOpen(false)
  }, [state.selectedTrial?.nctId])

  const ready = !!state.patient && !!state.selectedTrial
  const status: 'idle' | 'scanning' | 'done' | 'error' = !ready
    ? 'idle'
    : cooldown > 0 || error
      ? 'error'
      : running
        ? 'scanning'
        : result
          ? 'done'
          : 'scanning'

  const parsedCriteria = state.selectedTrial
    ? parseCriteria(state.selectedTrial.eligibilityCriteria)
    : { inclusion: [], exclusion: [] }

  const criteriaList = result?.criteriaAnalysis.map((c, i) => {
    const type = c.type || (parsedCriteria.exclusion.some(
      (ex) => c.criterion.toLowerCase().includes(ex.toLowerCase().slice(0, 30))
    ) ? 'exclusion' : 'inclusion')
    const isOverridden = overrides[i] === true

    let passesInclusion = type === 'inclusion' ? c.met === true : c.met === false
    let failsCheck = type === 'inclusion' ? c.met === false : c.met === true
    let isUnknown = c.met === null

    if (isOverridden) {
      passesInclusion = true
      failsCheck = false
      isUnknown = false
    }

    return { ...c, index: i, type, passesInclusion, failsCheck, isUnknown, isOverridden }
  }) ?? []

  const metCount = criteriaList.filter((c) => c.passesInclusion).length
  const failCount = criteriaList.filter((c) => c.failsCheck).length
  const unknownCount = criteriaList.filter((c) => c.isUnknown).length
  const total = criteriaList.length

  const isEligible = result ? (failCount === 0 && unknownCount === 0) : false

  useEffect(() => {
    if (!result) return
    const globalOverrides = result.criteriaAnalysis.filter(
      (c) => (c as { isOverridden?: boolean }).isOverridden,
    ).length
    const localOverrides = Object.keys(overrides).filter(k => overrides[Number(k)]).length

    if (result.isEligible !== isEligible || globalOverrides !== localOverrides) {
      dispatch({
        type: 'SET_ELIGIBILITY',
        result: {
          ...result,
          isEligible,
          criteriaAnalysis: result.criteriaAnalysis.map((c, i) => ({
            ...c,
            isOverridden: overrides[i] === true
          }))
        }
      })
    }
  }, [isEligible, overrides, result, dispatch])

  return (
    <div className={s.card}>
      <div>
        <h3 className={s.h3}>Local AI screening</h3>
        <p className={s.sub}>
          {state.patient?.isDemo
            ? 'Sample patient — screening runs locally in your browser.'
            : 'Screening runs locally in your browser — nothing is sent to a Veil server.'}
        </p>
      </div>

      <div
        className={clsx(s.status, s[status])}
        style={status === 'error' ? { borderColor: 'var(--amber-soft)', background: 'var(--amber-soft)' } : {}}
      >
        <span
          className={s.pulseDot}
          style={status === 'error' ? { background: 'var(--amber)' } : {}}
        />
        <div className={s.body}>
          <div className={s.t}>
            {status === 'idle' && 'Waiting for records…'}
            {status === 'scanning' && `Screening against ${state.selectedTrial?.nctId}…`}
            {status === 'error' && (cooldown > 0 ? 'AI rate limit reached' : 'Screening error')}
            {status === 'done' && 'Screening complete'}
          </div>
          <div className={s.s}>
            {status === 'error' && cooldown > 0
              ? `Cooling down. Retrying in ${cooldown}s…`
              : status === 'error' && error
                ? error
                : status === 'done' && result
                  ? `${metCount} passed · ${failCount} failed · ${unknownCount} unknown · ${total} total`
                  : 'AI analysis · running locally'}
          </div>
        </div>
      </div>

      {status === 'error' && error && !running && cooldown === 0 && (
        <button className={s.toggleBtn} onClick={run} style={{ marginTop: 8 }}>
          Try again
        </button>
      )}

      {result && (
        <div className={s.confidence}>
          <div className={s.confRow}>
            <span className={s.confLabel}>Confidence score</span>
            <span className={s.confVal}>{result.confidenceScore}%</span>
          </div>
          <div className={s.confBar}>
            <div className={s.confFill} style={{ width: `${result.confidenceScore}%` }} />
          </div>
          <p className={s.confNote}>
            This score reflects how certain the AI is about its eligibility decision, based on how much information was available in your records.{' '}
            <strong>100% means full confidence</strong> (all criteria had clear answers).{' '}
            <strong>Low % means some criteria couldn't be determined</strong> from your records — it does not mean you failed.
          </p>
        </div>
      )}

      {result && (
        <button className={s.toggleBtn} onClick={() => setCriteriaOpen(!criteriaOpen)}>
          <span className={s.toggleIcon}>{criteriaOpen ? '▼' : '▶'}</span>
          <span className={s.toggleText}>
            {criteriaOpen ? 'Hide' : 'View'} detailed criteria analysis ({total})
          </span>
        </button>
      )}

      {result && criteriaOpen && (
        <div className={s.crit}>
          <div className={s.critLegend}>
            <span>Criterion (from trial document)</span>
            <span>Result</span>
          </div>

          {criteriaList.map((c) => {
            return (
              <div key={c.index} className={clsx(s.critRow, c.isUnknown ? s.critUnknown : c.passesInclusion ? s.critPass : s.critFail)}>
                <div className={s.critLeft}>
                  <span className={clsx(s.critType, c.type === 'exclusion' ? s.critTypeEx : s.critTypeIn)}>
                    {c.type === 'inclusion' ? 'MUST MEET' : 'MUST NOT HAVE'}
                  </span>
                  <span className={s.critText}>{c.criterion}</span>
                  {c.reasoning && <span className={s.critReasoning}>{c.reasoning}</span>}

                  {!c.passesInclusion && !c.isOverridden && (
                    <button
                      className={s.overrideBtn}
                      onClick={() => setOverrides(prev => ({ ...prev, [c.index]: true }))}
                    >
                      ✓ I meet this requirement (Override)
                    </button>
                  )}
                </div>

                <div className={s.critRight}>
                  <span className={clsx(s.v, c.isUnknown ? s.vUnknown : c.passesInclusion ? s.vPass : s.vFail)}>
                    {c.isUnknown
                      ? '? Not enough info'
                      : c.passesInclusion
                        ? '✓ Pass'
                        : '✗ Fail'}
                  </span>
                  {c.isOverridden && <div className={s.overriddenBadge}>Manual Override</div>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {result && (
        <div className={clsx(s.elig, isEligible ? s.eligGreen : s.eligRed)}>
          <div className={clsx(s.check, isEligible ? s.checkGreen : s.checkRed)}>
            {isEligible ? '✓' : '✗'}
          </div>
          <div>
            <div className={clsx(s.eligT, isEligible ? s.eligTGreen : s.eligTRed)}>
              {isEligible
                ? `Likely eligible — ${result.confidenceScore}% confidence`
                : `Likely not eligible — ${result.confidenceScore}% confidence`}
            </div>
            <div className={s.eligS}>
              {isEligible
                ? 'All required criteria passed. Ready to generate a ZK proof.'
                : `${failCount + unknownCount} required criterion${(failCount + unknownCount) !== 1 ? 'a' : ''} failed or unknown. Expand the criteria list above to manually override if you meet them.`}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
