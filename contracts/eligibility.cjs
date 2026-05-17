// High-fidelity ZK Compact contract mock for Eligibility
class MockContract {
  constructor(provider, args) {
    this.provider = provider;
    this.trialId = args.publicTrialId;
    this.isEligible = false;
    this.circuits = {
      proveEligibility: async ({ patientScore, trialRequirement }) => {
        // Assert constraint matching eligibility.compact: assert patientScore >= trialRequirement;
        if (patientScore < trialRequirement) {
          throw new Error("ZK Constraint failed: patientScore is lower than trialRequirement!");
        }
        this.isEligible = true;
        return true;
      }
    };
  }
}

const Eligibility = {
  deploy: async (provider, args) => {
    // Simulate smart contract deployment block time
    await new Promise(resolve => setTimeout(resolve, 800));
    return new MockContract(provider, args);
  }
};

// Pure, standard CommonJS export matching compiled compact contract output
module.exports = { Eligibility };
