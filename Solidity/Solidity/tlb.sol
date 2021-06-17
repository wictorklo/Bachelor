// SPDX-License-Identifier: SPDX-License UNLICENSED

pragma solidity ^0.8.0;

import "./Solidity/imports/BokkyPooBahsDateTimeLibrary.sol";
import "./Solidity/imports/Permissioned.sol";

contract tlb is Permissioned{
    using BokkyPooBahsDateTimeLibrary for uint;

    uint nTLBs = 0;
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

    function addTLB(AllReportData memory _allReportData) public {
        require(isValidDates(_allReportData.reportDate), "Not valid report date");

        AllActionData memory _allActionData;

        TLBs[pageNo] = TLB(_allReportData, _allActionData, msg.sender, address(0), address(0), address(0));
        pageNo ++;
    }

    function updateTLB(uint _pageNo, AllActionData memory _allActionData) public{
        require(isValidDates(_allActionData.actionDate), "Not valid action date");
        require(isValidDates(_allActionData.expiredDate), "Not valid expired date");
        TLBs[_pageNo].allActionData = _allActionData;
        TLBs[_pageNo].uncertActionSignature = msg.sender;
    }

    function certReportSign(uint _pageNo) public onlyCert {
        TLBs[_pageNo].certReportSignature = msg.sender;
    }

    function certActionSign(uint _pageNo) public onlyCert {
        TLBs[_pageNo].certActionSignature = msg.sender;
    }

    function getCurrentFinishedTLB() public view returns (TLB[] memory)  {
        TLB[] memory ret = new TLB[](pageNo);
        for (uint i = 0; i < pageNo; i++) {
            Date memory _date = TLBs[i].allActionData.actionDate;
            if (((block.timestamp/60/60/24) - BokkyPooBahsDateTimeLibrary._daysFromDate(_date.year, _date.month, _date.day))<30){
                ret[i] = TLBs[i];
            }
        }
        return ret;
    }

    function getCurrentUnfinishedTLB() public view returns (TLB[] memory)  {
        TLB[] memory ret = new TLB[](pageNo);
        for (uint i = 0; i < pageNo; i++) {
            Date memory _date = TLBs[i].allReportData.reportDate;
            if (((block.timestamp/60/60/24) - BokkyPooBahsDateTimeLibrary._daysFromDate(_date.year, _date.month, _date.day))<30){
                ret[i] = TLBs[i];
            }
        }
        return ret;
    }

    function getArchivedTLB() public view returns (TLB[] memory)  {
        TLB[] memory ret = new TLB[](pageNo);
        for (uint i = 0; i < pageNo; i++) {
            Date memory _date = TLBs[i].allActionData.actionDate;
            if (((block.timestamp/60/60/24) - BokkyPooBahsDateTimeLibrary._daysFromDate(_date.year, _date.month, _date.day))>30){
                ret[i] = TLBs[i];
            }
        }
        return ret;
    }

    function getTLB() public view returns (TLB[] memory)  {
        TLB[] memory ret = new TLB[](pageNo);
        for (uint i = 0; i < pageNo; i++) {
            ret[i] = TLBs[i];
        }
        return ret;
    }

    function getUnsignedData() public view onlyCert returns(TLB[] memory){
        TLB[] memory Tlbs = new TLB[](nTLBs);
        TLB[] memory tlbs = getTLB();
        for (uint i = 0; i < nTLBs; i++) {
            if (tlbs[i].certReportSignature == address(0) || tlbs[i].certActionSignature == address(0)) {
                Tlbs[i] = TLBs[i];
            }
        }
        return Tlbs;
    }

    function getSignedData() public view returns(TLB[] memory){
        TLB[] memory Tlbs = new TLB[](nTLBs);
        TLB[] memory tlbs = getTLB();
        for (uint i = 0; i< nTLBs; i++) {
            if (tlbs[i].certReportSignature != address(0) && tlbs[i].certActionSignature != address(0)) {
                Tlbs[i] = TLBs[i];
            }
        }
        return Tlbs;
    }
    /*
        function getTime() public view returns(uint256){
            return block.timestamp/60/60/24;
        }

        function getDay() public view returns(uint256){
            Date memory _date = TLBs[0].allReportData.reportDate;
            return BokkyPooBahsDateTimeLibrary._daysFromDate(_date.year, _date.month, _date.day);
        }

    [[6,0],8,"5ys35","guik2",[20,5,2021],[9,5,"qbokt"],[8,"2r84x",5,4],[0,8,7,3],["5958f",8]]
    */
}