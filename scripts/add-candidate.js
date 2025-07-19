const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const deploymentPath = path.join(__dirname, "../deployment.json");
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath));
  const contractAddress = deploymentInfo.contractAddress;

  const Voting = await ethers.getContractFactory("Voting");
  const contract = Voting.attach(contractAddress);

  const newCandidate = "David";
  console.log(`Adding new candidate: ${newCandidate}`);
  const tx = await contract.addCandidate(newCandidate);
  await tx.wait();

  console.log("Candidate added successfully");

  const candidates = await contract.getAllCandidates();
  console.log("Updated candidate list:", candidates);
}

main().catch((error) => {
  console.error("Failed to add candidate:", error);
  process.exit(1);
});
