// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

contract UserManagement {

    enum Role { Admin, Reporter, Investigator }
        
    struct User {
        string nid;
        string name;
        Role role;
        address walletAddress;
        bool isRegistered;
    }

    mapping(address => User) private users;
    User[] private investigators;
    address public owner;

    constructor() {
        owner = msg.sender;
        users[msg.sender] = User({
            nid: "A4M17",
            name: "System Admin",
            role: Role.Admin,
            walletAddress: msg.sender,
            isRegistered: true
        });
    }

    function registerUser(string memory _nid, string memory _name, Role _role) external {
        require(!users[msg.sender].isRegistered, "User already registered");
        
        if (_role == Role.Admin) {
            require(msg.sender == owner, "Only owner can register as Admin");
        }

        User memory user = User({
            nid: _nid,
            name: _name,
            role: _role,
            walletAddress: msg.sender,
            isRegistered: true
        });
        users[msg.sender] = user;

        if (_role == Role.Investigator) {
            investigators.push(user);
        }

    }

    function getUserDetails(address _user) external view returns (User memory){
        require(users[_user].isRegistered, "User not registered");
        return users[_user];
    }

    function getInvestigators() external view returns (User[] memory) {
        return investigators;
    }

    function isAdmin(address _user) external view returns (bool) {
        return users[_user].isRegistered && users[_user].role == Role.Admin;
    }

    function isReporter(address _user) external view returns (bool) {
        return users[_user].isRegistered && users[_user].role == Role.Reporter;
    }
    function isInvestigator(address _user) external view returns (bool) {
        return users[_user].isRegistered && users[_user].role == Role.Investigator;
    }
}
