// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "../PermissionManager.sol";

contract Permissioned {
    PermissionManager public pm;

    address private owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Only the owner may perform this action");
        _;
    }

    function getAdmin(address addr) public view returns (bool) {
        return pm.getAdmin(addr);
    }

    function setPM(address addr) public onlyOwner() {
        pm = PermissionManager(addr);
    }

    modifier isAdmin {
        require(msg.sender == owner ||pm.getAdmin(msg.sender), "You are not admin");
        _;
    }
}