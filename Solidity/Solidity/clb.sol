// SPDX-License-Identifier: SPDX-License UNLICENSED

pragma solidity ^0.8.0;

import "./Solidity/imports/BokkyPooBahsDateTimeLibrary.sol";
import "./Solidity/imports/Permissioned.sol";

contract clb is Permissioned {
    using BokkyPooBahsDateTimeLibrary for uint;

    uint256 private pageNo = 0;
    uint nCLBs = 0;
    mapping(uint => CLB) private CLBs;
    mapping(address => bool) private isManager;

    struct Date {
        uint day;
        uint month;
        uint year;
    }

    struct AllReportData {
        string ACReg;
        uint flightNo;
        Date reportDate;
        uint leg;
        string report;
        uint reportIdNo;
    }

    struct AllActionData {
        uint partNo;
        Date actionDate;
        uint actionIdNo;
        string sta;
        string nomenclature;
        uint serialNo;
        string action;
    }

    struct CLB {
        AllReportData allReportData;
        AllActionData allActionData;
        address uncertReportSignature;
        address uncertActionSignature;
        address certReportSignature;
        address certActionSignature;
    }

    modifier onlyCert {
        require(pm.accountHasCert(msg.sender, "Certified"), "Not certified");
        _;
    }

    function isValidDates(Date memory _date) private pure returns (bool) {
        if (BokkyPooBahsDateTimeLibrary.isValidDate(_date.year, _date.month, _date.day)) {
            return true;
        }
        else {
            return false;
        }
    }

    function addCLB(AllReportData memory _allReportData) public {
        require(isValidDates(_allReportData.reportDate), "Not valid report date");

        AllActionData memory _allActionData;

        CLBs[pageNo] = CLB(_allReportData, _allActionData, msg.sender, address(0), address(0), address(0));
        pageNo ++;
    }

    function updateCLB(uint _pageNo, AllActionData memory _allActionData) public{
        require(isValidDates(_allActionData.actionDate), "Not valid date");
        CLBs[_pageNo].allActionData = _allActionData;
        CLBs[_pageNo].uncertActionSignature = msg.sender;
    }

    function certReportSign(uint _pageNo) public onlyCert {
        CLBs[_pageNo].certReportSignature = msg.sender;
    }

    function certActionSign(uint _pageNo) public onlyCert {
        CLBs[_pageNo].certActionSignature = msg.sender;
    }

    function getCLB() public view returns (CLB[] memory)  {
        CLB[] memory ret = new CLB[](pageNo);
        for (uint i = 0; i < pageNo; i++) {
            ret[i] = CLBs[i];
        }
        return ret;
    }

    function getUnsignedData() public view onlyCert returns(CLB[] memory) {
        CLB[] memory Clbs = new CLB[](nCLBs);
        CLB[] memory clbs = getCLB();
        for (uint i = 0; i < nCLBs; i++) {
            if (clbs[i].certReportSignature == address(0) || clbs[i].certActionSignature == address(0)) {
                Clbs[i] = CLBs[i];
            }
        }
        return Clbs;
    }

    function getSignedData() public view returns(CLB[] memory){
        CLB[] memory Clbs = new CLB[](nCLBs);
        CLB[] memory clbs = getCLB();
        for (uint i = 0; i< nCLBs; i++) {
            if (clbs[i].certReportSignature != address(0) && clbs[i].certActionSignature != address(0)) {
                Clbs[i] = CLBs[i];
            }
        }
        return Clbs;
    }

}