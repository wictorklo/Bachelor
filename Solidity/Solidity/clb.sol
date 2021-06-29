// SPDX-License-Identifier: SPDX-License UNLICENSED

pragma solidity ^0.8.0;

import "./Solidity/imports/BokkyPooBahsDateTimeLibrary.sol";
import "./Solidity/imports/Permissioned.sol";

contract clb is Permissioned {
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

    function isValidDates(Date memory _date) private pure returns (bool) {
        return BokkyPooBahsDateTimeLibrary.isValidDate(_date.year, _date.month, _date.day);
    }

    function daysSince(Date memory date) private view returns (uint) {
        (uint y, uint m, uint d) = BokkyPooBahsDateTimeLibrary.timestampToDate(block.timestamp);
        uint today = BokkyPooBahsDateTimeLibrary._daysFromDate(y, m, d);
        return today - BokkyPooBahsDateTimeLibrary._daysFromDate(date.year, date.month, date.day);
    }

    function valid(uint8 filter, uint i) private view returns (bool){
        /*
        FILTERS
        1 - unfinished
        2 - finished
        3 - archived
        4 - unsigned
        5 - signed
        */
        Date memory _date;
        if (filter == 1) {
            return CLBs[i].allActionData.partNo == 0 && CLBs[i].certActionSignature == address(0);
        } else if (filter == 2) {
            return CLBs[i].allActionData.partNo != 0 && CLBs[i].certActionSignature == address(0);
        } else if (filter == 3) {
            _date = CLBs[i].allActionData.actionDate;
            return daysSince(_date) > 30 && CLBs[i].certActionSignature != address(0);
        } else if (filter == 4) {
            return CLBs[i].certReportSignature == address(0) || CLBs[i].certActionSignature == address(0);
        } else if (filter == 5) {
            return CLBs[i].certReportSignature != address(0) && CLBs[i].certActionSignature != address(0);
        }
        return false;
    }

    function getCount(uint8 filter) private view returns (uint count) {
        count = 0;
        for (uint i = 0; i < pageNo; i++){
            if (valid(filter, i)){
                count++;
            }
        }
        return count;
    }

    function filterList(uint8 filter) private view returns (CLB[] memory) {
        CLB[] memory ret = new CLB[](getCount(filter));
        uint c = 0;
        for (uint i = 0; i < pageNo; i++){
            if (valid(filter, i)){
                ret[c] = CLBs[i];
                c++;
            }
        }
        return ret;
    }

    function addCLB(AllReportData memory _allReportData) public hasPermission("clb.addCLB") {
        require(isValidDates(_allReportData.reportDate), "Not valid report date");

        AllActionData memory _allActionData;

        CLBs[pageNo] = CLB(_allReportData, _allActionData, msg.sender, address(0), address(0), address(0));
        pageNo ++;
    }

    function updateCLB(uint _pageNo, AllActionData memory _allActionData) public hasPermission("clb.updateCLB") {
        require(isValidDates(_allActionData.actionDate), "Not valid date");
        CLBs[_pageNo].allActionData = _allActionData;
        CLBs[_pageNo].uncertActionSignature = msg.sender;
    }

    function certReportSign(uint _pageNo) public hasPermission("clb.certReportSign") {
        CLBs[_pageNo].certReportSignature = msg.sender;
    }

    function certActionSign(uint _pageNo) public hasPermission("clb.certActionSign") {
        CLBs[_pageNo].certActionSignature = msg.sender;
    }

    function getCurrentFinishedCLB() public view returns (CLB[] memory)  {
        return filterList(2);
    }

    function getCurrentUnfinishedCLB() public view returns (CLB[] memory)  {
        return filterList(1);
    }

    function getArchivedCLB() public view returns (CLB[] memory)  {
        return filterList(3);
    }

    function getCLB() private view returns (CLB[] memory)  {
        CLB[] memory ret = new CLB[](pageNo);
        for (uint i = 0; i < pageNo; i++) {
            ret[i] = CLBs[i];
        }
        return ret;
    }

    function getUnsignedData() public view returns(CLB[] memory) {
        return filterList(4);
    }

    function getSignedData() public view returns(CLB[] memory){
        return filterList(5);
    }

}