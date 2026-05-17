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
        conditions: [
          "Invasive ductal carcinoma of the breast",
          "Breast cancer, stage IIB, ER+/PR+/HER2+",
          "No history of myocardial infarction",
          "Normal left ventricular ejection fraction (LVEF >= 50%)",
          "No history of active secondary malignancies"
        ],
        medications: ["Tamoxifen (20mg daily)"],
        biomarkers: [
          "HER2 positive (IHC 3+)",
          "Estrogen Receptor positive (ER+, 90%)",
          "Progesterone Receptor positive (PR+, 80%)",
          "HbA1c 5.4% (Normal)",
          "eGFR 95 mL/min (Normal renal function)",
          "Not pregnant, not lactating, post-menopausal"
        ]
      }
      dispatch({ type: 'SET_PATIENT', patient: fields })
      setRecords([
        { name: 'sarah_jenkins_clinical_summary.pdf', size: 124000, status: 'loaded' }
      ])
    } else {
      const fields = {
        age: 58,
        sex: 'male' as const,
        conditions: [
          "Type 2 Diabetes Mellitus (diagnosed 5 years ago)",
          "Mild diabetic peripheral neuropathy",
          "No history of Type 1 Diabetes",
          "No history of diabetic ketoacidosis"
        ],
        medications: ["Metformin (1000mg twice daily)", "Insulin glargine (15 units nightly)"],
        biomarkers: [
          "HbA1c 8.2% (Uncontrolled glycemia)",
          "eGFR 82 mL/min (Normal to mild renal impairment)",
          "Body Mass Index (BMI) 31.2 kg/m2",
          "HER2 negative",
          "No active malignancies"
        ]
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


