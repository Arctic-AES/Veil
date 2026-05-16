/**
 * PDF -> PatientFields.
 * Delegates to friend's Gemini-powered extractor in src/ai/extractPatient.
 */
import type { PatientFields } from '../shared/types'
import { extractPatientFields } from '../ai/extractPatient'

export async function extractPatientFromPdf(file: File): Promise<PatientFields> {
  return extractPatientFields(file)
}
