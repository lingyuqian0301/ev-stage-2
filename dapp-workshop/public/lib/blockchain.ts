import {
  createPublicClient,
  http,
  parseEther,
  formatEther,
  createWalletClient,
  custom
} from "viem";
import { scrollSepolia } from "viem/chains";

// Extended ABI with a createProject function
const crowdfundingABI = [
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
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      }
    ],
    "name": "getProject",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "creator",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "title",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "fundingGoal",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountRaised",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "status",
            "type": "uint8"
          }
        ],
        "internalType": "struct Crowdfunding.Project",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // Added createProject function:
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "fundingGoal",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      }
    ],
    "name": "createProject",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
if (!contractAddress) {
  throw new Error("Missing NEXT_PUBLIC_CONTRACT_ADDRESS");
}

// Create public client
const publicClient = createPublicClient({
  chain: scrollSepolia,
  transport: http()
});

// Create contract instance
const getContract = () => {
  if (typeof window === "undefined") return null;

  const walletClient = createWalletClient({
    chain: scrollSepolia,
    transport: custom(window.ethereum)
  });

  return {
    read: publicClient,
    write: walletClient,
    address: contractAddress as `0x${string}`,
    abi: crowdfundingABI,
  };
};

/** Fund an existing project */
export async function fundProject(projectId: number, amount: string) {
  try {
    if (!window.ethereum) {
      throw new Error("No wallet found");
    }

    const contract = getContract();
    if (!contract) {
      throw new Error("Failed to initialize contract");
    }

    // Get connected account
    const [address] = await contract.write.requestAddresses();

    // Validate amount format
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      throw new Error("Invalid amount");
    }

    // Format the number
    const formattedAmount = amountNum.toFixed(18);

    // Send transaction
    const hash = await contract.write.writeContract({
      account: address,
      address: contract.address,
      abi: contract.abi,
      functionName: "fundProject",
      args: [BigInt(projectId)],
      value: parseEther(formattedAmount)
    });

    // Wait for transaction
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    return receipt;
  } catch (error) {
    console.error("Fund project error:", error);
    throw error;
  }
}

/** Get a project by ID */
export async function getProjectDetails(projectId: number) {
  const contract = getContract();
  if (!contract) {
    throw new Error("Failed to initialize contract");
  }

  const project = await contract.read.readContract({
    address: contract.address,
    abi: contract.abi,
    functionName: "getProject",
    args: [BigInt(projectId)]
  });
  return project;
}

/** For demonstration: returns project amountRaised in ETH */
export async function getProjectFunding(projectId: number): Promise<number> {
  const project = await getProjectDetails(projectId);
  // Convert from wei to ETH
  return parseFloat(formatEther(project.amountRaised));
}

/** For demonstration: returns a placeholder backer count */
export async function getProjectBackers(projectId: number): Promise<number> {
  // Example placeholder
  return 42;
}

/** Create a new project on the blockchain */
export async function createProject(
  title: string,
  description: string,
  fundingGoal: string,
  deadline: string
) {
  try {
    if (!window.ethereum) {
      throw new Error("No wallet found");
    }
    const contract = getContract();
    if (!contract) {
      throw new Error("Failed to initialize contract");
    }

    // Convert fundingGoal to WEI if your contract expects wei
    // If your contract expects raw integer for e.g. stablecoins or other units, adjust accordingly
    const fundingGoalWei = parseEther(fundingGoal);

    // The "deadline" might be a Unix timestamp or block height, or even days from now—adjust as needed:
    const deadlineValue = BigInt(deadline);

    // Get connected account
    const [address] = await contract.write.requestAddresses();

    // Write transaction
    const hash = await contract.write.writeContract({
      account: address,
      address: contract.address,
      abi: contract.abi,
      functionName: "createProject",
      args: [title, description, fundingGoalWei, deadlineValue]
    });

    // Wait for transaction to be mined
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    return receipt;
  } catch (error) {
    console.error("Create project error:", error);
    throw error;
  }
}
