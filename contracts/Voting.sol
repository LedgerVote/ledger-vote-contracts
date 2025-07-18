// contracts/Voting.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    address public owner;
    mapping(address => bool) public hasVoted;
    mapping(string => uint256) public voteCount;
    string[] public candidateList;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor(string[] memory candidateNames) {
        owner = msg.sender;
        candidateList = candidateNames;
    }

    function vote(string memory candidate) public {
        require(!hasVoted[msg.sender], "Already voted");
        require(validCandidate(candidate), "Invalid candidate");
        voteCount[candidate] += 1;
        hasVoted[msg.sender] = true;
    }

    function getVotes(string memory candidate) public view returns (uint256) {
        return voteCount[candidate];
    }

    function getAllCandidates() public view returns (string[] memory) {
        return candidateList;
    }

    // Admin function to reset a voter's status for testing
    function resetVoter(address voter) public onlyOwner {
        hasVoted[voter] = false;
    }

    // Admin function to reset all votes for testing
    function resetAllVotes() public onlyOwner {
        // Reset vote counts
        for (uint i = 0; i < candidateList.length; i++) {
            voteCount[candidateList[i]] = 0;
        }
    }

    // Admin function to check if an address has voted
    function checkVoteStatus(address voter) public view returns (bool) {
        return hasVoted[voter];
    }

    function validCandidate(string memory name) internal view returns (bool) {
        for (uint i = 0; i < candidateList.length; i++) {
            if (keccak256(bytes(candidateList[i])) == keccak256(bytes(name))) {
                return true;
            }
        }
        return false;
    }
}