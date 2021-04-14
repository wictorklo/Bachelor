const fs = require("fs");
const solc = require("solc");
const path = require("path");
const Web3 = require("web3");
const web3 = new Web3("http://localhost:8545");
const bytecode = fs.readFileSync("./build/main_sol_Main.bin");
const abi = JSON.parse(fs.readFileSync("./build/main_sol_Main.abi"));

const SOURCES = ["main", "adder"];

const mainPath = path.resolve(__dirname, "Solidity", "main.sol");
console.log(mainPath);
//const src = fs.readFileSync(mainPath, "UTF-8");

let input = {
    language: "Solidity",
    sources: {
    },
    settings: {
        outputSelection: {
            "*": {
                "*": ["*"],
            },
        },
    },
};

SOURCES.forEach(src => input.sources[src] = {content: fs.readFileSync("./Solidity/"+src+".sol", "UTF-8")});

function findImports(path) {
    return {
        contents: fs.readFileSync(path, "UTF-8")
    }
}


const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

console.log(output)
//console.log(output.contracts.main.main.evm.bytecode.object);
const contracts = output.contracts;
//console.log(contracts)


var mainContract;
web3.eth.getChainId().then((res) => console.log);
var accounts;
var myWalletAddress;

async function setupMain () {
    accounts = await web3.eth.getAccounts();
    myWalletAddress = accounts[0];

    const myContract = new web3.eth.Contract(contracts.main.main.abi);

    web3.eth.personal.unlockAccount(myWalletAddress, "", 10).then(() => {
        myContract.deploy({
            data: bytecode.toString()
        }).send({
            from: myWalletAddress,
            gas: 5000000
        }).then((deployment) => {
            mainContract = new web3.eth.Contract(contracts.main.main.abi, deployment.options.address);
            console.log(deployment.options.address);
        }).catch((err) => {
            console.error(err);
        })
    })
}

(async function () {
    await setupMain();
    try {
        await fs.readdir("./build", (err, files) => {
            let names = new Set();
            contracts.forEach(name => {
                let bc = contracts.name.name.evm.bytecode;
                let rawABI = JSON.stringify(contracts.name.name.abi);
                let ABI = contracts.name.name.abi;
                const myContract = new web3.eth.Contract(ABI);
                web3.eth.personal.unlockAccount(myWalletAddress, "", 10).then(() => {
                    myContract.deploy({
                        data: bc.toString()
                    }).send({
                        from: myWalletAddress,
                        gas: 5000000
                    }).then((deployment) => {
                        mainContract.methods.addContract(name, rawABI, deployment.options.address).send({
                            from: myWalletAddress,
                            gasPrice: 1
                        });
                    }).catch((err) => {
                        console.error(err);
                    })
                })
            });
        });
    } catch (err) {
        console.error(err);
    }
})();
