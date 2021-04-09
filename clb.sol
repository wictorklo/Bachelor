// SPDX-License-Identifier: SPDX-License UNLICENSED

pragma solidity ^0.8.0;
//pragma experimental ABIEncoderV2;

//import "BokkyPooBahsDateTimeLibrary.sol";

contract clb {
    //using BokkyPooBahsDateTimeLibrary for uint;
    uint256 public pageNo = 0;
    //uint currentYear = now / 60 / 60 / 24 / 365;
    // uint currentMonth =


    mapping(uint => CLB) public CLBs;

    struct Date {
        uint day;
        uint month;
        uint year;
    }

    //Date emptyDate = Date({day: 0, month: 0, year: 0});

    struct CLB {
        uint256 pageNo;
        string ACReg;
        uint flightNo;
        //Date reportDate;
        //Date actionDate;
        uint leg;
        string report;
        uint IdNo;
        string Sta;
        string nomenclature;
        uint partNo;
        uint serialNo;
        string action;
        uint day;
        uint month;
        uint year;
    }

    function addCLB(string memory _ACReg, uint _flightNo, uint _leg, string memory _report, uint _IdNo, uint _day, uint _month, uint _year) public {
        /* require(_day<=31, "Not valid day");
         require(_month<=12, "Not valid month");
         require(_year>=1970 && _year<=currentYear, "Not valid year");
         if (_year==currentYear){
             require(_month<=currentMonth, "Not valid month IF");
             if (_month==currentMonth){
                 require(_day<=currentDay, "Not valid day IF");
             }
         }*/
        incrementPageNo();
        CLBs[pageNo] = CLB(0, _ACReg, _flightNo, _leg, _report, _IdNo, "", "", 0, 0, "", _day, _month, _year);
    }


    function updateCLB(uint _pageNo, Date memory _reportDate, uint _IdNo, string memory _sta, string memory _nomenclature, uint _partNo, uint _serialNo, string memory _action) public{
        incrementPageNo();
        //CLBs[_pageNo].reportDate = _reportDate;
        CLBs[_pageNo].IdNo = _IdNo;
        CLBs[_pageNo].Sta = _sta;
        CLBs[_pageNo].nomenclature = _nomenclature;
        CLBs[_pageNo].partNo = _partNo;
        CLBs[_pageNo].serialNo = _serialNo;
        CLBs[_pageNo].action = _action;
    }

    function incrementPageNo() internal {
        pageNo ++;
    }
}