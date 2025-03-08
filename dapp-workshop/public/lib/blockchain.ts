import {
  createPublicClient,
  http,
  parseEther,
  formatEther,
  createWalletClient,
  custom
} from 'viem';
import { scrollSepolia } from 'viem/chains';

// IMPORTANT: This ABI reflects your actual contract functions
const crowdfundingABI = [
  // Auto-generated getter for public uint256 projectCount
  {
    "inputs": [],
    "name": "projectCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // Auto-generated getter for public mapping projects(uint256)
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "projects",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "fundingGoal",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "currentFunding",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "backers",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "active",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // createProject(uint256)
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "fundingGoal",
        "type": "uint256"
      }
    ],
    "name": "createProject",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // fundProject(uint256) payable
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      }
    ],
    "name": "fundProject",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  // getProjectFunding(uint256)
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      }
    ],
    "name": "getProjectFunding",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // getProjectBackers(uint256)
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      }
    ],
    "name": "getProjectBackers",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // Optionally getUserContribution if needed, etc.
];

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
if (!contractAddress) {
  throw new Error("Missing NEXT_PUBLIC_CONTRACT_ADDRESS");
}

// Create public client (for reading) & wallet client (for writing)
const publicClient = createPublicClient({
  chain: scrollSepolia,
  transport: http()
});

function getContract() {
  if (typeof window === 'undefined') return null;
  const walletClient = createWalletClient({
    chain: scrollSepolia,
    transport: custom(window.ethereum)
  });
  return {
    read: publicClient,
    write: walletClient,
    address: contractAddress as `0x${string}`,
    abi: crowdfundingABI
  };
}

// Read how many projects exist
export async function getProjectCount(): Promise<number> {
  const contract = getContract();
  if (!contract) throw new Error("No contract instance (window.ethereum missing?)");

  // calls the auto-generated getter for `uint256 public projectCount;`
  const count = (await contract.read.readContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'projectCount',
    args: []
  })) as bigint;

  return Number(count);
}

// Read the entire struct by calling `projects(i)`
export async function getProjectStruct(projectId: number) {
  const contract = getContract();
  if (!contract) throw new Error("No contract instance");
  
  // calls the auto-generated getter for `mapping (uint256 => Project) public projects;`
  // which returns [id, owner, fundingGoal, currentFunding, backers, active] in an array
  const data = await contract.read.readContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'projects',
    args: [BigInt(projectId)]
  });

  // data is an array like:
  // [ id, owner, fundingGoal, currentFunding, backers, active ]
  // We can structure it into an object if we like:
  const [id, owner, fundingGoal, currentFunding, backers, active] = data as [
    bigint, string, bigint, bigint, bigint, boolean
  ];

  return {
    id: Number(id),
    owner,
    fundingGoal,
    currentFunding,
    backers: Number(backers),
    active
  };
}

// read single field: getProjectFunding(uint256)
export async function getProjectFunding(projectId: number): Promise<number> {
  const contract = getContract();
  if (!contract) throw new Error("No contract instance");
  
  const result = (await contract.read.readContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'getProjectFunding',
    args: [BigInt(projectId)]
  })) as bigint;

  // convert Wei to ETH if desired
  return parseFloat(formatEther(result));
}

// read single field: getProjectBackers(uint256)
export async function getProjectBackers(projectId: number): Promise<number> {
  const contract = getContract();
  if (!contract) throw new Error("No contract instance");
  
  const result = (await contract.read.readContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'getProjectBackers',
    args: [BigInt(projectId)]
  })) as bigint;
  
  return Number(result);
}

// fundProject(uint256) payable
export async function fundProject(projectId: number, amountEth: string) {
  if (!window.ethereum) throw new Error("No wallet found");
  const contract = getContract();
  if (!contract) throw new Error("No contract instance");

  const [account] = await contract.write.requestAddresses();
  const amountWei = parseEther(amountEth);

  const hash = await contract.write.writeContract({
    account,
    address: contract.address,
    abi: contract.abi,
    functionName: 'fundProject',
    args: [BigInt(projectId)],
    value: amountWei
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return receipt;
}

// createProject(uint256 fundingGoal)
export async function createProject(fundingGoalEth: string) {
  if (!window.ethereum) throw new Error("No wallet found");
  const contract = getContract();
  if (!contract) throw new Error("No contract instance");

  const [account] = await contract.write.requestAddresses();
  // If your contract expects a raw wei goal:
  const fundingGoalWei = parseEther(fundingGoalEth);

  const hash = await contract.write.writeContract({
    account,
    address: contract.address,
    abi: contract.abi,
    functionName: 'createProject',
    args: [fundingGoalWei] // pass BigInt
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return receipt;
}
