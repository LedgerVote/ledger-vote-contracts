const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("VotingModule", (m) => {
  m.getAccount(0);
  const voting = m.contract("Voting", [["Alice", "Bob", "Charlie"]]);
  return { voting };
});
