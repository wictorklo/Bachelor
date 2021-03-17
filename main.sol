pragma solidity 0.8.0;

contract Main {
    uint256 public repairID = 0;
    uint public personID = 0;
    mapping(uint => repair) public repairs;

    address owner;

    modifier onlyBy(address _account) {
        require(msg.sender == _account);
        _;
    }

    struct repair {
        uint _repairID;
        uint _personID;
        string _error;
    }

    constructor() public {
        owner = msg.sender;
    }

    function addRepair(uint _personID, string memory _error) public onlyBy(owner) {
        incrementID();
        repairs[repairID] = repair(repairID, _personID, _error);
    }

    function fixedRepair(uint _repairID, uint _personID, string memory _error) public onlyBy(owner) {
        incrementID();
        repairs[repairID] = repair(_repairID, _personID, _error);
    }

    function incrementID() internal {
        repairID ++;
    }
}