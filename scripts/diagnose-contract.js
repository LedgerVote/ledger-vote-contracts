// blockchain/scripts/diagnose-contract.js
const { ethers } = require("hardhat");

async function main() {
  console.log("Diagnosing contract functions...");

  // Get deployment details
  const deployment = require("../deployment.json");
  const contractAddress = deployment.contractAddress;

  console.log("Contract address:", contractAddress);

  // Get the contract instance
  const Voting = await ethers.getContractFactory("Voting");
  const contract = Voting.attach(contractAddress);

  // Print out all available functions from the contract
  console.log("Available contract functions:");
  const functions = Object.keys(contract.interface.functions);
  functions.forEach((fn) => console.log(`- ${fn}`));

  // Test the mapping access methods
  const defaultAccount = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"; // Hardhat default account

  try {
    console.log(`\nTesting hasVoted mapping for ${defaultAccount}:`);
    const hasVoted = await contract.hasVoted(defaultAccount);
    console.log(`hasVoted result: ${hasVoted}`);
  } catch (error) {
    console.error("Error accessing hasVoted mapping:", error.message);
  }

  try {
    console.log(`\nTesting checkVoteStatus function for ${defaultAccount}:`);
    const voteStatus = await contract.checkVoteStatus(defaultAccount);
    console.log(`checkVoteStatus result: ${voteStatus}`);
  } catch (error) {
    console.error("Error calling checkVoteStatus:", error.message);
  }

  // List all candidates
  try {
    console.log("\nListing all candidates:");
    const candidates = await contract.getAllCandidates();
    console.log("Candidates:", candidates);
  } catch (error) {
    console.error("Error getting candidates:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
