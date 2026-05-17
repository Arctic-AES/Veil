
export function
    parseCriteria(rawText: string): { inclusion: string[], exclusion: string[] } {
    const result = {
        inclusion: [] as
            string[],
        exclusion: [] as
            string[],
    };
    if (!rawText) return result;
    const lowerText = rawText.toLowerCase();
    const inclusionIndex = lowerText.indexOf('inclusion criteria');
    const exclusionIndex = lowerText.indexOf('exclusion criteria');

    let inclusionBlock = "";
    let exclusionBlock = "";

    if (inclusionIndex !== -1 && exclusionIndex !== -1) {
        inclusionBlock = rawText.substring(inclusionIndex + 'inclusion criteria:'.length, exclusionIndex);
        exclusionBlock = rawText.substring(exclusionIndex + 'exclusion criteria:'.length);
    } else if (inclusionIndex !== -1) {
        inclusionBlock = rawText.substring(inclusionIndex + 'inclusion criteria:'.length);
    } else if (exclusionIndex !== -1) {
        exclusionBlock = rawText.substring(exclusionIndex + 'exclusion criteria:'.length);
    }
    const splitIntoBullets = (text: string) => {
        return text.split(/\n\s*[-*0-9.]+\s+/)
            .map(line => line.trim())
            .filter(line => line.length > 10)
    };
    result.inclusion = splitIntoBullets(inclusionBlock);
    result.exclusion = splitIntoBullets(exclusionBlock);
    return result;
}
