// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */
contract PermissionManager {
    address owner;
    mapping(address => bool) private isAdmin;
    mapping(address => mapping(string => bool)) private certification;

    modifier onlyAdmin {
        require(isAdmin[msg.sender] || msg.sender == owner);
        _;
    }

    constructor() {
        owner = msg.sender;
        isAdmin[msg.sender] = true;
    }

    function addAccountCert(address account, string memory permission) public onlyAdmin {
        certification[account][permission] = true;
    }

    function accountHasCert(address account, string memory permission) public view returns (bool) {
        return certification[account][permission];
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