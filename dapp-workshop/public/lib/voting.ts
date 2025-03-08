import {
    createPublicClient,
    http,
    parseEther,
    formatEther,
    createWalletClient,
    custom
  } from "viem";
  import { scrollSepolia } from "viem/chains";
  
  // The ABI for your separate Voting contract
  const votingABI = [
    // requestCount()
    {
      "inputs": [],
      "name": "requestCount",
      "outputs": [
        { "internalType": "uint256", "name": "", "type": "uint256" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    // requests(uint256) => auto-generated getter if it's public, optional
    {
      "inputs": [
        { "internalType": "uint256", "name": "", "type": "uint256" }
      ],
      "name": "requests",
      "outputs": [
        { "internalType": "uint256", "name": "id", "type": "uint256" },
        { "internalType": "string",  "name": "description", "type": "string" },
        { "internalType": "address", "name": "recipient",   "type": "address" },
        { "internalType": "uint256", "name": "amount",      "type": "uint256" },
        { "internalType": "uint256", "name": "votesFor",    "type": "uint256" },
        { "internalType": "uint256", "name": "votesAgainst","type": "uint256" },
        { "internalType": "uint256", "name": "totalVotingPower","type": "uint256" },
        { "internalType": "uint256", "name": "votingDeadline",  "type": "uint256" },
        { "internalType": "bool",    "name": "executed",    "type": "bool" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    // createRequest(...)
    {
      "inputs": [
        { "internalType": "string",  "name": "_description",       "type": "string" },
        { "internalType": "address", "name": "_recipient",         "type": "address" },
        { "internalType": "uint256", "name": "_amount",            "type": "uint256" },
        { "internalType": "uint256", "name": "_totalVotingPower",  "type": "uint256" },
        { "internalType": "uint256", "name": "_deadline",          "type": "uint256" }
      ],
      "name": "createRequest",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    // voteOnRequest(uint256,bool)
    {
      "inputs": [
        { "internalType": "uint256", "name": "requestId", "type": "uint256" },
        { "internalType": "bool",    "name": "support",   "type": "bool" }
      ],
      "name": "voteOnRequest",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    // finalizeRequest(uint256)
    {
      "inputs": [
        { "internalType": "uint256", "name": "requestId", "type": "uint256" }
      ],
      "name": "finalizeRequest",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    // getRequestCount()
    {
      "inputs": [],
      "name": "getRequestCount",
      "outputs": [
        { "internalType": "uint256", "name": "", "type": "uint256" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    // getRequest(uint256)
    {
      "inputs": [
        { "internalType": "uint256", "name": "requestId", "type": "uint256" }
      ],
      "name": "getRequest",
      "outputs": [
        { "internalType": "string",  "name": "description",      "type": "string" },
        { "internalType": "address", "name": "recipient",        "type": "address" },
        { "internalType": "uint256", "name": "amount",           "type": "uint256" },
        { "internalType": "uint256", "name": "votesFor",         "type": "uint256" },
        { "internalType": "uint256", "name": "votesAgainst",     "type": "uint256" },
        { "internalType": "uint256", "name": "totalVotingPower", "type": "uint256" },
        { "internalType": "uint256", "name": "votingDeadline",   "type": "uint256" },
        { "internalType": "bool",    "name": "executed",         "type": "bool" }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];
  
  const votingAddress = process.env.NEXT_PUBLIC_VOTING_CONTRACT!;
  if (!votingAddress) {
    throw new Error("Missing NEXT_PUBLIC_VOTING_CONTRACT address");
  }
  
  const publicClient = createPublicClient({
    chain: scrollSepolia,
    transport: http()
  });
  
  function getVotingContract() {
    if (typeof window === "undefined") return null;
  
    const walletClient = createWalletClient({
      chain: scrollSepolia,
      transport: custom(window.ethereum)
    });
  
    return {
      read: publicClient,
      write: walletClient,
      address: votingAddress as `0x${string}`,
      abi: votingABI
    };
  }
  
  // createRequest(...)
  export async function createRequest(
    description: string,
    recipient: string,
    amountEth: string,
    totalVotingPower: string,
    deadline: string
  ) {
    const contract = getVotingContract();
    if (!contract) throw new Error("No contract instance");
    if (!window.ethereum) throw new Error("No wallet found");
  
    const [account] = await contract.write.requestAddresses();
  
    // Convert amountEth to Wei
    const amountWei = parseEther(amountEth);
    // parse your totalVotingPower from e.g. string to BigInt
    const power = BigInt(totalVotingPower);
    // parse your deadline if it's a Unix timestamp
    const ddl = BigInt(deadline);
  
    const hash = await contract.write.writeContract({
      account,
      address: contract.address,
      abi: contract.abi,
      functionName: "createRequest",
      args: [description, recipient, amountWei, power, ddl]
    });
  
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    return receipt;
  }
  
  // read single request
  export async function getRequest(requestId: number) {
    const contract = getVotingContract();
    if (!contract) throw new Error("No contract instance");
  
    const data = await contract.read.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName: "getRequest",
      args: [BigInt(requestId)]
    });
  
    // [description, recipient, amount, votesFor, votesAgainst, totalVotingPower, votingDeadline, executed]
    const [
      description,
      recipient,
      amount,
      votesFor,
      votesAgainst,
      totalVotingPower,
      votingDeadline,
      executed
    ] = data as [
      string,
      string,
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
      boolean
    ];
  
    return {
      description,
      recipient,
      amount, // in Wei
      votesFor: Number(votesFor),
      votesAgainst: Number(votesAgainst),
      totalVotingPower: Number(totalVotingPower),
      votingDeadline: Number(votingDeadline),
      executed
    };
  }
  
  // read total requests
  export async function getRequestCount(): Promise<number> {
    const contract = getVotingContract();
    if (!contract) throw new Error("No contract instance");
  
    const count = (await contract.read.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName: "getRequestCount"
    })) as bigint;
    return Number(count);
  }
  
  // loop all requests
  export async function getAllRequests(): Promise<any[]> {
    const count = await getRequestCount();
    const results = [];
    for (let i = 1; i <= count; i++) {
      const req = await getRequest(i);
      results.push({ id: i, ...req });
    }
    return results;
  }
  
  // voteOnRequest(...)
  export async function voteRequest(requestId: number, support: boolean) {
    const contract = getVotingContract();
    if (!contract) throw new Error("No contract instance");
    if (!window.ethereum) throw new Error("No wallet found");
  
    const [account] = await contract.write.requestAddresses();
  
    const hash = await contract.write.writeContract({
      account,
      address: contract.address,
      abi: contract.abi,
      functionName: "voteOnRequest",
      args: [BigInt(requestId), support]
    });
  
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    return receipt;
  }
  
  // finalizeRequest(...)
  export async function finalizeRequest(requestId: number) {
    const contract = getVotingContract();
    if (!contract) throw new Error("No contract instance");
    if (!window.ethereum) throw new Error("No wallet found");
  
    const [account] = await contract.write.requestAddresses();
  
    const hash = await contract.write.writeContract({
      account,
      address: contract.address,
      abi: contract.abi,
      functionName: "finalizeRequest",
      args: [BigInt(requestId)]
    });
  
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    return receipt;
  }
  