/**
 * PDF -> PatientFields.
 * Delegates to friend's Gemini-powered extractor in src/ai/extractPatient.
 */
import type { PatientFields } from '../shared/types'
import { extractPatientFields, extractPatientFieldsFromMultiple } from '../ai/extractPatient'

export async function extractPatientFromPdf(file: File): Promise<PatientFields> {
  return extractPatientFields(file)
}

export async function extractPatientFromMultiplePdfs(files: File[]): Promise<PatientFields> {
  return extractPatientFieldsFromMultiple(files)
}
