// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./Permissions.sol";

contract Permissioned {
    Permissions private pm;

    address private owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Only the owner may perform this action");
        _;
    }

    function setPM(address addr) public onlyOwner() {
        pm = Permissions(addr);
    }

    modifier isAdmin {
        require(pm.getAdmin(msg.sender), "You are not admin");
        _;
    }
}