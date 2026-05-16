import { useState } from 'react'
import { useFlow } from './useFlow'
import { extractPatientFromPdf } from '../services/pdfExtractor'

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

  async function importFiles(files: FileList) {
    setImporting(true)
    setError(null)
    try {
      const list = Array.from(files)
      const fields = await extractPatientFromPdf(list[0])
      dispatch({ type: 'SET_PATIENT', patient: fields })
      setRecords(
        list.map((f) => ({ name: f.name, size: f.size, status: 'loaded' })),
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to import')
    } finally {
      setImporting(false)
    }
  }

  return {
    patient: state.patient,
    records,
    importing,
    error,
    importFiles,
  }
}
