import { useRef } from 'react'
import { usePatientImport } from '../../hooks/usePatientImport'
import RecordRow from './RecordRow'
import s from './RecordsImport.module.css'

export default function RecordsImport() {
  const { records, importing, importFiles, patient } = usePatientImport()
  const inputRef = useRef<HTMLInputElement>(null)

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
    <div className={s.zone} onClick={pick}>
      <div className={s.iconBig}>{'\u{1F4C2}'}</div>
      <div className={s.t}>{importing ? 'Reading…' : 'Import records to this browser'}</div>
      <div className={s.s}>FHIR, CCDA, PDF, or CSV · processed locally</div>
      <button type="button" className={s.btn}>Choose records</button>
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
  )
}
