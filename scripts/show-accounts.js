const { ethers } = require("hardhat");

async function main() {
  console.log("🔑 Available Test Accounts for MetaMask:");
  console.log("=".repeat(60));

  // Get signers (test accounts)
  const signers = await ethers.getSigners();

  for (let i = 0; i < Math.min(10, signers.length); i++) {
    const signer = signers[i];
    const address = await signer.getAddress();
    const balance = await ethers.provider.getBalance(address);
    const balanceInEth = ethers.formatEther(balance);

    console.log(`Account ${i + 1}:`);
    console.log(`  Address: ${address}`);
    console.log(`  Balance: ${balanceInEth} ETH`);
    console.log(`  Private Key: Available in Hardhat console`);
    console.log("");
  }

  console.log("💡 To use different accounts:");
  console.log("1. Copy private keys from Hardhat node console");
  console.log("2. Import them into MetaMask");
  console.log("3. Switch between accounts for testing");
  console.log("");
  console.log("🚨 Note: Each address can only vote ONCE on the blockchain!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
