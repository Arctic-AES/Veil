import { useState } from 'react'
import { useFlow } from './useFlow'
import { extractPatientFromMultiplePdfs } from '../services/pdfExtractor'
import { useRateLimit } from './useRateLimit'

export type ImportedRecord = {
  name: string
  size: number
  status: 'loaded'
}

export function usePatientImport() {
  const { state, dispatch } = useFlow()
  const [records, setRecords] = useState<ImportedRecord[]>([])
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { cooldown, handleRateLimit } = useRateLimit()

  async function importFiles(files: FileList) {
    if (cooldown > 0) return
    setImporting(true)
    setError(null)
    try {
      const list = Array.from(files)
      const fields = await extractPatientFromMultiplePdfs(list)
      dispatch({ type: 'SET_PATIENT', patient: fields })
      setRecords(prev => [
        ...prev,
        ...list.map((f) => ({ name: f.name, size: f.size, status: 'loaded' as const }))
      ])
    } catch (e) {
      if (handleRateLimit(e)) {
        setError(null)
      } else {
        setError(e instanceof Error ? e.message : 'Failed to import')
      }
    } finally {
      setImporting(false)
    }
  }

  function loadSamplePatient(type: 'breast' | 'diabetes') {
    setError(null)
    if (type === 'breast') {
      const fields = {
        age: 45,
        sex: 'female' as const,
        conditions: ["Breast cancer", "Stage IIB", "Invasive ductal carcinoma"],
        medications: ["Tamoxifen"],
        biomarkers: ["HER2+", "ER+", "PR-"]
      }
      dispatch({ type: 'SET_PATIENT', patient: fields })
      setRecords([
        { name: 'sarah_jenkins_clinical_summary.pdf', size: 124000, status: 'loaded' }
      ])
    } else {
      const fields = {
        age: 58,
        sex: 'male' as const,
        conditions: ["Type 2 Diabetes", "Diabetic neuropathy"],
        medications: ["Metformin", "Insulin glargine"],
        biomarkers: ["HbA1c 8.2%"]
      }
      dispatch({ type: 'SET_PATIENT', patient: fields })
      setRecords([
        { name: 'marcus_vance_ehr_extract.json', size: 45000, status: 'loaded' }
      ])
    }
  }

  return {
    patient: state.patient,
    records,
    importing,
    error,
    cooldown,
    importFiles,
    loadSamplePatient,
  }
}


