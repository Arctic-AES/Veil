import { useEffect } from 'react'
import clsx from 'clsx'
import { useFlow } from '../hooks/useFlow'
import { useZkProof } from '../hooks/useZkProof'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import ProofOrb from '../components/prove/ProofOrb'
import ProofSteps from '../components/prove/ProofSteps'
import CompareView from '../components/prove/CompareView'
import s from './ProvePage.module.css'

export default function ProvePage() {
  const { state, dispatch } = useFlow()
  const { proof, progress, running, error, generate, reset } = useZkProof()

  useEffect(() => {
    reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const trial = state.selectedTrial
  if (!trial) {
    dispatch({ type: 'SET_STEP', step: 2 })
    return null
  }

  return (
    <div>
      <div className={s.eyebrow}>Step 04 — Eligibility proof</div>
      <h2 className={s.title}>Prove eligibility. Reveal nothing.</h2>
      <p className={s.subtitle}>
        Your eligibility is proven with zero-knowledge cryptography for <em>{trial.nctId}</em>. Only the result is disclosed — your medical records stay private.
      </p>

      <div className={s.grid}>
        <Card padded className={s.stage}>
          <h3 className={s.stageT}>Zero-knowledge proof</h3>
          <p className={s.stageS}>
            A tamper-proof commitment binds your screening result and record hashes. Connect Lace to submit to the Midnight network.
          </p>
          <ProofOrb done={!!proof} />
          <ProofSteps progress={progress} running={running} />
          {error && (
            <p style={{ color: 'var(--red)', fontSize: 13, marginTop: 10 }}>{error}</p>
          )}
          <Button
            onClick={generate}
            disabled={running || !!proof}
            style={{ width: '100%', justifyContent: 'center', marginTop: 18 }}
          >
            {proof ? 'Proof package ready' : running ? 'Proving…' : 'Generate Midnight proof'}
          </Button>
        </Card>

        <Card padded>
          <div className={s.pill}>
            <span className={s.pillDot} /> Selected trial
          </div>
          <h3 className={s.cardT}>{trial.title}</h3>
          <div className={s.cardS}>
            {trial.nctId} · {trial.status}
          </div>
          {state.eligibility && (
            <div className={s.constraints}>
              <div className={s.constraintsLbl}>Eligibility criteria</div>
              {state.eligibility.criteriaAnalysis.map((c, i) => {
                const isExclusion = c.type === 'exclusion'
                const overridden = (c as { isOverridden?: boolean }).isOverridden === true
                const isPass = overridden || (isExclusion ? c.met === false : c.met === true)
                const isFail = !overridden && (isExclusion ? c.met === true : c.met === false)
                const isUnknown = c.met === null && !overridden
                return (
                  <div key={i} className={clsx(s.cRow, isFail ? s.cRowFail : isPass ? s.cRowPass : s.cRowUnknown)}>
                    <span className={s.cK}>{c.criterion}</span>
                    <span className={s.cV} style={isFail ? {color: '#b91c1c'} : isUnknown ? {color: '#92400e'} : {}}>
                      {overridden ? '✓ Overridden' : isUnknown ? '? Not enough info' : isPass ? '✓ Pass' : '✗ Fail'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
          <div className={s.note}>
            These values stay on your device — the commitment only encodes verdicts and hashes.
          </div>
        </Card>
      </div>

      {proof && state.patient && state.walletAddress && (
        <CompareView
          patient={state.patient}
          proof={proof}
          walletAddress={state.walletAddress}
        />
      )}

      <div className={s.cta}>
        <div className={s.ctaLeft}>
          <strong>Proof package ready.</strong> Commitment verified locally. Connect Lace to submit your eligibility proof to Midnight.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="ghost" onClick={() => dispatch({ type: 'SET_STEP', step: 3 })}>
            ← Re-verify
          </Button>
          <Button onClick={() => dispatch({ type: 'RESET' })}>Start over</Button>
        </div>
      </div>
    </div>
  )
}
