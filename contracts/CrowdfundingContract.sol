// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CrowdfundingContract {
    struct Project {
        uint256 id;
        address owner;
        uint256 fundingGoal;
        uint256 currentFunding;
        uint256 backers;
        bool active;
    }

    mapping(uint256 => Project) public projects;
    mapping(uint256 => mapping(address => uint256)) public contributions;
    uint256 public projectCount;

    event ProjectCreated(uint256 indexed projectId, address indexed owner, uint256 fundingGoal);
    event ProjectFunded(uint256 indexed projectId, address indexed backer, uint256 amount);
    event ProjectCompleted(uint256 indexed projectId, uint256 totalFunding);

    function createProject(uint256 fundingGoal) external returns (uint256) {
        projectCount++;
        projects[projectCount] = Project({
            id: projectCount,
            owner: msg.sender,
            fundingGoal: fundingGoal,
            currentFunding: 0,
            backers: 0,
            active: true
        });

        emit ProjectCreated(projectCount, msg.sender, fundingGoal);
        return projectCount;
    }

    function fundProject(uint256 projectId) external payable {
        require(projects[projectId].active, "Project is not active");
        require(msg.value > 0, "Funding amount must be greater than 0");

        Project storage project = projects[projectId];
        
        if (contributions[projectId][msg.sender] == 0) {
            project.backers++;
        }
        
        contributions[projectId][msg.sender] += msg.value;
        project.currentFunding += msg.value;

        emit ProjectFunded(projectId, msg.sender, msg.value);

        if (project.currentFunding >= project.fundingGoal) {
            project.active = false;
            emit ProjectCompleted(projectId, project.currentFunding);
        }
    }

    function getProjectFunding(uint256 projectId) external view returns (uint256) {
        return projects[projectId].currentFunding;
    }

    function getProjectBackers(uint256 projectId) external view returns (uint256) {
        return projects[projectId].backers;
    }

    function getUserContribution(uint256 projectId, address user) external view returns (uint256) {
        return contributions[projectId][user];
    }
}