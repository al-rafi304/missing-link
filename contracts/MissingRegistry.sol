// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

import "contracts/UserManagement.sol";

contract MissingRegistry {

    enum Status { Missing, Found }
    enum Urgency { Low, Medium, High }
    enum Division { Dhaka, Chittagong, Rajshahi, Khulna, Barisal, Sylhet, Rangpur, Mymensingh }
    
    struct MissingPerson {
        string name;
        uint8 age;
        uint8 height;
        Status status;
        string description;
        Division lastSeen;
        string relativeContact;
        Urgency urgency;
        address reporterAddress;
        address investigatorAddress;
    }

    uint public caseCounter = 1;
    mapping(uint => MissingPerson) missingPersons;
    UserManagement public userManagement;

    constructor(address _userManagementAddress) {
        userManagement = UserManagement(_userManagementAddress);
    }

    modifier onlyAdmin() {
        require(userManagement.isAdmin(msg.sender), "Only admin can perform this action");
        _;
    }

    modifier onlyReporter() {
        require(userManagement.isReporter(msg.sender), "Only reporter can perform this action");
        _;
    }

    modifier validCaseId(uint _case) {
        require(_case > 0 && _case < caseCounter, "Invalid case number");
        _;
    }

    function addMissingPerson(
        string memory _name,
        uint8 _age,
        uint8 _height,
        string memory _description,
        Division _lastSeenLocation,
        string memory _relativeContact
    ) external onlyReporter {

        missingPersons[caseCounter] = MissingPerson({
            name: _name, 
            age: _age, 
            height: _height,
            status: Status.Missing,
            description: _description,
            lastSeen: _lastSeenLocation,
            relativeContact: _relativeContact,
            urgency: _age < 18 ? Urgency.High : _age > 50 ? Urgency.Medium : Urgency.Low,
            investigatorAddress: address(0),
            reporterAddress: msg.sender
        });
        caseCounter++;
    }

    function updateStatus(uint _case, Status _status) external onlyAdmin validCaseId(_case) {
        MissingPerson storage mp = missingPersons[_case];
        require(mp.status == Status.Missing, "Cannot change status for found person");
        require(_status == Status.Found, "Can only update the status to found");

        mp.status = _status;
    }

    function assignInvestigator(uint _case, address _investigator) external onlyAdmin validCaseId(_case){
        require(userManagement.isInvestigator(_investigator), "Address is not an investigator");

        MissingPerson storage mp = missingPersons[_case];
        require(mp.status == Status.Missing, "Cannot assign investigator for found person");
        require(mp.investigatorAddress == address(0), "The person has already been assigned to an investigator");
        
        mp.investigatorAddress = _investigator;
    }

    function getMissingPerson(uint _case) external view validCaseId(_case) returns (MissingPerson memory) {
        return missingPersons[_case];
    }

    // TODO: Filter missing persons

}