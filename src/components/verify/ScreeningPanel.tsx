import { useEffect } from 'react'
import clsx from 'clsx'
import { useEligibility } from '../../hooks/useEligibility'
import { useFlow } from '../../hooks/useFlow'
import s from './ScreeningPanel.module.css'

export default function ScreeningPanel() {
  const { state } = useFlow()
  const { result, running, error, cooldown, run } = useEligibility()

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

  return (
    <div className={s.card}>
      <div>
        <h3 className={s.h3}>Local AI screening</h3>
        <p className={s.sub}>Runs in this browser after records load.</p>
      </div>

      <div className={clsx(s.status, s[status])} style={status === 'error' ? { borderColor: 'var(--amber-soft)', background: 'var(--amber-soft)' } : {}}>
        <span className={s.pulseDot} style={status === 'error' ? { background: 'var(--amber)' } : {}} />
        <div className={s.body}>
          <div className={s.t}>
            {status === 'idle' && 'Waiting for records…'}
            {status === 'scanning' && `Screening locally against ${state.selectedTrial?.nctId}…`}
            {status === 'error' && (cooldown > 0 ? 'AI rate limit reached' : 'Screening error')}
            {status === 'done' && 'Screening complete'}
          </div>
          <div className={s.s}>
            {status === 'error' && cooldown > 0
              ? `Cooling down. Retrying in ${cooldown}s...`
              : status === 'error' && error
                ? error
                : status === 'done' && result
                  ? `${result.criteriaAnalysis.filter((c) => c.met).length}/${result.criteriaAnalysis.length} constraints satisfied · ${result.confidenceScore}% confidence`
                  : 'Phi-3 Mini · 4-bit · WebGPU'}
          </div>
        </div>
      </div>

      {result && (
        <div className={s.crit}>
          {result.criteriaAnalysis.map((c, i) => (
            <div key={i} className={s.critRow}>
              <span>{c.criterion}</span>
              <span className={s.v}>{c.met ? '✓ satisfied' : c.met === false ? '✗ failed' : '? unknown'}</span>
            </div>
          ))}
        </div>
      )}

      {result && result.isEligible && (
        <div className={s.elig}>
          <div className={s.check}>✓</div>
          <div>
            <div className={s.eligT}>Eligible — {result.confidenceScore}% confidence</div>
            <div className={s.eligS}>All constraints satisfied. Ready to generate proof.</div>
          </div>
        </div>
      )}
    </div>
  )
}
