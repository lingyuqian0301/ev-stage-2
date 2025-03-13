const { ethers } = require("hardhat");

// Contract addresses
const VOTING_CONTRACT = "0xffcf6cd0dd4aad233c117074587ec6c7c68337c3";
const CROWDFUNDING_CONTRACT = "0x6B9EeB0f163E7D1eC92a84C5CC8c8fCAB18F3748";

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("Interacting with contracts using account:", signer.address);

    // Get contract instance
    const Voting = await ethers.getContractFactory("Voting");
    const voting = Voting.attach(VOTING_CONTRACT);

    // Example: Get basic contract info
    const projectOwner = await voting.projectOwner();
    const projectId = await voting.projectId();
    const requestCount = await voting.requestCount();

    console.log("\nContract Info:");
    console.log("Project Owner:", projectOwner);
    console.log("Project ID:", projectId.toString());
    console.log("Number of Requests:", requestCount.toString());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
