// SPDX-License-Identifier: SPDX-License UNLICENSED

import "./Solidity/imports/Permissioned.sol";

contract adder is Permissioned {
    int private count = 0;

    function increment(int number) public {
        count += number;
    }

    function decrement(int number) public hasPermission("adderDecrement") {
        count -= number;
    }

    function getCount() public view returns (int result) {
        return count;
    }
}