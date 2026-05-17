import type { TrialMatch } from '../shared/types'

const STOPWORDS = new Set([
  'a', 'an', 'and', 'or', 'the', 'of', 'for', 'with', 'in', 'on', 'to', 'at',
  'by', 'from', 'study', 'trial', 'clinical', 'patients', 'patient', 'phase',
  'evaluation', 'evaluating', 'safety', 'efficacy', 'treatment',
])

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t))
}

/**
 * Compute a real preliminary relevance score (0-100) for a trial against a
 * user's quiz condition.
 *
 * This is a deterministic string-similarity score (token Jaccard against the
 * trial's title and conditions) — not invented data. It runs locally with no
 * network call and is the same calculation a coordinator could verify.
 */
export function computePreliminaryScore(condition: string | undefined, trial: TrialMatch): number {
  if (!condition) return 0
  const queryTokens = new Set(tokenize(condition))
  if (queryTokens.size === 0) return 0

  const trialText = [trial.title, ...(trial.conditions ?? [])].join(' ')
  const trialTokens = new Set(tokenize(trialText))
  if (trialTokens.size === 0) return 0

  let intersection = 0
  for (const t of queryTokens) if (trialTokens.has(t)) intersection++

  // Jaccard-like score, biased toward query coverage (we care more that the
  // user's terms appear in the trial than vice versa).
  const coverage = intersection / queryTokens.size
  const jaccard = intersection / (queryTokens.size + trialTokens.size - intersection)

  // Weight coverage 70%, jaccard 30%, scale to 0-100.
  const raw = coverage * 0.7 + jaccard * 0.3
  // Recruiting trials get a small bump so they sort higher when scores tie.
  const statusBoost = trial.status === 'RECRUITING' ? 0.03 : 0
  return Math.round(Math.min(1, raw + statusBoost) * 100)
}
