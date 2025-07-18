const fs = require("fs");
const path = require("path");

// Read deployment info
const deploymentPath = path.join(__dirname, "deployment.json");
const web3ContextPath = path.join(
  __dirname,
  "../client/src/contexts/Web3Context.jsx"
);

if (!fs.existsSync(deploymentPath)) {
  console.error(
    "❌ deployment.json not found. Please deploy the contract first."
  );
  process.exit(1);
}

const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
const contractAddress = deployment.contractAddress;

console.log("📄 Reading deployment info...");
console.log("🔗 Contract Address:", contractAddress);

// Read Web3Context.jsx
if (!fs.existsSync(web3ContextPath)) {
  console.error("❌ Web3Context.jsx not found at:", web3ContextPath);
  process.exit(1);
}

let web3Context = fs.readFileSync(web3ContextPath, "utf8");

// Update contract address
const oldAddressRegex = /const CONTRACT_ADDRESS = "[^"]*";/;
const newAddressLine = `const CONTRACT_ADDRESS = "${contractAddress}";`;

if (web3Context.match(oldAddressRegex)) {
  web3Context = web3Context.replace(oldAddressRegex, newAddressLine);
  fs.writeFileSync(web3ContextPath, web3Context);
  console.log("✅ Updated CONTRACT_ADDRESS in Web3Context.jsx");
  console.log("🔗 New address:", contractAddress);
} else {
  console.log("⚠️ Could not find CONTRACT_ADDRESS pattern in Web3Context.jsx");
  console.log("🔧 Please manually update it to:", contractAddress);
}

console.log("\n🎉 Setup complete! You can now test blockchain voting.");
