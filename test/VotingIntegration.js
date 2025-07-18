const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting Integration Tests", function () {
  // Variables used throughout the tests
  let Voting;
  let votingContract;
  let owner;
  let voters = [];
  const candidates = ["Alice", "Bob", "Charlie", "David", "Eve"];
  const VOTER_COUNT = 50; // Number of simulated voters

  before(async function () {
    // This runs once before all tests
    // Deploy contract and set up test accounts
    Voting = await ethers.getContractFactory("Voting");
    const accounts = await ethers.getSigners();
    owner = accounts[0];

    // Create array of voter accounts (skip the owner)
    for (let i = 1; i <= VOTER_COUNT && i < accounts.length; i++) {
      voters.push(accounts[i]);
    }

    // Deploy the contract
    votingContract = await Voting.deploy(candidates);
    await votingContract.deployed();

    console.log(`Contract deployed to: ${votingContract.address}`);
    console.log(`Testing with ${voters.length} voter accounts`);
  });

  describe("Simulated Election", function () {
    it("Should handle a large number of voters", async function () {
      // Record initial state
      const initialVotes = {};
      for (const candidate of candidates) {
        initialVotes[candidate] = (
          await votingContract.getVotes(candidate)
        ).toNumber();
      }

      // Cast votes from multiple accounts
      const votingPromises = [];
      const voterChoices = {};

      for (let i = 0; i < voters.length; i++) {
        // Select a random candidate
        const candidateIndex = Math.floor(Math.random() * candidates.length);
        const selectedCandidate = candidates[candidateIndex];

        // Record this voter's choice for verification later
        voterChoices[voters[i].address] = selectedCandidate;

        // Add the voting transaction to our batch
        votingPromises.push(
          votingContract.connect(voters[i]).vote(selectedCandidate)
        );
      }

      // Execute all voting transactions
      await Promise.all(votingPromises);

      // Verify each voter's status
      for (let i = 0; i < voters.length; i++) {
        const hasVoted = await votingContract.hasVoted(voters[i].address);
        expect(hasVoted).to.equal(true, `Voter ${i} should be marked as voted`);
      }

      // Count expected votes for each candidate
      const expectedVotes = { ...initialVotes };
      for (const voterAddr in voterChoices) {
        const candidate = voterChoices[voterAddr];
        expectedVotes[candidate]++;
      }

      // Verify vote counts match expectations
      for (const candidate of candidates) {
        const voteCount = await votingContract.getVotes(candidate);
        expect(voteCount).to.equal(
          expectedVotes[candidate],
          `Vote count for ${candidate} should match expected value`
        );
      }
    });

    it("Should correctly reset voters and allow revoting", async function () {
      // Take first 5 voters and reset them
      const resettingVoters = voters.slice(0, 5);

      for (const voter of resettingVoters) {
        await votingContract.connect(owner).resetVoter(voter.address);

        // Verify reset was successful
        const hasVoted = await votingContract.hasVoted(voter.address);
        expect(hasVoted).to.equal(
          false,
          `Voter ${voter.address} should be reset`
        );

        // Vote again with a fixed choice
        await votingContract.connect(voter).vote("Alice");

        // Verify new vote was accepted
        const votedAgain = await votingContract.hasVoted(voter.address);
        expect(votedAgain).to.equal(
          true,
          `Voter ${voter.address} should show as voted after revoting`
        );
      }

      // Verify Alice's vote count increased by the number of reset voters
      const aliceVotes = await votingContract.getVotes("Alice");
      expect(aliceVotes).to.be.at.least(
        resettingVoters.length,
        "Alice should have received the new votes"
      );
    });
  });

  describe("Contract ABI Verification", function () {
    it("Should have all the required functions in the ABI", async function () {
      const requiredFunctions = [
        "vote",
        "getVotes",
        "getAllCandidates",
        "resetVoter",
        "resetAllVotes",
        "checkVoteStatus",
        "hasVoted",
        "owner",
      ];

      // Extract function names from contract ABI
      const abi = votingContract.interface.fragments.filter(
        (f) => f.type === "function"
      );
      const abiMethods = abi.map((fragment) => fragment.name);

      // Check that all required functions are present
      for (const funcName of requiredFunctions) {
        expect(abiMethods).to.include(
          funcName,
          `Contract ABI should include ${funcName}`
        );
      }
    });
  });

  describe("Stress Testing", function () {
    it("Should handle concurrent vote requests", async function () {
      // Only run if we reset the contract state first
      await votingContract.connect(owner).resetAllVotes();

      // Reset all voters
      for (const voter of voters) {
        await votingContract.connect(owner).resetVoter(voter.address);
      }

      // Create batches of concurrent voters
      const batchSize = 10;
      const batches = [];

      for (let i = 0; i < voters.length; i += batchSize) {
        const batchVoters = voters.slice(i, i + batchSize);
        const batchPromises = batchVoters.map((voter, index) => {
          // Round-robin assignment of candidates
          const candidateIndex = index % candidates.length;
          return votingContract.connect(voter).vote(candidates[candidateIndex]);
        });

        batches.push(Promise.all(batchPromises));
      }

      // Execute all batches in sequence (each batch has concurrent votes)
      for (let i = 0; i < batches.length; i++) {
        await batches[i];
        console.log(`Processed batch ${i + 1} of ${batches.length}`);
      }

      // Verify all voters are marked as voted
      let votedCount = 0;
      for (const voter of voters) {
        if (await votingContract.hasVoted(voter.address)) {
          votedCount++;
        }
      }

      expect(votedCount).to.equal(
        voters.length,
        "All voters should be marked as voted"
      );

      // Log final vote counts
      console.log("Final vote counts:");
      for (const candidate of candidates) {
        const votes = await votingContract.getVotes(candidate);
        console.log(`${candidate}: ${votes}`);
      }
    });
  });
});
