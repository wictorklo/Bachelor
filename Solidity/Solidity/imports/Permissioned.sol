// SPDX-License-Identifier: SPDX-License UNLICENSED

pragma solidity ^0.8.0;

contract PermissionManager {
    function accountHasPerm(address addr, string memory permission) public view returns (bool) {}

    function getPermissions(address addr) public view returns (string[] memory) {}

    function getAdmin(address addr) public view returns (bool) {}
}

contract Permissioned {
    PermissionManager pm;

    address payable owner;

    constructor() {
        owner = payable(msg.sender);
    }

    modifier onlyOwner {
        require(msg.sender == owner || tx.origin == owner, "Only the owner may perform this action");
        _;
    }

    function setPM(address addr) public onlyOwner() virtual {
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