const PLACEHOLDER = /^(your[_-]?api[_-]?key|your_actual_api_key_here|xxx+)$/i

export function getGeminiApiKey(): string | undefined {
  const raw = import.meta.env.VITE_GEMINI_API_KEY?.trim()
  if (!raw || PLACEHOLDER.test(raw)) return undefined
  return raw
}

export function requireGeminiApiKey(): string {
  const key = getGeminiApiKey()
  if (!key) {
    throw new Error(
      'VITE_GEMINI_API_KEY is missing or still a placeholder. Add a real key from Google AI Studio to your .env file.',
    )
  }
  return key
}

export function hasGeminiApiKey(): boolean {
  return !!getGeminiApiKey()
}

const DEFAULT_CT_STUDIES_URL = 'https://clinicaltrials.gov/api/v2/studies'

/**
 * Resolves the ClinicalTrials.gov studies search endpoint.
 * Accepts either .../api/v2 or .../api/v2/studies (legacy .env values omitted /studies).
 */
export function getClinicalTrialsApiBase(): string {
  const base = import.meta.env.VITE_CT_API_BASE?.trim()
  if (!base) return DEFAULT_CT_STUDIES_URL

  const normalized = base.replace(/\/+$/, '')
  if (normalized.endsWith('/studies')) return normalized
  if (normalized.endsWith('/api/v2')) return `${normalized}/studies`
  return normalized
}
