const { ethers } = require("hardhat");

async function diagnoseContractIssue() {
  console.log("🔍 COMPREHENSIVE CONTRACT DIAGNOSIS");
  console.log("=".repeat(50));

  // Read deployment info
  let deployment;
  try {
    deployment = require("./deployment.json");
    console.log("✅ Deployment file found");
    console.log("📍 Contract Address:", deployment.contractAddress);
    console.log("🌐 Network:", deployment.network);
    console.log("🆔 Chain ID:", deployment.chainId);
    console.log("📅 Deployed at:", deployment.deployedAt);
    console.log("👥 Candidates:", deployment.candidates);
  } catch (error) {
    console.log("❌ Cannot read deployment.json:", error.message);
    return;
  }

  // Test contract connection
  try {
    console.log("\n🔗 Testing contract connection...");
    const Voting = await ethers.getContractFactory("Voting");
    const contract = Voting.attach(deployment.contractAddress);

    // Test basic contract call
    const candidates = await contract.getAllCandidates();
    console.log("✅ Contract is accessible");
    console.log("👥 Available candidates:", candidates);

    // Test owner
    const owner = await contract.owner();
    console.log("👑 Contract owner:", owner);

    // Get provider and network info
    const provider = ethers.provider;
    const network = await provider.getNetwork();
    console.log("🌐 Connected to network:", network.chainId);

    const blockNumber = await provider.getBlockNumber();
    console.log("📦 Current block number:", blockNumber);
  } catch (error) {
    console.log("❌ Contract connection failed:", error.message);

    if (error.message.includes("could not detect network")) {
      console.log("\n🚨 NETWORK ISSUE DETECTED");
      console.log("SOLUTION: Start Hardhat node first:");
      console.log("  npx hardhat node");
      console.log("Then redeploy the contract:");
      console.log("  npx hardhat run scripts/deploy.js --network localhost");
      return;
    }

    if (error.message.includes("call revert exception")) {
      console.log("\n🚨 CONTRACT NOT DEPLOYED");
      console.log("SOLUTION: Deploy the contract:");
      console.log("  npx hardhat run scripts/deploy.js --network localhost");
      return;
    }

    console.log("\n🚨 UNKNOWN ERROR - Check Hardhat node and deployment");
    return;
  }

  // Test vote status for known problematic addresses
  console.log("\n📊 Testing vote status for addresses from logs...");
  const testAddresses = [
    "0xbda5747bfd65f08deb54cb465eb87d40e51b197e", // Voted successfully
    "0xa0ee7a142d267c1f36714e4a8f75612f20a79720", // Voted successfully
    "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", // Problem address
  ];

  try {
    const contract = await ethers.getContractAt(
      "Voting",
      deployment.contractAddress
    );

    for (const address of testAddresses) {
      try {
        const hasVoted = await contract.hasVoted(address);
        const shortAddr = `${address.substring(0, 6)}...${address.substring(
          address.length - 4
        )}`;
        console.log(
          `  ${shortAddr}: ${hasVoted ? "✅ HAS VOTED" : "❌ NOT VOTED"}`
        );
      } catch (error) {
        const shortAddr = `${address.substring(0, 6)}...${address.substring(
          address.length - 4
        )}`;
        console.log(`  ${shortAddr}: ❌ ERROR - ${error.message}`);
      }
    }

    // Show vote counts
    console.log("\n📈 Current vote results:");
    const candidates = await contract.getAllCandidates();
    for (const candidate of candidates) {
      try {
        const votes = await contract.getVotes(candidate);
        console.log(`  ${candidate}: ${votes.toString()} votes`);
      } catch (error) {
        console.log(`  ${candidate}: ❌ ERROR - ${error.message}`);
      }
    }
  } catch (error) {
    console.log("❌ Vote status check failed:", error.message);
  }

  console.log("\n🎯 SUMMARY:");
  console.log("If you're getting 'unrecognized-selector' errors:");
  console.log("1. ✅ Contract is deployed and working");
  console.log("2. ✅ ABI is correct");
  console.log("3. 🔍 Issue is likely with MetaMask/Frontend connection");
  console.log("\nSOLUTIONS:");
  console.log("A. Switch to a MetaMask account that hasn't voted");
  console.log("B. Reset a voter using Admin Dashboard");
  console.log("C. Make sure MetaMask is on 'Hardhat Local' network");
  console.log("D. Refresh the frontend page");
}

diagnoseContractIssue()
  .then(() => {
    console.log("\n🏁 Diagnosis complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Diagnosis failed:", error);
    process.exit(1);
  });
