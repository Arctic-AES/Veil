/**
 * PDF -> PatientFields extractor.
 * Stub now — wire pdfjs-dist text extraction + a parser (or pass extracted text to Gemini).
 */
import {
  PatientFieldsSchema,
  type PatientFields,
} from '../shared/types'

const MOCK: PatientFields = {
  age: 34,
  sex: 'female',
  conditions: ['Breast cancer', 'Stage IIB', 'HER2+'],
  medications: ['tamoxifen', 'anastrozole'],
  biomarkers: ['HER2+', 'ER+', 'PR+'],
}

export async function extractPatientFromPdf(_file: File): Promise<PatientFields> {
  // TODO: use pdfjs-dist getDocument() -> page.getTextContent() -> regex/LLM parse
  await new Promise((r) => setTimeout(r, 1200))
  return PatientFieldsSchema.parse(MOCK)
}
