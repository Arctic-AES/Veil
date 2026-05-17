import { useMemo } from 'react'
import { useFlow } from '../hooks/useFlow'
import { useEligibility } from '../hooks/useEligibility'
import { parseCriteria } from '../api/parseCriteria'
import { computeEligibilityVerdict } from '../lib/eligibilityVerdict'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import WalletTile from '../components/verify/WalletTile'
import RecordsImport from '../components/verify/RecordsImport'
import ScreeningPanel from '../components/verify/ScreeningPanel'
import s from './VerifyPage.module.css'

export default function VerifyPage() {
  const { state, dispatch } = useFlow()
  const { result } = useEligibility()
  const trial = state.selectedTrial

  const canGenerateProof = useMemo(() => {
    if (!state.walletAddress || !state.patient || !result || !trial) return false
    const parsed = parseCriteria(trial.eligibilityCriteria)
    return computeEligibilityVerdict(result.criteriaAnalysis, parsed).isEligible
  }, [state.walletAddress, state.patient, result, trial])

  if (!trial) {
    dispatch({ type: 'SET_STEP', step: 2 })
    return null
  }

  return (
    <div>
      <div className={s.eyebrow}>Step 03 — Verify privately</div>
      <h2 className={s.title}>Confirm eligibility without a Veil server</h2>
      <p className={s.subtitle}>
        Connect your wallet, import your records or use a demo patient — screening runs entirely in your browser. Nothing is sent to a Veil server.
      </p>

      <div className={s.head}>
        <div className={s.headIcon}>{'\u{1FA78}'}</div>
        <div className={s.headBody}>
          <div className={s.headLbl}>Verifying for</div>
          <div className={s.headT}>{trial.title}</div>
          <div className={s.headS}>
            {trial.nctId} · {trial.status}
          </div>
        </div>
        <button className={s.switch} onClick={() => dispatch({ type: 'SET_STEP', step: 2 })}>
          Switch trial
        </button>
      </div>

      <div className={s.split}>
        <Card padded>
          <div className={s.section}>
            <h3 className={s.sectionT}>Connect & import</h3>
            <p className={s.sectionS}>Wallet + medical records</p>
          </div>
          <div className={s.col}>
            <WalletTile />
            <RecordsImport />
            <div className={s.privacy}>
              <div className={s.privacyIcon}>{'\u{1F512}'}</div>
              <div>
                <div className={s.privacyT}>No Veil backend</div>
                <div className={s.privacyS}>
                  All screening runs locally in your browser. No patient data leaves your device. State clears when you close the tab.
                </div>
              </div>
            </div>
          </div>
        </Card>

        <ScreeningPanel />
      </div>

      <div className={s.nav}>
        <Button variant="ghost" onClick={() => dispatch({ type: 'SET_STEP', step: 2 })}>
          ← Back to matches
        </Button>
        <Button
          onClick={() => dispatch({ type: 'SET_STEP', step: 4 })}
          disabled={!canGenerateProof}
          title={
            !state.walletAddress
              ? 'Connect wallet first'
              : !state.patient
                ? 'Import records or choose a demo patient'
                : !canGenerateProof
                  ? 'Complete screening with all criteria passing'
                  : undefined
          }
        >
          Generate commitment →
        </Button>
      </div>
    </div>
  )
}
