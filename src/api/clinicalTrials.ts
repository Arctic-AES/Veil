import type { TrialMatch } from '../shared/types';

// The ClinicalTrials.gov public API
const API_BASE_URL = 'https://clinicaltrials.gov/api/v2/studies';

export async function searchTrials(condition: string): Promise<TrialMatch[]> {
    const params = new URLSearchParams({
        'query.cond': condition,
        'filter.overallStatus': 'RECRUITING,NOT_YET_RECRUITING',
        'pageSize': '5',
        'format': 'json',
    });

    const url = `${API_BASE_URL}?${params.toString()}`;
    console.log(`Fetching trials from: ${url}`);

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`ClinicalTrials.gov returned error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        const cleanTrials: TrialMatch[] = data.studies.map((study: { protocolSection: { identificationModule?: { nctId?: string; briefTitle?: string }; statusModule?: { overallStatus?: string }; conditionsModule?: { conditions?: string[] }; eligibilityModule?: { eligibilityCriteria?: string } } }) => {
            const protocol = study.protocolSection;
            return {
                nctId: protocol.identificationModule?.nctId || 'UNKNOWN',
                title: protocol.identificationModule?.briefTitle || 'Untitled Trial',
                status: protocol.statusModule?.overallStatus || 'UNKNOWN',
                conditions: protocol.conditionsModule?.conditions || [],
                eligibilityCriteria: protocol.eligibilityModule?.eligibilityCriteria || ''
            };
        });

        return cleanTrials;

    } catch (error) {
        console.error('Failed to fetch trials:', error);
        return [];
    }
}
