const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment...");

  // Deploy the contract with initial candidates
  const Voting = await ethers.getContractFactory("Voting");

  // Get candidates from command line args, environment variable, or use defaults
  const args = process.argv.slice(2);
  let candidates;

  if (args.length > 0) {
    candidates = args;
    console.log("📝 Using candidates from command line arguments");
  } else if (process.env.CANDIDATES) {
    candidates = process.env.CANDIDATES.split(",").map((name) => name.trim());
    console.log("📝 Using candidates from environment variable");
  } else {
    candidates = ["Alice", "Bob", "Charlie", "David", "Emma", "Frank"];
    console.log("📝 Using default candidates");
  }

  console.log("📝 Deploying with candidates:", candidates.join(", "));

  const contract = await Voting.deploy(candidates);
  await contract.waitForDeployment();

  const contractAddress = contract.target;
  console.log("✅ Voting contract deployed at:", contractAddress);

  // Save contract address to a file for frontend use
  const deploymentInfo = {
    contractAddress: contractAddress,
    network: "localhost",
    chainId: 31337,
    deployedAt: new Date().toISOString(),
    candidates: candidates,
  };

  const deploymentPath = path.join(__dirname, "../deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("📄 Deployment info saved to:", deploymentPath);

  // Verify contract is working
  console.log("🔍 Verifying contract...");
  const contractCandidates = await contract.getAllCandidates();
  console.log("📋 Contract candidates:", contractCandidates);

  console.log("\n🎉 Deployment complete!");
  console.log("🔗 Contract Address:", contractAddress);
  console.log("🌐 Network: Hardhat Local (Chain ID: 31337)");
  console.log(
    "📝 Update CONTRACT_ADDRESS in Web3Context.jsx with this address"
  );
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
