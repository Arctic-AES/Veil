import type { PatientFields, ZKProofPayload } from '../../shared/types'
import s from './CompareView.module.css'

type Props = {
  patient: PatientFields
  proof: ZKProofPayload
  walletAddress: string
}

const NEVER_VISIBLE = [
  'age',
  'name',
  'diagnosis',
  'stage',
  'HER2 status',
  'medications',
  'prior treatments',
  'ECOG',
  'genetic data',
  'address',
]

export default function CompareView({ patient, proof, walletAddress }: Props) {
  const proofShort = proof.proofBytes.slice(0, 18) + '…' + proof.proofBytes.slice(-6)
  return (
    <div className={s.compare}>
      <div className={s.head}>
        <div className={s.iconLg}>{'\u{1F512}'}</div>
        <div>
          <h3 className={s.h3}>What each side sees</h3>
          <div className={s.sub}>Same screening event — very different views.</div>
        </div>
      </div>
      <div className={s.grid}>
        <div className={s.side}>
          <div className={s.label}>
            <span className={s.pip} /> Your view (patient)
          </div>
          <div className={s.table}>
            <div className={s.row}>
              <span className={s.k}>Age</span>
              <span className={s.v}>{patient.age ?? 'not listed'}</span>
            </div>
            <div className={s.row}>
              <span className={s.k}>Sex</span>
              <span className={s.v}>{patient.sex}</span>
            </div>
            <div className={s.row}>
              <span className={s.k}>Conditions</span>
              <span className={s.v}>{patient.conditions.join(', ')}</span>
            </div>
            <div className={s.row}>
              <span className={s.k}>Medications</span>
              <span className={s.v}>{patient.medications.join(', ')}</span>
            </div>
            {patient.biomarkers && (
              <div className={s.row}>
                <span className={s.k}>Biomarkers</span>
                <span className={s.v}>{patient.biomarkers.join(', ')}</span>
              </div>
            )}
            <div className={s.row}>
              <span className={s.k}>Proof status</span>
              <span className={s.v} style={{ color: 'var(--green)' }}>SUBMITTED ✓</span>
            </div>
          </div>
        </div>

        <div className={`${s.side} ${s.coord}`}>
          <div className={`${s.label} ${s.labelCoord}`}>
            <span className={`${s.pip} ${s.pipCoord}`} /> Coordinator's view
          </div>
          <div className={s.coordView}>
            <div className={s.badge}>
              <span className={s.check}>✓</span> ELIGIBLE
            </div>
            <div className={s.coordMeta}>
              <div className={s.crow}><span className={s.ck}>Trial</span><span className={s.cv}>{proof.trialId}</span></div>
              <div className={s.crow}><span className={s.ck}>Submitted</span><span className={s.cv}>{new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC</span></div>
              <div className={s.crow}><span className={s.ck}>Verifier</span><span className={s.cv}>midnight://verify/v1</span></div>
              <div className={s.crow}><span className={s.ck}>Proof π</span><span className={`${s.cv} ${s.proof}`}>{proofShort}</span></div>
              <div className={s.crow}><span className={s.ck}>Patient ID</span><span className={s.cv}>{walletAddress.slice(0, 12)}…</span></div>
            </div>
            <div className={s.never}>
              <div className={s.neverLbl}>Never visible to coordinator</div>
              <ul className={s.neverList}>
                {NEVER_VISIBLE.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
