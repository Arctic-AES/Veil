import type { EligibilityResult } from '../shared/types'

type CriterionRow = EligibilityResult['criteriaAnalysis'][number] & {
  isOverridden?: boolean
}

export function computeEligibilityVerdict(
  criteriaAnalysis: CriterionRow[],
  parsed: { inclusion: string[]; exclusion: string[] },
): { isEligible: boolean; failCount: number; unknownCount: number; metCount: number } {
  let failCount = 0
  let unknownCount = 0
  let metCount = 0

  for (let i = 0; i < criteriaAnalysis.length; i++) {
    const c = criteriaAnalysis[i]
    const type =
      c.type ||
      (parsed.exclusion.some((ex) =>
        c.criterion.toLowerCase().includes(ex.toLowerCase().slice(0, 30)),
      )
        ? 'exclusion'
        : 'inclusion')

    const isOverridden = c.isOverridden === true
    let passes = type === 'inclusion' ? c.met === true : c.met === false
    let fails = type === 'inclusion' ? c.met === false : c.met === true
    const unknown = c.met === null

    if (isOverridden) {
      passes = true
      fails = false
    }

    if (passes) metCount++
    if (fails) failCount++
    if (!isOverridden && unknown) unknownCount++
  }

  return {
    isEligible: failCount === 0 && unknownCount === 0,
    failCount,
    unknownCount,
    metCount,
  }
}
