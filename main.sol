pragma solidity ^0.8.0;

contract Main {

    struct Entry {
        string name;
        string API;
        string addr;
    }

    mapping (uint => Entry) contracts;

    uint nContracts = 0;





    function getContracts() public view returns (Entry[] memory){
        Entry[] memory entries = new Entry[](nContracts);
        for (uint i = 0; i < nContracts; i++){
            entries[i] = contracts[i];
        }
        return entries;
    }

    function addContract(string memory _name, string memory _API, string memory _addr) public {
        contracts[nContracts] = Entry(_name, _API, _addr);
        nContracts++;
    }

    function removeContract(uint index) public {
        contracts[index] = contracts[nContracts];
        delete contracts[index];
        nContracts--;
    }


}