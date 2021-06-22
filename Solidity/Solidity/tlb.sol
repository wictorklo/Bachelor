// SPDX-License-Identifier: SPDX-License UNLICENSED

pragma solidity ^0.8.0;

import "./Solidity/imports/BokkyPooBahsDateTimeLibrary.sol";
import "./Solidity/imports/Permissioned.sol";

contract tlb is Permissioned {

    uint256 private pageNo = 0;
    enum MelCat {A, B, C, D, NA}
    enum Category {I, II, IIIA, IIIB}
    mapping(uint => TLB) private TLBs;

    struct Aircraft {
        uint ACType;
        uint ACNo;
    }

    struct EngineOil {
        uint engineNo;
        uint addedQts;
        string finalQts;
    }

    struct APU {
        uint addedOil;
        string finalOil;
        uint hour;
        uint cycles;
    }

    struct HydFluid {
        uint Sys1BL;
        uint Sys2GC;
        uint Sys3YR;
        uint Sys4;
    }

    struct Report {
        string reports;
        uint reportIdNo;
    }

    struct Action {
        string actions;
        uint actionIdNo;
    }

    struct Status {
        bool Cdccl;
        bool FcsRepair;
        bool Rii;
        MelCat MelCats;
        bool M;
        bool O;
        bool notifyDispatch;
        uint licenseNo;
        Date actionDate;
    }

    struct PartNo {
        uint partOff;
        uint partOn;
    }

    struct SerialNo {
        uint serialOff;
        uint serialOn;
    }

    struct Parts {
        uint item;
        string nomenclature;
        uint posistion;
        PartNo partNo;
        SerialNo serialNo;
    }

    struct FlightTime {
        uint hour;
        uint minute;
    }

    struct Date {
        uint day;
        uint month;
        uint year;
    }

    struct AllReportData{
        Aircraft aircraft;
        uint flightNo;
        string flightFrom;
        string flightTo;
        Date reportDate;
        EngineOil engineOil;
        APU apu;
        HydFluid hydFluid;
        Report report;
    }

    struct AllActionData{
        Date actionDate;
        Action action;
        Status status;
        Parts parts;
        Category category;
        Date expiredDate;
        bool etopsFlight;
        FlightTime flightTime;
        string maintCheck;
        uint licenceNo;
        uint station;
        bool CaaCertification;
    }

    struct TLB{
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
            _date = TLBs[i].allReportData.reportDate;
            return daysSince(_date) < 30;
        } else if (filter == 2) {
            _date = TLBs[i].allActionData.actionDate;
            return daysSince(_date) < 30;
        } else if (filter == 3) {
            _date = TLBs[i].allActionData.actionDate;
            return daysSince(_date) > 30;
        } else if (filter == 4) {
            return TLBs[i].certReportSignature == address(0) || TLBs[i].certActionSignature == address(0);
        } else if (filter == 5) {
            return TLBs[i].certReportSignature != address(0) && TLBs[i].certActionSignature != address(0);
        }
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

    function filterList(uint8 filter) private view returns (TLB[] memory) {
        TLB[] memory ret = new TLB[](getCount(filter));
        uint c = 0;
        for (uint i = 0; i < pageNo; i++){
            if (valid(filter, i)){
                ret[c] = TLBs[i];
                c++;
            }
        }
        return ret;
    }

    function addTLB(AllReportData memory _allReportData) public hasPermission("tlb.addTLB") {
        require(isValidDates(_allReportData.reportDate), "Not valid report date");

        AllActionData memory _allActionData;

        TLBs[pageNo] = TLB(_allReportData, _allActionData, msg.sender, address(0), address(0), address(0));
        pageNo ++;
    }

    function updateTLB(uint _pageNo, AllActionData memory _allActionData) public hasPermission("tlb.updateTLB") {
        require(isValidDates(_allActionData.actionDate), "Not valid action date");
        require(isValidDates(_allActionData.expiredDate), "Not valid expired date");
        TLBs[_pageNo].allActionData = _allActionData;
        TLBs[_pageNo].uncertActionSignature = msg.sender;
    }

    function certReportSign(uint _pageNo) public hasPermission("tlb.certReportSign") {
        TLBs[_pageNo].certReportSignature = msg.sender;
    }

    function certActionSign(uint _pageNo) public hasPermission("tlb.certActionSign") {
        TLBs[_pageNo].certActionSignature = msg.sender;
    }

    function getCurrentFinishedTLB() public view hasPermission("tlb.getTLB") returns (TLB[] memory)  {
        return filterList(2);
    }

    function getCurrentUnfinishedTLB() public view hasPermission("tlb.getCurrentUnfinishedTLB") returns (TLB[] memory)  {
        return filterList(1);
    }

    function getArchivedTLB() public view hasPermission("tlb.getArchivedTLB") returns (TLB[] memory)  {
        return filterList(3);
    }

    function getTLB() public view hasPermission("tlb.getTLB") returns (TLB[] memory)  {
        TLB[] memory ret = new TLB[](pageNo);
        for (uint i = 0; i < pageNo; i++) {
            ret[i] = TLBs[i];
        }
        return ret;
    }

    function getUnsignedData() public view hasPermission("tlb.getUnsignedData") returns(TLB[] memory){
        return filterList(4);
    }

    function getSignedData() public view hasPermission("tlb.getSignedData") returns(TLB[] memory){
        return filterList(5);
    }

}