const Web3 = require("web3");
let web3 = new Web3('http://localhost:8545');
const contractAddr = "0x6cf41854E40DD4ba01BF6522Fb179fD2f34D7f5e";
const ABI = [{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"addr","type":"address"},{"indexed":false,"internalType":"bool","name":"success","type":"bool"}],"name":"ChangePermissions","type":"event","signature":"0x90d0dd1f71e3e0685bcf6dfe715debdc86f68dea2c066d066c5a81a1498af30e"},{"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_ABI","type":"string"},{"internalType":"address","name":"_addr","type":"address"}],"name":"addContract","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0xf7d8bfdc"},{"inputs":[],"name":"getContracts","outputs":[{"components":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"ABI","type":"string"},{"internalType":"address","name":"addr","type":"address"}],"internalType":"struct main.Entry[]","name":"results","type":"tuple[]"}],"stateMutability":"view","type":"function","constant":true,"signature":"0xc3a2a93a"},{"inputs":[],"name":"kill","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x41c0e1b5"},{"inputs":[{"internalType":"uint256","name":"pageNo","type":"uint256"}],"name":"removeContract","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x7cca3b06"},{"inputs":[{"internalType":"address","name":"addr","type":"address"}],"name":"setPM","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x46efe280"}];


const mainContract = new web3.eth.Contract(ABI, contractAddr);
let contracts = [];
let mainAccount = "0x8DB720Cf34b1b7c23E332c6F5B777b5a3Fe137d2";

async function getAccounts() {
    let accounts = [];
    await web3.eth.getAccounts().then(async (accs) => {
        accounts = accs;
        accs.forEach(async (acc) => {
            await web3.eth.getBalance(acc).then((bal) => {
                console.log(acc, " - ", bal)
            });
        });
    });
    return accounts;
}

async function getContracts() {
    await web3.eth.personal.unlockAccount(mainAccount, "", 0);
    await mainContract.methods.getContracts().call().then((Result) => {
        Result.forEach(contract => {
            contracts[contract[0]] = {name: contract[0], ABI: JSON.parse(contract[1]), address: contract[2].toString()};
        });
        //web3.eth.personal.lockAccount(mainAccount)

    });
}

async function createAccount() {
    return web3.eth.personal.newAccount("");
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

async function dataGeneration(cname, method, manSign = false) {
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
        await async function() {
            if (!manSign) {
                await contr.methods[method].apply(null, args).send({from: mainAccount, gasPrice: "0", value: "0"}).on("receipt", console.log);
            } else {
                console.log("manually signing...");
                let encodedTx = await (contr.methods[method].apply(null, args));
                let tx = {
                    gas: "100000",
                    gasPrice: "0",
                    to: addr,
                    data: encodedTx.encodeABI()
                };

                let signedTx = await web3.eth.accounts.signTransaction(tx, mainAccount.privateKey).catch((err) => {console.log("SignError:", err)});
                await web3.eth.sendSignedTransaction(signedTx.rawTransaction, (err, res) => {console.log(err, res)}).on('receipt', console.log).catch((err) => console.log(err));
                result = "Success";
            }
        }();
        return result;
    }
}

(async function () {

    let accs = await getAccounts();
    let cname, method;
    let newAcc = false;
    if (process.argv.length === 4) {
        cname = process.argv[2];
        method = process.argv[3];
    } else if (process.argv.length === 5) {
        cname = process.argv[2];
        method = process.argv[3];
        if (process.argv[4] === "new") {
            mainAccount = await createAccount();
        } else {
            mainAccount = accs[process.argv[4]];
        }
    } else {
        let readlineSync = require('readline-sync');
        cname = readlineSync.question('Enter cname ');
        method = readlineSync.question('Enter method ');
    }

    await getContracts();

    /*for (let i = 0; i < 10000; i++){
        await dataGeneration(cname, method);
    }*/
    
    dataGeneration(cname, method).then(() => {

        console.log("New balance:");
        let _ = getAccounts();
    });
})();

