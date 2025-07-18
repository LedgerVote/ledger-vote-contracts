const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment...");

  // Deploy the contract with initial candidates
  const Voting = await ethers.getContractFactory("Voting");
  console.log("📝 Deploying with candidates: Alice, Bob, Charlie");

  const contract = await Voting.deploy(["Alice", "Bob", "Charlie"]);
  await contract.waitForDeployment();

  const contractAddress = contract.target;
  console.log("✅ Voting contract deployed at:", contractAddress);

  // Save contract address to a file for frontend use
  const deploymentInfo = {
    contractAddress: contractAddress,
    network: "localhost",
    chainId: 31337,
    deployedAt: new Date().toISOString(),
    candidates: ["Alice", "Bob", "Charlie"],
  };

  const deploymentPath = path.join(__dirname, "../deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("📄 Deployment info saved to:", deploymentPath);

  // Verify contract is working
  console.log("🔍 Verifying contract...");
  const candidates = await contract.getAllCandidates();
  console.log("📋 Contract candidates:", candidates);

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
