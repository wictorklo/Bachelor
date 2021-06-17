// SPDX-License-Identifier: SPDX-License UNLICENSED

pragma solidity ^0.8.0;

import "../PermissionManager.sol";

contract Permissioned {
    PermissionManager pm;

    address payable owner;

    constructor() {
        owner = payable(msg.sender);
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Only the owner may perform this action");
        _;
    }

    function setPM(address addr) public onlyOwner() {
        pm = PermissionManager(addr);
    }

    modifier onlyAdmin {
        require(msg.sender == address(owner) || pm.getAdmin(msg.sender), "You are not admin");
        _;
    }

    modifier hasPermission(string memory perm) {
        require(pm.accountHasPerm(msg.sender, perm), "You do not have permission to perform this action");
        _;
    }

    function kill() public onlyOwner {
        selfdestruct(payable(address(msg.sender)));
    }

}