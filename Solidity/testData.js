const Web3 = require("web3");
let web3 = new Web3('http://localhost:8545');
const contractAddr = "0x1A7fDBF6aC056851C4a6eC81Ec2DCf4E444a2c58";
const ABI = [{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"addr","type":"address"},{"indexed":false,"internalType":"bool","name":"success","type":"bool"}],"name":"ChangePermissions","type":"event","signature":"0x90d0dd1f71e3e0685bcf6dfe715debdc86f68dea2c066d066c5a81a1498af30e"},{"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_ABI","type":"string"},{"internalType":"address","name":"_addr","type":"address"}],"name":"addContract","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0xf7d8bfdc"},{"inputs":[],"name":"getContracts","outputs":[{"components":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"ABI","type":"string"},{"internalType":"address","name":"addr","type":"address"}],"internalType":"struct main.Entry[]","name":"results","type":"tuple[]"}],"stateMutability":"view","type":"function","constant":true,"signature":"0xc3a2a93a"},{"inputs":[],"name":"kill","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x41c0e1b5"},{"inputs":[{"internalType":"uint256","name":"pageNo","type":"uint256"}],"name":"removeContract","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x7cca3b06"},{"inputs":[{"internalType":"address","name":"addr","type":"address"}],"name":"setPM","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x46efe280"}];


const mainContract = new web3.eth.Contract(ABI, contractAddr);
let contracts = [];
const mainAccount = "0x8DB720Cf34b1b7c23E332c6F5B777b5a3Fe137d2";

async function getContracts() {
    await web3.eth.personal.unlockAccount(mainAccount, "", 0);
    await mainContract.methods.getContracts().call().then((Result) => {
        Result.forEach(contract => {
            contracts[contract[0]] = {name: contract[0], ABI: JSON.parse(contract[1]), address: contract[2].toString()};
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
                inputs.push([10, 2, 2021]);
            }
        }
    });
    return inputs;
}

async function dataGeneration(cname, method) {
    let contract = contracts[cname];
    let abi = contract.ABI;
    let addr = contract.address;
    console.log(addr);
    let contr = new web3.eth.Contract(abi, addr);
    let meth = abi.find(e => e.name === method);
    let args = structVals(meth.inputs, cname + "_" + method);
    console.log(args);
    console.log(JSON.stringify(args));
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
    await getContracts();
    if (process.argv.length === 4) {
        var cname = process.argv[2];
        var method = process.argv[3]
    } else {
        var readlineSync = require('readline-sync');
        var cname = readlineSync.question('Enter cname ');
        var method = readlineSync.question('Enter method ');
    }
    dataGeneration(cname, method);
})();

