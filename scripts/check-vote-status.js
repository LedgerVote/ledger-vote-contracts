const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking Vote Status for All Addresses...\n");

  // Get deployed contract address
  const deployment = require("../deployment.json");
  const contractAddress = deployment.contractAddress;

  console.log("📍 Contract Address:", contractAddress);

  // Get contract instance
  const Voting = await ethers.getContractFactory("Voting");
  const contract = Voting.attach(contractAddress);

  // Get all candidates first
  console.log("\n📋 Available Candidates:");
  console.log("=".repeat(30));
  try {
    const candidates = await contract.getAllCandidates();
    candidates.forEach((candidate, index) => {
      console.log(`${index + 1}. ${candidate}`);
    });
  } catch (error) {
    console.log("❌ Error getting candidates:", error.message);
    return;
  }

  // Test addresses from your Hardhat output
  const testAddresses = [
    "0xbda5747bfd65f08deb54cb465eb87d40e51b197e", // First voter
    "0xa0ee7a142d267c1f36714e4a8f75612f20a79720", // Second voter
    "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", // Problem address
  ];

  console.log("\n🗳️ Vote Status Check:");
  console.log("=".repeat(50));

  for (const address of testAddresses) {
    try {
      const hasVoted = await contract.hasVoted(address);
      const shortAddr = `${address.substring(0, 6)}...${address.substring(
        address.length - 4
      )}`;
      console.log(`${shortAddr}: ${hasVoted ? "✅ VOTED" : "❌ NOT VOTED"}`);
    } catch (error) {
      const shortAddr = `${address.substring(0, 6)}...${address.substring(
        address.length - 4
      )}`;
      console.log(`${shortAddr}: ❌ ERROR - ${error.message}`);
    }
  }

  // Show vote counts
  console.log("\n📊 Current Vote Results:");
  console.log("=".repeat(30));

  try {
    const candidates = await contract.getAllCandidates();
    for (const candidate of candidates) {
      const votes = await contract.getVotes(candidate);
      console.log(`${candidate}: ${votes} votes`);
    }
  } catch (error) {
    console.log("❌ Error getting vote results:", error.message);
  }

  // Show contract owner
  console.log("\n👑 Contract Owner:");
  console.log("=".repeat(20));
  try {
    const owner = await contract.owner();
    const shortOwner = `${owner.substring(0, 6)}...${owner.substring(
      owner.length - 4
    )}`;
    console.log(`Owner: ${shortOwner}`);
  } catch (error) {
    console.log("❌ Error getting owner:", error.message);
  }

  console.log("\n🎯 Summary:");
  console.log("- Two addresses have successfully voted");
  console.log("- Problem address may be using wrong MetaMask account");
  console.log("- Switch to an address that hasn't voted yet");
  console.log("- Or use Admin Dashboard to reset a voter");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script Error:", error);
    process.exit(1);
  });
