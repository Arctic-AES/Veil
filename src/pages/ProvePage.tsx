import { useEffect } from 'react'
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
  const { proof, progress, running, generate, reset } = useZkProof()

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
      <div className={s.eyebrow}>Step 04 — Zero-knowledge proof</div>
      <h2 className={s.title}>Prove eligibility. Reveal nothing.</h2>
      <p className={s.subtitle}>
        Veil generates a cryptographic proof attesting that your records satisfy <em>{trial.nctId}</em>'s criteria.
        The coordinator verifies on-chain — without seeing a single field.
      </p>

      <div className={s.grid}>
        <Card padded className={s.stage}>
          <h3 className={s.stageT}>Generating proof</h3>
          <p className={s.stageS}>ZK-SNARK over BLS12-381 · compiled from Compact circuit</p>
          <ProofOrb done={!!proof} />
          <ProofSteps progress={progress} running={running} />
          <Button
            onClick={generate}
            disabled={running || !!proof}
            style={{ width: '100%', justifyContent: 'center', marginTop: 18 }}
          >
            {proof ? 'Proof verified on-chain' : running ? 'Generating…' : 'Generate & submit proof'}
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
              <div className={s.constraintsLbl}>Circuit constraints (proven privately)</div>
              {state.eligibility.criteriaAnalysis.map((c, i) => (
                <div key={i} className={s.cRow}>
                  <span className={s.cK}>{c.criterion}</span>
                  <span className={s.cV}>{c.met ? '✓ satisfied' : '✗ failed'}</span>
                </div>
              ))}
            </div>
          )}
          <div className={s.note}>
            These are checked <strong>inside the proof</strong>. The actual values never leave your device.
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
          <strong>That's the entire flow.</strong> The coordinator can now reach out via your pseudonym to coordinate next steps. You decide if — and what — to share next.
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
