import { useRef, useState } from 'react'
import { usePatientImport } from '../../hooks/usePatientImport'
import RecordRow from './RecordRow'
import s from './RecordsImport.module.css'

export default function RecordsImport() {
  const { records, importing, importFiles, patient, error, cooldown, loadSamplePatient } = usePatientImport()
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
        {records.length === 0 ? (
          <RecordRow name="(extracted patient record)" size={0} />
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
          Import local files
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
        <div className={s.zone} onClick={cooldown > 0 ? undefined : pick} style={cooldown > 0 ? { opacity: 0.7, cursor: 'not-allowed' } : {}}>
          <div className={s.iconBig}>{'\u{1F4C2}'}</div>
          <div className={s.t}>{importing ? 'Reading…' : 'Import records to this browser'}</div>
          {cooldown > 0 ? (
            <div className={s.s} style={{ color: 'var(--amber)', fontWeight: 500 }}>
              AI cooling down. Try again in {cooldown}s...
            </div>
          ) : error ? (
            <div className={s.s} style={{ color: 'var(--red)', fontWeight: 500 }}>Error: {error}</div>
          ) : (
            <div className={s.s}>FHIR, CCDA, PDF, or CSV · processed locally</div>
          )}
          <button type="button" className={s.btn} disabled={cooldown > 0}>Choose records</button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.json,.xml,.csv"
            style={{ display: 'none' }}
            onChange={onChange}
          />
          <div className={s.formats}>
            <span className={s.fmt}>FHIR JSON</span>
            <span className={s.fmt}>CCDA XML</span>
            <span className={s.fmt}>PDF</span>
            <span className={s.fmt}>CSV</span>
          </div>
        </div>
      ) : (
        <div className={s.demoContainer}>
          <button type="button" className={s.demoCard} onClick={() => loadSamplePatient('breast')}>
            <div className={s.demoAvatar}>SJ</div>
            <div className={s.demoMeta}>
              <div className={s.demoName}>Sarah Jenkins</div>
              <div className={s.demoDesc}>Female, Age 45 · HER2+ ER+ Breast Cancer</div>
              <span className={s.demoPill}>Clinical Summary PDF</span>
            </div>
          </button>

          <button type="button" className={s.demoCard} onClick={() => loadSamplePatient('diabetes')}>
            <div className={s.demoAvatar}>MV</div>
            <div className={s.demoMeta}>
              <div className={s.demoName}>Marcus Vance</div>
              <div className={s.demoDesc}>Male, Age 58 · Type 2 Diabetes</div>
              <span className={s.demoPill}>FHIR EHR JSON</span>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
