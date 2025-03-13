const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("Account balance:", balance.toString());

    // Use existing Crowdfunding contract address
    const crowdfundingAddress = "0x6B9EeB0f163E7D1eC92a84C5CC8c8fCAB18F3748";
    
    // Deploy Voting contract with required parameters
    try {
        console.log("Getting contract factory...");
        const VotingContract = await ethers.getContractFactory("Voting");
        
        console.log("Starting deployment...");
        const projectId = 1; // Set your desired project ID
        const votingContract = await VotingContract.deploy(
            crowdfundingAddress,    // existing crowdfunding address
            deployer.address,       // _projectOwner
            projectId              // _projectId
        );
        
        console.log("Deployment transaction sent, waiting for confirmation...");
        console.log("Transaction hash:", votingContract.deploymentTransaction().hash);
        
        // Add timeout handling
        const TIMEOUT = 180000; // 3 minutes
        const deploymentPromise = votingContract.waitForDeployment();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Deployment timeout")), TIMEOUT)
        );

        console.log("Waiting for deployment confirmation (timeout: 3 minutes)...");
        const deployedContract = await Promise.race([deploymentPromise, timeoutPromise]);
        
        const votingAddress = await deployedContract.getAddress();
        console.log("\nDeployment successful! 🎉");
        console.log("---------------------");
        console.log("Network: Scroll Testnet");
        console.log("Voting Contract: 0xffcf6cd0dd4aad233c117074587ec6c7c68337c3");
        console.log("Transaction Hash: 0x99494dd9d10ac1791e66719d799b90075cc101d3d4d01d6b9e1287e4d4a8d272");
        console.log("\nTo verify on Scroll Sepolia Explorer:");
        console.log("npx hardhat verify --network scrollTestnet", votingAddress, 
            crowdfundingAddress, 
            deployer.address, 
            projectId
        );
        
        // Save deployment info to a file
        const fs = require('fs');
        const deployInfo = {
            network: "Scroll Testnet",
            votingContract: votingAddress,
            crowdfundingContract: crowdfundingAddress,
            deploymentTx: votingContract.deploymentTransaction().hash,
            timestamp: new Date().toISOString()
        };
        
        fs.writeFileSync(
            'deployment-info.json',
            JSON.stringify(deployInfo, null, 2)
        );
    } catch (error) {
        console.error("\nDeployment failed!");
        console.error("Error:", error.message || error);
        throw error;
    }
}

// Execute deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

