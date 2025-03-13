// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @notice Interface to interact with the crowdfunding contract for contributor data.
interface ICrowdfunding {
    function getUserContribution(uint256 projectId, address user) external view returns (uint256);
}

contract Voting {
    // A spending request for releasing funds.
    struct Request {
        uint256 id;
        string description;
        address payable recipient;
        uint256 amount;
        uint256 votesFor;       // Sum of weighted votes in favor
        uint256 votesAgainst;   // Sum of weighted votes against
        uint256 votingDeadline; // Timestamp when voting ends
        bool executed;          // True if finalized (approved or rejected)
        // Tracks if an address has already voted on this request.
        mapping(address => bool) hasVoted;
    }

    // Mapping of request ID to Request details.
    mapping(uint256 => Request) public requests;
    uint256 public requestCount;

    // The minimum percentage of weighted votes required for approval.
    uint256 public constant minimumApprovalPercentage = 51;

    // The project owner (typically the admin or creator of the crowdfunding campaign).
    address public projectOwner;
    // The project ID from the crowdfunding contract that this voting instance is associated with.
    uint256 public projectId;
    // Reference to the crowdfunding contract (to fetch each contributor’s vote weight).
    ICrowdfunding public crowdfunding;

    // Events for logging activities.
    event RequestCreated(
        uint256 indexed requestId,
        string description,
        address recipient,
        uint256 amount,
        uint256 votingDeadline
    );
    event Voted(uint256 indexed requestId, address voter, uint256 weight, bool approve);
    event RequestFinalized(uint256 indexed requestId, bool approved);

    /// @param _crowdfunding Address of the deployed crowdfunding contract.
    /// @param _projectOwner The owner/administrator of the project.
    /// @param _projectId The ID of the project within the crowdfunding contract.
    constructor(address _crowdfunding, address _projectOwner, uint256 _projectId) {
        crowdfunding = ICrowdfunding(_crowdfunding);
        projectOwner = _projectOwner;
        projectId = _projectId;
    }

    /// @notice Creates a new spending request.
    /// @param _description Description of the spending request.
    /// @param _recipient Address to receive funds if the request is approved.
    /// @param _amount Amount of funds requested.
    /// @param _votingPeriod Duration (in seconds) during which votes can be cast.
    function createRequest(
        string memory _description,
        address payable _recipient,
        uint256 _amount,
        uint256 _votingPeriod
    ) external {
        require(msg.sender == projectOwner, "Only project owner can create request");

        requestCount++;
        // Use storage pointer to initialize a new request in the mapping.
        Request storage newRequest = requests[requestCount];
        newRequest.id = requestCount;
        newRequest.description = _description;
        newRequest.recipient = _recipient;
        newRequest.amount = _amount;
        newRequest.votingDeadline = block.timestamp + _votingPeriod;
        newRequest.executed = false;

        emit RequestCreated(requestCount, _description, _recipient, _amount, newRequest.votingDeadline);
    }

    /// @notice Casts a vote on a spending request.
    /// @param _requestId The ID of the request to vote on.
    /// @param _approve True to vote in favor; false to vote against.
    function vote(uint256 _requestId, bool _approve) external {
        Request storage request = requests[_requestId];
        require(block.timestamp < request.votingDeadline, "Voting period is over");
        require(!request.hasVoted[msg.sender], "Already voted on this request");

        // Retrieve the voter’s contribution from the crowdfunding contract.
        uint256 weight = crowdfunding.getUserContribution(projectId, msg.sender);
        require(weight > 0, "No voting power");

        request.hasVoted[msg.sender] = true;
        if (_approve) {
            request.votesFor += weight;
        } else {
            request.votesAgainst += weight;
        }
        emit Voted(_requestId, msg.sender, weight, _approve);
    }

    /// @notice Finalizes a request after the voting period ends.
    /// If approved, transfers the requested amount to the recipient.
    /// @param _requestId The ID of the request to finalize.
    function finalizeRequest(uint256 _requestId) external {
        Request storage request = requests[_requestId];
        require(block.timestamp >= request.votingDeadline, "Voting still in progress");
        require(!request.executed, "Request already finalized");
        require(msg.sender == projectOwner, "Only project owner can finalize");

        uint256 totalVotes = request.votesFor + request.votesAgainst;
        require(totalVotes > 0, "No votes cast");

        // Calculate the percentage of votes in favor.
        uint256 approvalPercentage = (request.votesFor * 100) / totalVotes;
        bool approved = approvalPercentage >= minimumApprovalPercentage;

        if (approved) {
            // Ensure the contract has sufficient funds.
            require(address(this).balance >= request.amount, "Insufficient funds in contract");
            (bool sent, ) = request.recipient.call{value: request.amount}("");
            require(sent, "Fund transfer failed");
        }
        request.executed = true;
        emit RequestFinalized(_requestId, approved);
    }

    /// @notice Allows deposits of funds to this contract.
    function deposit() external payable {}

    /// @notice Fallback function to accept ETH sent directly.
    receive() external payable {}
}
