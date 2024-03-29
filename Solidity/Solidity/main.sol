// SPDX-License-Identifier: SPDX-License UNLICENSED

pragma solidity ^0.8.0;
import "./Solidity/imports/Permissioned.sol";

contract main is Permissioned{

    struct Entry {
        string name;
        string ABI;
        address addr;
    }

    mapping(uint => Entry) contracts;

    uint nContracts = 0;

    function setPM(address addr) public onlyOwner() override {
        pm = PermissionManager(addr);
        for (uint i = 0; i < nContracts; i++) {
            (bool success, ) = contracts[i].addr.call(abi.encodeWithSignature("setPM(address)", addr));
        }
    }

    function getContracts() public view returns (Entry[] memory results){
        Entry[] memory entries = new Entry[](nContracts);
        for (uint i = 0; i < nContracts; i++) {
            entries[i] = contracts[i];
        }
        return entries;
    }

    function addContract(string memory _name, string memory _ABI, address _addr) public onlyAdmin {
        contracts[nContracts] = Entry(_name, _ABI, _addr);
        nContracts++;
    }

    function removeContract(uint pageNo) public onlyAdmin {
        contracts[pageNo] = contracts[nContracts-1];
        delete contracts[nContracts-1];
        nContracts--;
    }


}