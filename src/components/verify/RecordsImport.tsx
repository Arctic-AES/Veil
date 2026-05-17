import { useRef, useState } from 'react'
import { usePatientImport } from '../../hooks/usePatientImport'
import RecordRow from './RecordRow'
import s from './RecordsImport.module.css'

export default function RecordsImport() {
  const {
    records,
    importing,
    importFiles,
    patient,
    patientSource,
    error,
    cooldown,
    loadSamplePatient,
    canImportFiles,
  } = usePatientImport()
  const inputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState<'upload' | 'demo'>('upload')

  function pick() {
    inputRef.current?.click()
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) importFiles(e.target.files)
  }

  if (records.length > 0 || patient) {
    return (
      <div className={s.list}>
        {patientSource === 'demo' && (
          <div className={s.demoBadge} role="status">
            Sample patient profile
          </div>
        )}
        {records.length === 0 ? (
          <RecordRow name="(patient profile loaded)" size={0} />
        ) : (
          records.map((r) => <RecordRow key={r.name} name={r.name} size={r.size} />)
        )}
      </div>
    )
  }

  return (
    <div>
      <div className={s.tabs}>
        <button
          type="button"
          className={`${s.tab} ${activeTab === 'upload' ? s.tabActive : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          Import PDF
        </button>
        <button
          type="button"
          className={`${s.tab} ${activeTab === 'demo' ? s.tabActive : ''}`}
          onClick={() => setActiveTab('demo')}
        >
          Demo Patients
        </button>
      </div>

      {activeTab === 'upload' ? (
        <div
          className={s.zone}
          onClick={cooldown > 0 || !canImportFiles ? undefined : pick}
          style={cooldown > 0 || !canImportFiles ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
        >
          <div className={s.iconBig}>{'\u{1F4C2}'}</div>
          <div className={s.t}>{importing ? 'Reading…' : 'Import PDF to this browser'}</div>
          {cooldown > 0 ? (
            <div className={s.s} style={{ color: 'var(--amber)', fontWeight: 500 }}>
              AI cooling down. Try again in {cooldown}s...
            </div>
          ) : error ? (
            <div className={s.s} style={{ color: 'var(--red)', fontWeight: 500 }}>
              {error}
            </div>
          ) : !canImportFiles ? (
            <div className={s.s} style={{ color: 'var(--amber)', fontWeight: 500 }}>
              API key required to import real PDFs — or use Demo Patients below
            </div>
          ) : (
            <div className={s.s}>PDF only · analyzed in your browser · never sent to a Veil server</div>
          )}
          <button type="button" className={s.btn} disabled={cooldown > 0 || !canImportFiles}>
            Choose PDF
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,application/pdf"
            style={{ display: 'none' }}
            onChange={onChange}
          />
        </div>
      ) : (
        <div className={s.demoContainer}>
          <p className={s.demoHint}>
            Sample profiles for Breast Cancer and Type 2 Diabetes. Select one to run the full eligibility flow.
          </p>
          <button type="button" className={s.demoCard} onClick={() => loadSamplePatient('breast')}>
            <div className={s.demoAvatar}>SJ</div>
            <div className={s.demoMeta}>
              <div className={s.demoName}>Sarah Jenkins</div>
              <div className={s.demoDesc}>Female, Age 45 · HER2+ ER+ Breast Cancer</div>
              <span className={s.demoPill}>Demo profile</span>
            </div>
          </button>

          <button type="button" className={s.demoCard} onClick={() => loadSamplePatient('diabetes')}>
            <div className={s.demoAvatar}>MV</div>
            <div className={s.demoMeta}>
              <div className={s.demoName}>Marcus Vance</div>
              <div className={s.demoDesc}>Male, Age 58 · Type 2 Diabetes</div>
              <span className={s.demoPill}>Demo profile</span>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
