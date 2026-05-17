import { GoogleGenerativeAI } from '@google/generative-ai'
import { requireGeminiApiKey } from '../config/env'
import { PatientFieldsSchema, type PatientFields } from '../shared/types'

async function extractFromFile(file: File): Promise<PatientFields> {
  const apiKey = requireGeminiApiKey()
  const genAI = new GoogleGenerativeAI(apiKey)

  if (file.type && file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('Only PDF medical records are supported. Use Demo Patients for a guided sample.')
  }

  const base64String = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1]
      if (!base64) {
        reject(new Error(`Could not read file: ${file.name}`))
        return
      }
      resolve(base64)
    }
    reader.onerror = () => reject(new Error(`Could not read file: ${file.name}`))
    reader.readAsDataURL(file)
  })

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  })

  const prompt = `
    You are an expert clinical trial specialist and medical data extractor.
    Read this patient's medical summary PDF.
    Extract the patient's data and return it as a JSON object.
    You MUST adhere EXACTLY to this JSON structure (schema-validated):
    {
        "age": 34,
        "sex": "male" | "female" | "unknown",
        "conditions": ["Breast cancer", "Stage IIB"],
        "medications": ["tamoxifen", "anastrozole"],
        "biomarkers": ["HER2+", "ER+", "PR+"]
    }
    Rules:
    - age: integer or null if not listed
    - sex: lowercase string, one of "male" | "female" | "unknown"
    - conditions, medications, biomarkers: ARRAYS of plain strings (never objects)
    - omit biomarkers entirely if none present
    - do not invent values; use null or empty arrays when information is absent
    Return ONLY the JSON object, no markdown fences, no commentary.
    `

  const result = await model.generateContent([
    prompt,
    { inlineData: { data: base64String, mimeType: 'application/pdf' } },
  ])

  const responseText = result.response.text()
  const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim()
  const rawObject = JSON.parse(cleanJson)

  return PatientFieldsSchema.parse(rawObject)
}

function mergePatientFields(records: PatientFields[]): PatientFields {
  if (records.length === 0) throw new Error('No records to merge')
  if (records.length === 1) return records[0]

  return {
    age: records.find((r) => r.age !== null)?.age ?? null,
    sex: records.find((r) => r.sex !== 'unknown')?.sex ?? 'unknown',
    conditions: [...new Set(records.flatMap((r) => r.conditions))],
    medications: [...new Set(records.flatMap((r) => r.medications))],
    biomarkers: [...new Set(records.flatMap((r) => r.biomarkers ?? []))],
  }
}

export async function extractPatientFields(file: File): Promise<PatientFields> {
  return extractFromFile(file)
}

export async function extractPatientFieldsFromMultiple(files: File[]): Promise<PatientFields> {
  const results = await Promise.all(files.map((f) => extractFromFile(f)))
  return mergePatientFields(results)
}
