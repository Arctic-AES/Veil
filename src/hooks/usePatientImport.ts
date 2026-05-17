import { useState } from 'react'
import { useFlow } from './useFlow'
import { extractPatientFromMultiplePdfs } from '../services/pdfExtractor'
import { sha256Files } from '../lib/fileHash'
import { hasGeminiApiKey } from '../config/env'
import { useRateLimit } from './useRateLimit'
import type { PatientFields } from '../shared/types'

export type ImportedRecord = {
  name: string
  size: number
  status: 'loaded'
}

const DEMO_BREAST: PatientFields = {
  isDemo: true,
  age: 45,
  sex: 'female',
  conditions: [
    'Invasive ductal carcinoma, right breast, stage IIB',
    'ER-positive (90%), PR-positive (75%), HER2-positive (IHC 3+, confirmed by FISH)',
    'Completed lumpectomy with negative surgical margins (R0)',
    'LVEF 58% on echocardiogram (within normal limits)',
    'No prior anthracycline-based or anti-HER2 therapy',
    'No active CNS metastases on recent MRI',
    'No active autoimmune or inflammatory disease',
    'No prior or concurrent secondary malignancy',
    'Adequate bone marrow function: ANC 2.1 × 10⁹/L, platelets 198 × 10⁹/L, Hgb 12.9 g/dL',
  ],
  medications: [
    'Tamoxifen 20 mg daily',
    'Calcium carbonate 600 mg / Vitamin D3 400 IU daily',
  ],
  biomarkers: [
    'HER2 IHC 3+ (FISH amplified, ratio 2.4)',
    'ER+ 90%, PR+ 75% by IHC',
    'Ki-67 proliferation index 28%',
    'eGFR 94 mL/min/1.73 m² (CKD-EPI)',
    'HbA1c 5.3% (normal)',
    'ALT 22 U/L, AST 19 U/L (normal hepatic function)',
    'Hemoglobin 12.9 g/dL',
    'Platelet count 198 × 10⁹/L',
    'Post-menopausal, negative pregnancy test',
  ],
}

const DEMO_DIABETES: PatientFields = {
  isDemo: true,
  age: 58,
  sex: 'male',
  conditions: [
    'Type 2 Diabetes Mellitus, diagnosed 2019, insulin-requiring',
    'Mild symmetrical peripheral neuropathy, diabetic etiology',
    'No history of Type 1 Diabetes or latent autoimmune diabetes (LADA)',
    'No prior diabetic ketoacidosis or hyperosmolar hyperglycemic state',
    'No active or recent cardiovascular event (no MI, stroke, or unstable angina in past 12 months)',
    'No known active malignancy',
    'No severe hepatic impairment',
    'Stable renal function, no dialysis',
    'Body weight stable over prior 3 months',
  ],
  medications: [
    'Metformin 1000 mg twice daily',
    'Insulin glargine 18 units nightly',
    'Lisinopril 10 mg daily',
    'Atorvastatin 20 mg nightly',
  ],
  biomarkers: [
    'HbA1c 8.1% (elevated, indicating suboptimal glycemic control)',
    'Fasting plasma glucose 172 mg/dL',
    'eGFR 79 mL/min/1.73 m² (mildly reduced)',
    'BMI 31.4 kg/m²',
    'Blood pressure 132/80 mmHg',
    'LDL-C 96 mg/dL',
    'ALT 31 U/L (normal)',
    'C-peptide 1.2 ng/mL (residual beta-cell function present)',
  ],
}

export function usePatientImport() {
  const { state, dispatch } = useFlow()
  const [records, setRecords] = useState<ImportedRecord[]>([])
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { cooldown, handleRateLimit } = useRateLimit()

  async function importFiles(files: FileList) {
    if (cooldown > 0) return
    if (!hasGeminiApiKey()) {
      setError('An API key is required to import PDFs. Use Demo Patients to explore without one.')
      return
    }
    setImporting(true)
    setError(null)
    try {
      const list = Array.from(files)
      const documentHashes = await sha256Files(list)
      const fields = await extractPatientFromMultiplePdfs(list)
      dispatch({ type: 'SET_PATIENT', patient: fields, source: 'import', documentHashes })
      setRecords((prev) => [
        ...prev,
        ...list.map((f) => ({ name: f.name, size: f.size, status: 'loaded' as const })),
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
    const patient = type === 'breast' ? DEMO_BREAST : DEMO_DIABETES
    dispatch({ type: 'SET_PATIENT', patient, source: 'demo', documentHashes: [] })
    setRecords([
      type === 'breast'
        ? { name: 'sarah_jenkins_clinical_summary.pdf (demo)', size: 124000, status: 'loaded' }
        : { name: 'marcus_vance_ehr_extract.json (demo)', size: 45000, status: 'loaded' },
    ])
  }

  return {
    patient: state.patient,
    patientSource: state.patientSource,
    records,
    importing,
    error,
    cooldown,
    importFiles,
    loadSamplePatient,
    canImportFiles: hasGeminiApiKey(),
  }
}
