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
      // Process ALL selected files and merge them into one patient profile
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

  return {
    patient: state.patient,
    records,
    importing,
    error,
    cooldown,
    importFiles,
  }
}

