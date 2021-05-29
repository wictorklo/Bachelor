// SPDX-License-Identifier: SPDX-License UNLICENSED
pragma solidity ^0.8.0;

contract ProductInventory{

    struct Product{
        uint ID; //always unique to the product
        string itemName;
        string itemDescription;
        uint qty; //available qty
        uint minQty; //minimum qty before reorder
        string location;
        UoM UnitOfMeasure;
        Status status;
        bool isValue;
    }

    //limiting unit of measure to specifics
    enum UoM{pcs, ea, l}
    enum Status{Available, Ordering, OutOfStock, Removed}

    //who's the warehouse manager
    address owner;

    mapping(bytes32 => Product) Inventory;

    //Events
    event InformManager(uint ID, uint qty, address requestor);
    event ShipOrder(uint ID, uint qty, address requestor);

    //modifier
    modifier onlyBy(address _account) {
        require(msg.sender == _account);
        _;
    }

    constructor() public {
        owner = msg.sender;
    }

    //This is the constructor
    // function ProductInventory()  public {
    //    owner = msg.sender;
    //}

    //this function will add a product to the Inventory
    function AddProduct(uint _ID,string memory _name, string memory _description, uint _qty, string memory _location, UoM uom) public onlyBy(owner){
        bytes32 hash = keccak256(abi.encodePacked(_ID));
        if (Inventory[hash].isValue) {
            revert();
        }
        else {
            Inventory[hash] = Product(_ID, _name, _description, _qty, 0, _location, uom, Status.Available, true);
        }
    }

    //this function will Remove a product
    function RemoveProduct(uint _ID) public view onlyBy(owner) {
        bytes32 hash = keccak256(abi.encodePacked(_ID));
        Product memory uprod = Inventory[hash];
        uprod.status = Status.Removed; //set the status to Removed
        uprod.qty = 0; //set the qty to zero
        uprod.isValue = false;
    }

    //this function will add to the qty of a product by the owner
    function ReplenishStock(uint _ID, uint _qty) public onlyBy(owner) {
        bytes32 hash = keccak256(abi.encodePacked(_ID));
        Inventory[hash].qty += _qty;
    }

    //This function will allow any user to Order
    function Order(uint _ID, uint _qty) public {
        bytes32 hash = keccak256(abi.encodePacked(_ID));
        if (QtyExists(hash,_qty)) {
            Inventory[hash].qty -= _qty; //reduce or reserve qty for next order
            emit ShipOrder(_ID, _qty, msg.sender); //inform someone of the shipment
        }
        else {
            //Qty is not enough so revert remaining funds;
            emit InformManager(_ID, _qty, msg.sender); //inform the warehouse manager
            revert();
        }
    }

    //This function checks if the required quantity is available
    function QtyExists(bytes32 _ID, uint _qty) private view returns (bool) {
        Product memory uprod = Inventory[_ID];
        if ((uprod.qty >= _qty)&&(uprod.status != Status.Removed))
            return true;
        return false;
    }

}