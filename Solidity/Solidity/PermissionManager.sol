// SPDX-License-Identifier: SPDX-License UNLICENSED

pragma solidity ^0.8.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */
contract PermissionManager {
    address payable owner;

    mapping(address => bool) private isAdmin;
    mapping(address => mapping(uint => string)) private permissions;
    mapping(address => uint) private nPermissions;

    modifier onlyAdmin {
        require(isAdmin[msg.sender] || msg.sender == address(owner), "You are not admin");
        _;
    }

    constructor() {
        owner = payable(msg.sender);
        isAdmin[msg.sender] = true;
    }

    function addAccountCert(address addr, string memory permission) public onlyAdmin {
        uint nPerms = nPermissions[addr];
        permissions[addr][nPerms] = permission;
        nPermissions[addr]++;
    }

    function accountHasCert(address addr, string memory permission) public view returns (bool) {
        uint nPerms = nPermissions[addr];
        for (uint i = 0; i < nPerms; i++){
            if (keccak256(bytes(permissions[addr][i])) == keccak256(bytes(permission))) {
                return true;
            }
        }
        return false;
    }

    function getPermissions(address addr) public view onlyAdmin returns (string[] memory) {
        uint nPerms = nPermissions[addr];
        string[] memory perms = new string[](nPerms);
        for (uint i = 0; i < nPerms; i++){
            perms[i] = permissions[addr][i];
        }
        return perms;
    }

    function setAdmin(address addr) public payable onlyAdmin {
        isAdmin[addr] = true;
    }

    function removeAdmin(address addr) public onlyAdmin {
        require(addr != owner || msg.sender == owner, "You cannot remove the owner as admin");
        isAdmin[addr] = false;
    }

    function getAdmin(address addr) public view returns (bool) {
        return isAdmin[addr];
    }

    function kill() public onlyAdmin {
        selfdestruct(payable(address(owner)));
    }

}