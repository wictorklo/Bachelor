pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract SystemHierarchy is AccessControl {
    event SetAdminRole(bytes32 roleId, bytes32 adminId);

    // Add `root` as a member of the root role.
    constructor (address root) public {
        _setupRole(DEFAULT_ADMIN_ROLE, root); //"root" is granted the role "DEFAULT_ADMIN_ROLE"
    }

    // Restricted to members of the role passed as a parameter.
    modifier onlyMember(bytes32 roleId) {
        require(hasRole(roleId, msg.sender), // hasRole returns `true` if `msg.sender` has `roleId`.
            "Restricted to employees with specified role.");
        _;
    }

    // Create a new role with the specified admin role.
    function addRole(bytes32 roleId, bytes32 adminId) public onlyMember(adminId) {
        _setRoleAdmin(roleId, adminId); // Sets `adminRole` as `role`'s admin role. You say who is the "parent node" of the new role
        emit SetAdminRole(roleId, adminId); // The data of the change created ^ is logged to the blockchain
    }
}