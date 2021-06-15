const Web3 = require("web3");
let web3 = new Web3('http://localhost:8545');
const contractAddr = "0x6b30dEA66357D77f80F15b90793259566DD9EbB8";
const ABI = [hej];
const mainContract = new web3.eth.Contract(ABI, contractAddr);
let contracts = [];
const mainAccount = "0x8DB720Cf34b1b7c23E332c6F5B777b5a3Fe137d2";

async function test() {
    await web3.eth.personal.unlockAccount(mainAccount, "", 0);
    await mainContract.methods.getContracts().call().then((Result) => {
        Result.forEach(contract => {
            contracts[contract[0]] = {name: contract[0], ABI: JSON.parse(contract[1]), address: contract[2]};
        });
        //web3.eth.personal.lockAccount(mainAccount)

    });
}

function structVals(comps, prefix) {
    let inputs = [];
    comps.forEach(comp => {
        if ('components' in comp && comp.internalType.endsWith("Date") === false) {
            inputs.push(structVals(comp.components, prefix + "_" + comp.name));
        } else {
            if (comp.type === "uint256" || comp.type === "int256") {
                inputs.push(Math.floor((Math.random() * 10)));
            } else if (comp.type === "string") {
                inputs.push(Math.random().toString(36).substring(2, 7));
            } else if (comp.type === "boolean") {
                inputs.push(Math.random() >= 0.5);
            } else {
                inputs.push([20, 4, 2020]);
            }
        }
    });
    return inputs;
}

async function dataGeneration(cname, method) {
    let contract = contracts[cname];
    let abi = contract.ABI;
    let addr = contract.address;
    let contr = new web3.eth.Contract(abi, addr);
    let meth = abi.find(e => e.name === method);
    let args = structVals(meth.inputs, cname + "_" + method);
    console.log(args);
    if (meth.stateMutability === "view" || method.stateMutability === "pure") {
        let result = "";
        await contr.methods[method].apply(null, args).call().then((response) => {
            console.log("Pure result:", result);
            result = response;
        });
        return result;
    } else {
        let result = "";
        await contr.methods[method].apply(null, args).send({from: mainAccount}).then((response) => {
            result = "Success!";
        });
        return result;
    }
}

(async function () {
    await test();
    if (process.argv.length === 4) {
        var cname = process.argv[2]
        var method = process.argv[3]
    } else {
        var readlineSync = require('readline-sync');
        var cname = readlineSync.question('Enter cname ');
        var method = readlineSync.question('Enter method ');
    }
    dataGeneration(cname, method);
})();

