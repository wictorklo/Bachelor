// SPDX-License-Identifier: SPDX-License UNLICENSED

pragma solidity ^0.8.0;

import "./Solidity/imports/BokkyPooBahsDateTimeLibrary.sol";

contract clb {
    using BokkyPooBahsDateTimeLibrary for uint;
    //using AccessControl for AccessControl.hasRole;
    //using AccessControl for AccessControl._setupRole;


    uint256 private pageNo = 0;

    mapping(uint => CLB) private CLBs;

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

        CLBs[pageNo] = CLB(_allReportData, _allActionData);
        pageNo ++;
    }

    function updateCLB(uint _pageNo, AllActionData memory _allActionData) public{
        require(isValidDates(_allActionData.actionDate), "Not valid date");
        CLBs[_pageNo].allActionData = _allActionData;
    }
}