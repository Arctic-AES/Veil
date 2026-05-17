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
          <p className={s.stageS}>Cryptographic eligibility commitment · SHA-256 over canonicalized witness · derived from the Compact circuit shape in contracts/eligibility.compact</p>
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
              {state.eligibility.criteriaAnalysis.map((c: any, i) => {
                const isPass = c.met === true || c.isOverridden === true
                const isFail = c.met === false && !c.isOverridden
                const isUnknown = c.met === null && !c.isOverridden
                return (
                  <div key={i} className={clsx(s.cRow, isFail ? s.cRowFail : isPass ? s.cRowPass : s.cRowUnknown)}>
                    <span className={s.cK}>{c.criterion}</span>
                    <span className={s.cV} style={isFail ? {color: '#b91c1c'} : isUnknown ? {color: '#92400e'} : {}}>
                      {c.isOverridden ? '✓ Overridden' : isUnknown ? '? Not enough info' : isPass ? '✓ Pass' : '✗ Fail'}
                    </span>
                  </div>
                )
              })}
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
          <strong>Proof generated and submitted.</strong> Trial coordinators can verify your eligibility without ever seeing your medical records. If selected, they will reach out via your wallet pseudonym to coordinate your enrollment.
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
