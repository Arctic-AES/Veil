export function parseCriteria(rawText: string): { inclusion: string[]; exclusion: string[] } {
  const result = { inclusion: [] as string[], exclusion: [] as string[] }
  if (!rawText) return result

  const lower = rawText.toLowerCase()
  const incIdx = lower.indexOf('inclusion criteria')
  const excIdx = lower.indexOf('exclusion criteria')

  function skipLabel(text: string, from: number, label: string): number {
    let pos = from + label.length
    if (text[pos] === ':') pos++
    return pos
  }

  function splitBlock(text: string): string[] {
    return text
      .split(/\n\s*[-*•]?\s*(?:\d+[.)]\s+|\*\s+|-\s+)?/)
      .map((l) => l.replace(/\n/g, ' ').trim())
      .filter((l) => l.length > 10)
  }

  if (incIdx !== -1 && excIdx !== -1) {
    result.inclusion = splitBlock(rawText.substring(skipLabel(lower, incIdx, 'inclusion criteria'), excIdx))
    result.exclusion = splitBlock(rawText.substring(skipLabel(lower, excIdx, 'exclusion criteria')))
  } else if (incIdx !== -1) {
    result.inclusion = splitBlock(rawText.substring(skipLabel(lower, incIdx, 'inclusion criteria')))
  } else if (excIdx !== -1) {
    result.exclusion = splitBlock(rawText.substring(skipLabel(lower, excIdx, 'exclusion criteria')))
  }

  return result
}
