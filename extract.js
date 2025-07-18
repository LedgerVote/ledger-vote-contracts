// extract.js
const fs = require('fs');
const path = require('path');

const artifactPath = path.join(__dirname, 'artifacts/contracts/Voting.sol/Voting.json');
const artifact = require(artifactPath);

const abiPath = path.join(__dirname, 'extracted/Voting.abi');
const binPath = path.join(__dirname, 'extracted/Voting.bin');

fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));
fs.writeFileSync(binPath, artifact.bytecode);

console.log('✅ ABI and BIN successfully extracted to ./extracted/');
