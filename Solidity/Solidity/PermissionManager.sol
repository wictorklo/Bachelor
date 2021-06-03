// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */
contract PermissionManager {
    address owner;
    mapping(address => bool) private isAdmin;


    modifier onlyAdmin {
        require(isAdmin[msg.sender] || msg.sender == owner);
        _;
    }

    constructor() {
        owner = msg.sender;
        isAdmin[msg.sender] = true;
    }

    function setAdmin(address a) public payable onlyAdmin {
        isAdmin[a] = true;
    }

    function removeAdmin(address a) public onlyAdmin {
        require(a != owner || msg.sender == owner, "You cannot remove the owner as admin");
        isAdmin[a] = false;
    }

    function getAdmin(address a) public view returns (bool) {
        return isAdmin[a];
    }
}