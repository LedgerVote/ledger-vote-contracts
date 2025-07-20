// blockchain/scripts/verify-abi.js
const fs = require("fs");
const path = require("path");

async function main() {
  try {
    console.log("Verifying contract ABI...");

    // Load deployed contract ABI
    const contractPath = path.join(
      __dirname,
      "../artifacts/contracts/Voting.sol/Voting.json"
    );
    const contractData = JSON.parse(fs.readFileSync(contractPath, "utf8"));
    const deployedABI = contractData.abi;

    // Load frontend ABI
    const frontendABIPath = path.join(
      __dirname,
      "../../client/src/abis/Voting.json"
    );
    const frontendABI = JSON.parse(fs.readFileSync(frontendABIPath, "utf8"));

    console.log("Deployed contract has", deployedABI.length, "ABI entries");
    console.log("Frontend is using", frontendABI.length, "ABI entries");

    // Check for missing functions
    const deployedFunctions = deployedABI
      .filter((item) => item.type === "function")
      .map((item) => item.name);

    const frontendFunctions = frontendABI
      .filter((item) => item.type === "function")
      .map((item) => item.name);

    console.log("\nDeployed contract functions:", deployedFunctions);
    console.log("Frontend functions:", frontendFunctions);

    // Check for missing functions
    const missingInFrontend = deployedFunctions.filter(
      (fn) => !frontendFunctions.includes(fn)
    );
    const extraInFrontend = frontendFunctions.filter(
      (fn) => !deployedFunctions.includes(fn)
    );

    if (missingInFrontend.length > 0) {
      console.log("\n❌ Functions missing in frontend:", missingInFrontend);
    } else {
      console.log("\n✅ Frontend includes all contract functions");
    }

    if (extraInFrontend.length > 0) {
      console.log(
        "⚠️ Extra functions in frontend that don't exist in contract:",
        extraInFrontend
      );
    }

    // Deep compare function signatures
    console.log("\nChecking function signatures...");

    let signaturesMatch = true;
    for (const deployedItem of deployedABI) {
      if (deployedItem.type !== "function") continue;

      const frontendItem = frontendABI.find(
        (item) => item.type === "function" && item.name === deployedItem.name
      );

      if (!frontendItem) continue;

      // Compare inputs
      const inputsMatch =
        JSON.stringify(deployedItem.inputs) ===
        JSON.stringify(frontendItem.inputs);

      // Compare outputs
      const outputsMatch =
        JSON.stringify(deployedItem.outputs) ===
        JSON.stringify(frontendItem.outputs);

      if (!inputsMatch || !outputsMatch) {
        signaturesMatch = false;
        console.log(`❌ Signature mismatch for function: ${deployedItem.name}`);

        if (!inputsMatch) {
          console.log("  Deployed inputs:", deployedItem.inputs);
          console.log("  Frontend inputs:", frontendItem.inputs);
        }

        if (!outputsMatch) {
          console.log("  Deployed outputs:", deployedItem.outputs);
          console.log("  Frontend outputs:", frontendItem.outputs);
        }
      }
    }

    if (signaturesMatch) {
      console.log("✅ All function signatures match");
    }

    // Update frontend ABI if needed
    if (
      missingInFrontend.length > 0 ||
      extraInFrontend.length > 0 ||
      !signaturesMatch
    ) {
      console.log("\n⚠️ ABI mismatch detected! Updating frontend ABI...");

      // Write updated ABI to frontend
      fs.writeFileSync(frontendABIPath, JSON.stringify(deployedABI, null, 2));
      console.log(
        "✅ Frontend ABI has been updated to match deployed contract"
      );
    } else {
      console.log("\n✅ ABIs match perfectly");
    }
  } catch (error) {
    console.error("Error verifying ABI:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
