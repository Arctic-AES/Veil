import { TrialMatch } from '../shared/types';

// The Clincal Trials.gov's public API
const API_BASE_URL = 'https://clinicaltrials.gov/api/v2/studies';

export async function searchTrials(condition: string): Promise<TrialMatch[]> {
    // URL with search parameters
    const params = new URLSearchParams({
        'query.cond': condition,
        // Search by condition
        'filter.overallStatus': 'RECRUITING,NOT_YET_RECRUITING',
        // Only active trials
        'pageSize': '5',
        'format': 'json',
    });

    const url = `${API_BASE_URL}?${params.toString()}`;
    console.log(`Fetching trials from: ${url}`);

    try {
        // Make the network request to the server
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`ClinicalTrials.gov returned error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Map the messy government JSON into our clean TrialMatch format
        const cleanTrials: TrialMatch[] = data.studies.map((study: any) => {
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
        // If the API crashes, return an empty array
    }
}
