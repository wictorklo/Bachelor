// SPDX-License-Identifier: SPDX-License UNLICENSED

pragma solidity ^0.8.0;

import "./Solidity/imports/BokkyPooBahsDateTimeLibrary.sol";

contract tlb {
    using BokkyPooBahsDateTimeLibrary for uint;

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
        uint posistion; //Pos = posistion?!
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
        bool handlingAgent; //if this then certNo
        uint certNo;
    }

    struct TLB{
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

    function getTLB() public view returns (TLB[] memory) {
        TLB[] memory ret = new TLB[](pageNo);
        for (uint i = 0; i < pageNo; i++) {
            ret[i] = TLBs[i];
        }
        return ret;
    }

    function addTLB(AllReportData memory _allReportData) public {
        require(isValidDates(_allReportData.reportDate), "Not valid report date");

        AllActionData memory _allActionData;

        TLBs[pageNo] = TLB(_allReportData, _allActionData);
        pageNo ++;
    }

    function updateTLB(uint _pageNo, AllActionData memory _allActionData) public{
        require(isValidDates(_allActionData.actionDate), "Not valid action date");
        require(isValidDates(_allActionData.expiredDate), "Not valid expired date");
        TLBs[_pageNo].allActionData = _allActionData;
    }

}