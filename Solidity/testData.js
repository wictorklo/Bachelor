const Web3 = require("web3");
let web3 = new Web3('http://localhost:8545');
const contractAddr = "0xECF130fA947585b3adB5297eac946f83bE9E8267";
const ABI = [{
    "inputs": [{"internalType": "string", "name": "_name", "type": "string"}, {
        "internalType": "string",
        "name": "_API",
        "type": "string"
    }, {"internalType": "string", "name": "_addr", "type": "string"}],
    "name": "addContract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x6c2bc72d"
}, {
    "inputs": [],
    "name": "getContracts",
    "outputs": [{
        "components": [{"internalType": "string", "name": "name", "type": "string"}, {
            "internalType": "string",
            "name": "API",
            "type": "string"
        }, {"internalType": "string", "name": "addr", "type": "string"}],
        "internalType": "struct main.Entry[]",
        "name": "results",
        "type": "tuple[]"
    }],
    "stateMutability": "view",
    "type": "function",
    "constant": true,
    "signature": "0xc3a2a93a"
}, {
    "inputs": [{"internalType": "uint256", "name": "index", "type": "uint256"}],
    "name": "removeContract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x7cca3b06"
}];


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
                inputs.push([20, 5, 2021]);
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

