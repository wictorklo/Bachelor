// SPDX-License-Identifier: SPDX-License UNLICENSED

pragma solidity ^0.8.0;

import "./Solidity/imports/BokkyPooBahsDateTimeLibrary.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/AccessControl.sol";

contract clb {
    using BokkyPooBahsDateTimeLibrary for uint;
    //using AccessControl for AccessControl.hasRole;
    //using AccessControl for AccessControl._setupRole;


    uint256 private pageNo = 0;

    mapping(uint => CLB) public CLBs;
    /*
    Roles.Role private admin;
    Roles.Role private managers;
    Roles.Role private mechanics;

    constructor() public {
        admin.add(msg.sender);
    }

    function addManager(address _newManager) external onlyAdmin() {
        managers.add(_newManager);
    }

    function addMechanic(address _newMechanic) external onlyAdmin() onlyManager() {
        mechanics.add(_newMechanic);
    }

    address admin;
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant MECHANIC_ROLE = keccak256("MECHANIC_ROLE");




    constructor() public {
        // Grant the contract deployer the default admin role: it will be able
        // to grant and revoke any roles
        AccessControl._setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    modifier onlyAdmin() {
        require(AccessControl.hasRole(AccessControl.DEFAULT_ADMIN_ROLE, msg.sender), "Must be admin");
        _;
    }

    modifier onlyManager() {
        require(AccessControl.hasRole(MANAGER_ROLE, msg.sender), "Must be manager");
        _;
    }


    */

    struct CLB {
        uint256 pageNo;
        string ACReg;
        uint flightNo;
        uint256[3] reportDate;
        uint256[3] actionDate;
        uint leg;
        string report;
        uint IdNo;
        string Sta;
        string nomenclature;
        uint partNo;
        uint serialNo;
        string action;
    }

    function isValidDates(uint[3] memory _date) private pure returns (bool) {
        if (BokkyPooBahsDateTimeLibrary.isValidDate(_date[2], _date[1], _date[0])) {
            return true;
        }
        else {
            return false;
        }
    }

    function addCLB(string memory _ACReg, uint _flightNo, uint256[3] memory _reportDate, uint _leg, string memory _report, uint _IdNo) public {
        pageNo ++;
        require(isValidDates(_reportDate), "Not valid date");
        uint256[3] memory _actionDate;
        CLBs[pageNo] = CLB(0, _ACReg, _flightNo, _reportDate, _actionDate, _leg, _report, _IdNo, "", "", 0, 0, "");
    }

    function updateCLB(uint _pageNo, uint[3] memory _actionDate, uint _IdNo, string memory _sta, string memory _nomenclature, uint _partNo, uint _serialNo, string memory _action) public{
        require(isValidDates(_actionDate), "Not valid date");
        CLBs[_pageNo].actionDate = _actionDate;
        CLBs[_pageNo].IdNo = _IdNo;
        CLBs[_pageNo].Sta = _sta;
        CLBs[_pageNo].nomenclature = _nomenclature;
        CLBs[_pageNo].partNo = _partNo;
        CLBs[_pageNo].serialNo = _serialNo;
        CLBs[_pageNo].action = _action;
    }
}