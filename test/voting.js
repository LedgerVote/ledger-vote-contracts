const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting Contract Tests", function () {
  // Variables used throughout the tests
  let Voting;
  let votingContract;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  const candidates = ["Candidate 1", "Candidate 2", "Candidate 3"];

  beforeEach(async function () {
    // Deploy a new Voting contract before each test
    Voting = await ethers.getContractFactory("Voting");
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    votingContract = await Voting.deploy(candidates);
    await votingContract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await votingContract.owner()).to.equal(owner.address);
    });

    it("Should set the correct candidates", async function () {
      const contractCandidates = await votingContract.getAllCandidates();
      expect(contractCandidates.length).to.equal(candidates.length);
      for (let i = 0; i < candidates.length; i++) {
        expect(contractCandidates[i]).to.equal(candidates[i]);
      }
    });
  });

  describe("Voting Functionality", function () {
    it("Should allow a user to vote", async function () {
      // Vote as addr1
      await votingContract.connect(addr1).vote("Candidate 1");

      // Check if the vote was counted
      expect(await votingContract.getVotes("Candidate 1")).to.equal(1);

      // Check if the user has voted
      expect(await votingContract.hasVoted(addr1.address)).to.equal(true);
    });

    it("Should prevent a user from voting twice", async function () {
      // First vote should succeed
      await votingContract.connect(addr1).vote("Candidate 1");

      // Second vote should fail with "Already voted" error
      await expect(
        votingContract.connect(addr1).vote("Candidate 2")
      ).to.be.revertedWith("Already voted");
    });

    it("Should reject votes for non-existent candidates", async function () {
      await expect(
        votingContract.connect(addr1).vote("Non-existent Candidate")
      ).to.be.revertedWith("Invalid candidate");
    });

    it("Should count votes correctly for multiple candidates", async function () {
      // Vote for first candidate as addr1
      await votingContract.connect(addr1).vote("Candidate 1");

      // Vote for second candidate as addr2
      await votingContract.connect(addr2).vote("Candidate 2");

      // Vote for first candidate as addr3
      await votingContract.connect(addr3).vote("Candidate 1");

      // Check vote counts
      expect(await votingContract.getVotes("Candidate 1")).to.equal(2);
      expect(await votingContract.getVotes("Candidate 2")).to.equal(1);
      expect(await votingContract.getVotes("Candidate 3")).to.equal(0);
    });
  });

  describe("Admin Functionality", function () {
    it("Should allow the owner to reset a voter", async function () {
      // Vote as addr1
      await votingContract.connect(addr1).vote("Candidate 1");
      expect(await votingContract.hasVoted(addr1.address)).to.equal(true);

      // Reset voter as owner
      await votingContract.connect(owner).resetVoter(addr1.address);
      expect(await votingContract.hasVoted(addr1.address)).to.equal(false);

      // addr1 should be able to vote again
      await votingContract.connect(addr1).vote("Candidate 2");
      expect(await votingContract.getVotes("Candidate 2")).to.equal(1);
    });

    it("Should prevent non-owners from resetting a voter", async function () {
      // Try to reset a voter as non-owner
      await expect(
        votingContract.connect(addr1).resetVoter(addr2.address)
      ).to.be.revertedWith("Only owner can call this function");
    });

    it("Should allow the owner to reset all votes", async function () {
      // Cast some votes
      await votingContract.connect(addr1).vote("Candidate 1");
      await votingContract.connect(addr2).vote("Candidate 2");
      await votingContract.connect(addr3).vote("Candidate 1");

      // Reset all votes
      await votingContract.connect(owner).resetAllVotes();

      // Check that vote counts are reset
      expect(await votingContract.getVotes("Candidate 1")).to.equal(0);
      expect(await votingContract.getVotes("Candidate 2")).to.equal(0);
      expect(await votingContract.getVotes("Candidate 3")).to.equal(0);

      // Note: This doesn't reset hasVoted status
      expect(await votingContract.hasVoted(addr1.address)).to.equal(true);
      expect(await votingContract.hasVoted(addr2.address)).to.equal(true);
      expect(await votingContract.hasVoted(addr3.address)).to.equal(true);
    });

    it("Should prevent non-owners from resetting all votes", async function () {
      await expect(
        votingContract.connect(addr1).resetAllVotes()
      ).to.be.revertedWith("Only owner can call this function");
    });
  });

  describe("Check Vote Status", function () {
    it("Should correctly report vote status", async function () {
      // Initially, no one has voted
      expect(await votingContract.checkVoteStatus(addr1.address)).to.equal(
        false
      );

      // Vote as addr1
      await votingContract.connect(addr1).vote("Candidate 1");

      // Now addr1 should be marked as voted
      expect(await votingContract.checkVoteStatus(addr1.address)).to.equal(
        true
      );

      // addr2 still hasn't voted
      expect(await votingContract.checkVoteStatus(addr2.address)).to.equal(
        false
      );
    });

    it("Should allow anyone to check vote status", async function () {
      // Vote as addr1
      await votingContract.connect(addr1).vote("Candidate 1");

      // Check addr1's status as addr2
      expect(
        await votingContract.connect(addr2).checkVoteStatus(addr1.address)
      ).to.equal(true);

      // Check addr2's status as addr1
      expect(
        await votingContract.connect(addr1).checkVoteStatus(addr2.address)
      ).to.equal(false);
    });
  });

  describe("Edge Cases and Gas Usage", function () {
    it("Should handle empty candidate names", async function () {
      // Try to vote for empty string candidate
      await expect(votingContract.connect(addr1).vote("")).to.be.revertedWith(
        "Invalid candidate"
      );
    });

    it("Should track gas usage for voting", async function () {
      // Measure gas used for voting
      const tx = await votingContract.connect(addr1).vote("Candidate 1");
      const receipt = await tx.wait();

      // Log gas used - this is useful for optimization
      console.log(`Gas used for voting: ${receipt.gasUsed.toString()}`);

      // Ensure gas usage is reasonable (this is a very high upper bound)
      expect(Number(receipt.gasUsed)).to.be.lessThan(200000);
    });

    it("Should handle candidates with special characters", async function () {
      // Deploy contract with special character candidates
      const specialCandidates = ["John O'Connor", "Maria-José", "Candidate #1"];
      const specialContract = await Voting.deploy(specialCandidates);
      await specialContract.waitForDeployment();

      // Vote for a candidate with special characters
      await specialContract.connect(addr1).vote("John O'Connor");
      expect(await specialContract.getVotes("John O'Connor")).to.equal(1);
    });
  });

  describe("Integration Tests", function () {
    it("Should correctly track votes across multiple actions", async function () {
      // Multiple users vote
      await votingContract.connect(addr1).vote("Candidate 1");
      await votingContract.connect(addr2).vote("Candidate 2");

      // Check vote counts
      expect(await votingContract.getVotes("Candidate 1")).to.equal(1);
      expect(await votingContract.getVotes("Candidate 2")).to.equal(1);

      // Owner resets addr1
      await votingContract.connect(owner).resetVoter(addr1.address);

      // addr1 votes again for a different candidate
      await votingContract.connect(addr1).vote("Candidate 3");

      // Check updated vote counts
      expect(await votingContract.getVotes("Candidate 1")).to.equal(1); // Unchanged
      expect(await votingContract.getVotes("Candidate 2")).to.equal(1); // Unchanged
      expect(await votingContract.getVotes("Candidate 3")).to.equal(1); // New vote

      // Reset all votes and check counts
      await votingContract.connect(owner).resetAllVotes();
      expect(await votingContract.getVotes("Candidate 1")).to.equal(0);
      expect(await votingContract.getVotes("Candidate 2")).to.equal(0);
      expect(await votingContract.getVotes("Candidate 3")).to.equal(0);
    });
  });
});