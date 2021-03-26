// SPDX-License-Identifier: SPDX-License UNLICENSED

pragma solidity ^0.8.0;

contract{
    uint256 public pageNo = 0;
    enum MelCat {A, B, C, D, NA};
enum Category {I, II, IIIA, IIIB};
mapping(uint => TLB) public TLBs;

struct Aircraft {
uint ACType;
uint ACNo;
}

struct Date {
uint day;
uint month;
uint year;
}

struct EngineOil {
uint engineNo;
uint addedQts;
uint finalQts;
}

struct APU {
uint addedOil;
uint finalOil;
// uint hours;
// uint cycles; Are they ints?!
}

struct HydFluid {
// uint Sys1BL;
// uint Sys2GC;
// uint Sys3YR;
// uint Sys4; Are they ints?!
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
Date date;
}

struct PartNo {
uint partOff;
uint partOn;
}

struct SerialNo {
uint serialOff;
uint serialOn;
}

struct Parts { //Name?!
uint item;
// string nomenclature; String!?
uint posistion; //Pos = posistion?!
PartNo partNo;
SerialNo serialNo;
}

struct FlightTime {
uint hour;
uint minute;
}

struct TLB{
Aircraft aircraft;
uint flightNo;
string flightFrom;
string flightTo;
Date date;
EngineOil engineOil;
APU apu;
HydFluid hydFluid;
Report report;
Action action;
Status status;
Parts parts;
Category[] category;
Date expiredDate;
bool EtopsFlight;
FlightTime flightTime;
string maintCheck;
uint licenseNo;
uint station;
bool CaaCertification;
bool handlingAgent; //If yes then CertNo
uint CertNo;
}

function addTLB(Aircraft _aircraft, uint _flightNo, string memory _flightFrom, string memory _flightTo, Date _date, EngineOil _engineOil, APU _apu, HydFluid _hydFluid, Report _report) public {
incrementPageNo();
TLBs[pageNo] = TLB(_aircraft, _flightNo, _flightFrom, _flightTo, _date, _engineOil, _apu, _hydFluid, _report);
}

function updateTLB(uint _pageNo, Date memory _actionDate, uint _IdNo, string memory _sta, string memory _nomenclature, uint _partNo, uint _serialNo, string memory _action) public{
incrementPageNo();

}

function incrementPageNo() internal {
pageNo ++;
}

}