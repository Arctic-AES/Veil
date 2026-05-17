import type { TrialMatch } from '../shared/types';

// The ClinicalTrials.gov public API
const API_BASE_URL = 'https://clinicaltrials.gov/api/v2/studies';

export type TrialSearchResult = {
    trials: TrialMatch[];
    totalCount: number;
}

export async function searchTrials(condition: string, region?: string): Promise<TrialSearchResult> {
    const params = new URLSearchParams({
        'query.cond': condition,
        'filter.overallStatus': 'RECRUITING,NOT_YET_RECRUITING',
        'pageSize': '10',
        'format': 'json',
        'countTotal': 'true',
    });

    if (region) {
        // The ClinicalTrials.gov v2 API supports location search via query.locn
        params.set('query.locn', region);
    }

    const url = `${API_BASE_URL}?${params.toString()}`;
    console.log(`Fetching trials from: ${url}`);

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`ClinicalTrials.gov returned error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const totalCount: number = data.totalCount ?? data.studies?.length ?? 0;

        const cleanTrials: TrialMatch[] = (data.studies ?? []).map((study: { protocolSection: { identificationModule?: { nctId?: string; briefTitle?: string }; statusModule?: { overallStatus?: string }; conditionsModule?: { conditions?: string[] }; eligibilityModule?: { eligibilityCriteria?: string } } }) => {
            const protocol = study.protocolSection;
            return {
                nctId: protocol.identificationModule?.nctId || 'UNKNOWN',
                title: protocol.identificationModule?.briefTitle || 'Untitled Trial',
                status: protocol.statusModule?.overallStatus || 'UNKNOWN',
                conditions: protocol.conditionsModule?.conditions || [],
                eligibilityCriteria: protocol.eligibilityModule?.eligibilityCriteria || ''
            };
        });

        return { trials: cleanTrials, totalCount };

    } catch (error) {
        console.error('Failed to fetch trials:', error);
        return { trials: [], totalCount: 0 };
    }
}
