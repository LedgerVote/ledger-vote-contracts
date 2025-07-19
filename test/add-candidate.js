const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting", function () {
    let Voting, voting, owner, addr1, addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        Voting = await ethers.getContractFactory("Voting");
        voting = await Voting.deploy(["Alice", "Bob"]);
        await voting.waitForDeployment();
    });

    describe("addCandidate", function () {
        it("should allow the owner to add a new candidate", async function () {
            await voting.connect(owner).addCandidate("Charlie");
            const candidates = await voting.getAllCandidates();
            expect(candidates).to.include("Charlie");
        });

        it("should not allow non-owners to add a new candidate", async function () {
            await expect(voting.connect(addr1).addCandidate("Charlie")).to.be.revertedWith("Only owner can call this function");
        });
    });
});
