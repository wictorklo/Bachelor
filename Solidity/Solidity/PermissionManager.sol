// SPDX-License-Identifier: GPL-3.0

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

    function addAccountCert(address account, string memory permission) public onlyAdmin {
        uint nPerms = nPermissions[account];
        permissions[account][nPerms] = permission;
        nPermissions[account]++;
    }

    function accountHasCert(address account, string memory permission) public view returns (bool) {
        uint nPerms = nPermissions[account];
        for (uint i = 0; i < nPerms; i++){
            if (keccak256(bytes(permissions[account][i])) == keccak256(bytes(permission))) {
                return true;
            }
        }
        return false;
    }

    function getPermissions(address account) public view onlyAdmin returns (string[] memory) {
        uint nPerms = nPermissions[account];
        string[] memory perms = new string[](nPerms);
        for (uint i = 0; i < nPerms; i++){
            perms[i] = permissions[account][i];
        }
        return perms;
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

    function kill() public onlyAdmin {
        selfdestruct(payable(address(owner)));
    }

}