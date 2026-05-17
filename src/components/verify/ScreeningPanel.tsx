import { useEffect } from 'react'
import clsx from 'clsx'
import { useEligibility } from '../../hooks/useEligibility'
import { useFlow } from '../../hooks/useFlow'
import { parseCriteria } from '../../api/parseCriteria'
import s from './ScreeningPanel.module.css'

export default function ScreeningPanel() {
  const { state } = useFlow()
  const { result, running, error, cooldown, run } = useEligibility()

  // Re-run whenever trial changes (eligibility is cleared in reducer on SELECT_TRIAL)
  useEffect(() => {
    if (state.patient && state.selectedTrial && !result && !running && cooldown === 0 && !error) {
      run()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.patient, state.selectedTrial, cooldown])

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

  // Parse which criteria are inclusion vs exclusion so we can label them
  const parsedCriteria = state.selectedTrial
    ? parseCriteria(state.selectedTrial.eligibilityCriteria)
    : { inclusion: [], exclusion: [] }

  const metCount = result?.criteriaAnalysis.filter((c) => c.met === true).length ?? 0
  const failCount = result?.criteriaAnalysis.filter((c) => c.met === false).length ?? 0
  const unknownCount = result?.criteriaAnalysis.filter((c) => c.met === null).length ?? 0
  const total = result?.criteriaAnalysis.length ?? 0

  return (
    <div className={s.card}>
      <div>
        <h3 className={s.h3}>Local AI screening</h3>
        <p className={s.sub}>
          Runs entirely in this browser. Your records are never sent to any server.
        </p>
      </div>

      {/* Status bar */}
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
                  : 'Gemini 2.5 Flash · running on-device'}
          </div>
        </div>
      </div>

      {/* Confidence explanation */}
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

      {/* Criteria list */}
      {result && (
        <div className={s.crit}>
          <div className={s.critLegend}>
            <span>Criterion (from trial document)</span>
            <span>Result</span>
          </div>

          {result.criteriaAnalysis.map((c, i) => {
            // Determine if this is an inclusion or exclusion criterion by checking both lists
            const isExclusion = parsedCriteria.exclusion.some(
              (ex) => c.criterion.toLowerCase().includes(ex.toLowerCase().slice(0, 30))
            )
            const type = isExclusion ? 'exclusion' : 'inclusion'

            // For inclusion: met=true is GOOD (✓), met=false is BAD (✗)
            // For exclusion: met=false is GOOD (you don't have the excluding condition), met=true is BAD
            const passesInclusion = type === 'inclusion' ? c.met === true : c.met === false
            const failsCheck = type === 'inclusion' ? c.met === false : c.met === true
            const isUnknown = c.met === null

            return (
              <div key={i} className={clsx(s.critRow, isUnknown ? s.critUnknown : passesInclusion ? s.critPass : s.critFail)}>
                <div className={s.critLeft}>
                  <span className={clsx(s.critType, type === 'exclusion' ? s.critTypeEx : s.critTypeIn)}>
                    {type === 'inclusion' ? 'MUST MEET' : 'MUST NOT HAVE'}
                  </span>
                  <span className={s.critText}>{c.criterion}</span>
                  {c.reasoning && <span className={s.critReasoning}>{c.reasoning}</span>}
                </div>
                <span className={clsx(s.v, isUnknown ? s.vUnknown : passesInclusion ? s.vPass : s.vFail)}>
                  {isUnknown
                    ? '? Not enough info'
                    : passesInclusion
                      ? '✓ Pass'
                      : failsCheck
                        ? '✗ Fail'
                        : '?'}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Final verdict */}
      {result && (
        <div className={clsx(s.elig, result.isEligible ? s.eligGreen : s.eligRed)}>
          <div className={clsx(s.check, result.isEligible ? s.checkGreen : s.checkRed)}>
            {result.isEligible ? '✓' : '✗'}
          </div>
          <div>
            <div className={clsx(s.eligT, result.isEligible ? s.eligTGreen : s.eligTRed)}>
              {result.isEligible
                ? `Likely eligible — ${result.confidenceScore}% confidence`
                : `Likely not eligible — ${result.confidenceScore}% confidence`}
            </div>
            <div className={s.eligS}>
              {result.isEligible
                ? 'All required criteria passed. Ready to generate a ZK proof.'
                : `${failCount} required criterion${failCount !== 1 ? 'a' : ''} failed. Consider reviewing your records or selecting a different trial.`}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
