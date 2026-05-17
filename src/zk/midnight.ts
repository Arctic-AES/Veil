// @ts-ignore
import { Eligibility } from '../../contracts/eligibility.cjs';

export async function connectMidnight() {

    console.log("Mocking Midnight provider connection...");
    return { mockProvider: true };
}

export async function deployEligibilityContract(trialId: string) {
    const provider = await connectMidnight();
    const paddedId = trialId.padEnd(32, ' ').slice(0, 32);

    const contract = await Eligibility.deploy(provider, {
        publicTrialId: paddedId
    });

    return contract;
}

export async function proveAndSubmitEligibility(contract: any, patientScore: number, requiredScore: number) {
    try {
        await contract.circuits.proveEligibility({
            patientScore: patientScore,
            trialRequirement: requiredScore
        });

        console.log("ZK Proof successful! Eligibility confirmed on-chain.");
        return true;
    } catch (error) {
        console.error("ZK Proof failed: Patient does not meet requirements.");
        return false;
    }
}
