// SPDX-License-Identifier: SPDX-License UNLICENSED

pragma solidity ^0.8.0;

import "BokkyPooBahsDateTimeLibrary.sol";

contract tlb {
    using BokkyPooBahsDateTimeLibrary for uint;

    uint256 public pageNo = 0;
    enum MelCat {A, B, C, D, NA}
    enum Category {DEFAULT, I, II, IIIA, IIIB}
    mapping(uint => TLB) public TLBs;

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
        uint IdNo;
    }

    struct Action {
        string actions;
        uint IdNo;
    }

    struct Status {
        bool Cdccl;
        bool FcsRepair;
        bool Rii;
        MelCat[] MelCats;
        bool M;
        bool O;
        bool notifyDispatch;
        uint licenseNo;
        uint256[3] actionDate;
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

    struct AllReportData{
        Aircraft aircraft;
        uint flightNo;
        string flightFrom;
        string flightTo;
        uint256[3] reportDate;
        EngineOil engineOil;
        APU apu;
        HydFluid hydFluid;
        Report report;
    }

    struct AllActionData{
        uint256[3] actionDate;
        Action action;
        Status status;
        Parts parts;
        Category[] category;
        uint256[3] expiredDate;
        bool etopsFlight;
        FlightTime flightTime;
        string maintCheck;
        uint licenceNo;
        uint station;
        bool CaaCertification;
        bool handlingAgent;
        uint certNo;
    }

    struct TLB{
        /* Aircraft aircraft;
        uint flightNo;
        string flightFrom;
        string flightTo;
        uint256[3] reportDate;
        uint256[3] actionDate;
        EngineOil engineOil;
        APU apu;
        HydFluid hydFluid;
        Report report;
        Action action;
        Status status;
        Parts parts;
        Category[] category;
        uint256[3] expiredDate;
        bool EtopsFlight;
        FlightTime flightTime;
        string maintCheck;
        uint licenseNo;
        uint station;
        bool CaaCertification;
        bool handlingAgent; //If yes then CertNo
        uint CertNo; */
        //AllReportData allReportData;
        AllActionData allActionData;
    }

    function isValidDates(uint[3] memory _date) private pure returns (bool) {
        if (BokkyPooBahsDateTimeLibrary.isValidDate(_date[2], _date[1], _date[0])) {
            return true;
        }
        else {
            return false;
        }
    }
    /*
    function addTLB(Aircraft memory _aircraft, uint _flightNo, string memory _flightFrom, string memory _flightTo, uint256[3] memory _reportDate,
                    EngineOil memory _engineOil, APU memory _apu, HydFluid memory _hydFluid, Report memory _report) public {
        pageNo ++;
        require(isValidDates(_reportDate), "Not valid date");

        uint256[3] memory _actionDate;
        Action memory _action;
        Status memory _status;
        Parts memory _parts;
        FlightTime memory _flightTime;
        uint256[3] memory _expiredDate;
        Category _category = Category.DEFAULT;

        TLBs[pageNo] = TLB(_aircraft, _flightNo, _flightFrom, _flightTo, _reportDate, _actionDate, _engineOil,
        _apu, _hydFluid, _report, _action, _status, _parts, _category, _expiredDate, false, _flightTime, "", 0, 0, false, false, 0);
    }*/

    function updateTLB(AllActionData memory _allActionData) public{
        //require(isValidDates(), "Not valid action date");
        //require(isValidDates(_expiredDate), "Not valid expired date");
        TLBs[pageNo]=TLB(_allActionData);

    }

}