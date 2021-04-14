contract adder {
    int private count = 0;

    function increment(int number) public {
        count += number;
    }

    function decrement(int number) public {
        count -= number;
    }

    function getCount() public view returns (int result) {
        return count;
    }
}