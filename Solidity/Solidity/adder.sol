import "./Solidity/imports/Permissioned.sol";

contract adder is Permissioned {
    int private count = 0;

    function increment(int number) public hasPermission("adder.increment") {
        count += number;
    }

    function decrement(int number) public hasPermission("adder.decrement") {
        count -= number;
    }

    function getCount() public view hasPermission("adder.getCount") returns (int result) {
        return count;
    }
}