# Crowdfunding with Voting System

A decentralized crowdfunding platform with a voting mechanism for fund management on Scroll Network.

## Deployed Contracts (Scroll Testnet)
- Crowdfunding: `0x6B9EeB0f163E7D1eC92a84C5CC8c8fCAB18F3748`
- Voting: `0xffcf6cd0dd4aad233c117074587ec6c7c68337c3`

## Contract Overview

### Crowdfunding Contract
Manages fundraising projects where:
- Project owners can create funding campaigns
- Contributors can fund projects
- Tracks contributions per user
- Automatically marks projects as complete when goals are met

### Voting Contract
Manages fund disbursement through democratic voting where:
- Project owner creates spending requests
- Contributors vote with weight proportional to their contribution
- 51% approval needed for request execution
- Voting period is time-limited

## Integration Guide

### 1. Interacting with Crowdfunding

```javascript
// Initialize contract
const crowdfunding = await ethers.getContractAt("CrowdfundingContract", 
    "0x6B9EeB0f163E7D1eC92a84C5CC8c8fCAB18F3748");

// Create project
const tx = await crowdfunding.createProject(ethers.parseEther("1.0")); // 1 ETH goal
const receipt = await tx.wait();
const projectId = receipt.events[0].args.projectId;

// Fund project
await crowdfunding.fundProject(projectId, { value: ethers.parseEther("0.1") });

// Get project info
const contribution = await crowdfunding.getUserContribution(projectId, userAddress);
const totalFunding = await crowdfunding.getProjectFunding(projectId);
```

### 2. Interacting with Voting

```javascript
// Initialize contract
const voting = await ethers.getContractAt("Voting", 
    "0xffcf6cd0dd4aad233c117074587ec6c7c68337c3");

// Create spending request (only project owner)
await voting.createRequest(
    "Purchase equipment",
    recipientAddress,
    ethers.parseEther("0.5"),
    86400 // 24 hours voting period
);

// Vote on request (contributors only)
await voting.vote(requestId, true); // true for approve, false for reject

// Finalize request (only project owner, after voting period)
await voting.finalizeRequest(requestId);
```

## Key Features

### Crowdfunding Contract
- `createProject(uint256 fundingGoal)`: Create new funding project
- `fundProject(uint256 projectId)`: Contribute to project
- `getUserContribution(uint256 projectId, address user)`: Get user's contribution
- `getProjectFunding(uint256 projectId)`: Get total project funding
- `getProjectBackers(uint256 projectId)`: Get number of backers

### Voting Contract
- `createRequest(string, address, uint256, uint256)`: Create spending request
- `vote(uint256, bool)`: Vote on request
- `finalizeRequest(uint256)`: Execute approved request
- `deposit()`: Add funds to contract

## Events to Listen For

### Crowdfunding Events
```solidity
ProjectCreated(uint256 indexed projectId, address indexed owner, uint256 fundingGoal)
ProjectFunded(uint256 indexed projectId, address indexed backer, uint256 amount)
ProjectCompleted(uint256 indexed projectId, uint256 totalFunding)
```

### Voting Events
```solidity
RequestCreated(uint256 indexed requestId, string description, address recipient, uint256 amount, uint256 deadline)
Voted(uint256 indexed requestId, address voter, uint256 weight, bool approve)
RequestFinalized(uint256 indexed requestId, bool approved)
```

## Security Considerations
1. Only project owner can create and finalize requests
2. Voting weight is proportional to contribution
3. Time-locked voting periods
4. Minimum 51% approval required
5. Double-voting prevention
6. Requires successful crowdfunding first

## Example Integration Flow
1. Create crowdfunding project
2. Allow contributions until goal is met
3. Create voting contract for the funded project
4. Create spending requests as needed
5. Contributors vote on requests
6. Execute approved requests after voting period

## Testing
```bash
npx hardhat test
npx hardhat run scripts/interact.js --network scrollTestnet
```

## Frontend Integration

### Setup
1. Add contract ABIs to your frontend:
```javascript
// Import ABIs
import CrowdfundingABI from './contracts/CrowdfundingContract.json';
import VotingABI from './contracts/Voting.json';

// Contract addresses
const CROWDFUNDING_ADDRESS = "0x6B9EeB0f163E7D1eC92a84C5CC8c8fCAB18F3748";
const VOTING_ADDRESS = "0xffcf6cd0dd4aad233c117074587ec6c7c68337c3";
```

### Initialize Contracts with ethers.js
```javascript
// Connect to provider (using window.ethereum)
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

// Initialize contracts
const crowdfunding = new ethers.Contract(CROWDFUNDING_ADDRESS, CrowdfundingABI, signer);
const voting = new ethers.Contract(VOTING_ADDRESS, VotingABI, signer);
```

### Example React Components

1. Create Project Component:
```jsx
function CreateProject() {
    const handleCreate = async (e) => {
        e.preventDefault();
        const goal = ethers.parseEther(formData.goal);
        try {
            const tx = await crowdfunding.createProject(goal);
            await tx.wait();
            // Handle success
        } catch (error) {
            console.error("Error creating project:", error);
        }
    };

    return (
        <form onSubmit={handleCreate}>
            <input type="number" placeholder="Funding Goal (ETH)" />
            <button type="submit">Create Project</button>
        </form>
    );
}
```

2. Fund Project Component:
```jsx
function FundProject({ projectId }) {
    const handleFund = async (e) => {
        e.preventDefault();
        const amount = ethers.parseEther(formData.amount);
        try {
            const tx = await crowdfunding.fundProject(projectId, {
                value: amount
            });
            await tx.wait();
            // Handle success
        } catch (error) {
            console.error("Error funding project:", error);
        }
    };

    return (
        <form onSubmit={handleFund}>
            <input type="number" placeholder="Amount (ETH)" />
            <button type="submit">Fund Project</button>
        </form>
    );
}
```

3. Voting Component:
```jsx
function VotingInterface({ requestId }) {
    const handleVote = async (approve) => {
        try {
            const tx = await voting.vote(requestId, approve);
            await tx.wait();
            // Handle success
        } catch (error) {
            console.error("Error voting:", error);
        }
    };

    return (
        <div>
            <button onClick={() => handleVote(true)}>Approve</button>
            <button onClick={() => handleVote(false)}>Reject</button>
        </div>
    );
}
```

### Event Listeners
```javascript
// Listen for new projects
crowdfunding.on("ProjectCreated", (projectId, owner, goal) => {
    console.log(`New project ${projectId} created by ${owner} with goal ${goal}`);
});

// Listen for new votes
voting.on("Voted", (requestId, voter, weight, approve) => {
    console.log(`Vote cast on request ${requestId} by ${voter}`);
});
```

### Data Fetching Example
```javascript
async function fetchProjectData(projectId) {
    const [funding, backers] = await Promise.all([
        crowdfunding.getProjectFunding(projectId),
        crowdfunding.getProjectBackers(projectId)
    ]);
    return { funding, backers };
}

async function fetchVotingData(requestId) {
    const request = await voting.requests(requestId);
    return request;
}
```

### Error Handling
```javascript
try {
    await ethereum.request({ method: 'eth_requestAccounts' });
} catch (error) {
    if (error.code === 4001) {
        // User rejected request
    } else if (error.code === -32002) {
        // Request already pending
    }
}
```

### Network Detection
```javascript
const checkNetwork = async () => {
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    if (chainId !== '0x8274f') { // Scroll Testnet
        await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x8274f' }],
        });
    }
};
```
