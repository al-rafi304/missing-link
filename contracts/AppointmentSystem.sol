// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

import "contracts/UserManagement.sol";
import "contracts/MissingRegistry.sol";

contract AppointmentSystem {

    uint public appointmentFee = 5 ether;

    uint public appointmentId = 1;
    struct Appointment {
        uint id;
        uint caseId;
        address Investigator;
        address Reporter;
        uint timestamp;
    }

    mapping(address => Appointment[]) public appointments;
    UserManagement public userManager;
    MissingRegistry public missingRegistry;

    constructor(address _userManagement, address _missingRegistry) {
        userManager = UserManagement(_userManagement);
        missingRegistry = MissingRegistry(_missingRegistry);
    }

    modifier onlyReporter() {
        require(userManager.isReporter(msg.sender), "Only reporter can perform this action");
        _;
    }

    modifier onlyInvestigator() {
        require(userManager.isInvestigator(msg.sender), "Only investigator can perform this action");
        _;
    }
    function bookAppointment(uint _caseId, address _investigator, uint _timestamp) onlyReporter external payable {
        require(userManager.isInvestigator(_investigator), "Invalid investigator address");
        require(msg.value >= appointmentFee, "Insufficient payment for appointment");

        Appointment[] memory aps = getAppointments(_investigator);
        for (uint i=0; i < aps.length; i++){
            if(_timestamp >= aps[i].timestamp && _timestamp<= aps[i].timestamp + 600) {
                revert("Appintment already exists for this timeslot");
            }
        }

        appointments[_investigator].push(Appointment({
            id: appointmentId,
            caseId: _caseId,
            Investigator: _investigator, 
            Reporter: msg.sender, 
            timestamp: _timestamp
        }));
        appointmentId++;

        payable(userManager.owner()).transfer(msg.value);
    }

    function getAppointments(address investigator) public view returns (Appointment[] memory) {
        return appointments[investigator];
    }

    function getAppointmentDetails(address _investigator, uint _appointmentId) external view returns (Appointment memory) {
        for (uint i = 0; i < appointments[_investigator].length; i++) 
        {
            if (appointments[_investigator][i].id == _appointmentId) {
                return appointments[_investigator][i];
            }
        }

        revert("Appointment not found");
    }
}