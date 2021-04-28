const fs = require("fs");
const solc = require("solc");
const path = require("path");
const Web3 = require("web3");
const web3 = new Web3("http://localhost:8545");
const bytecode = fs.readFileSync("./build/main_sol_Main.bin");
const abi = JSON.parse(fs.readFileSync("./build/main_sol_Main.abi"));

const SOURCES = ["main", "adder", "clb", "tlb"];



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

const contracts = output.contracts;



var mainContract;
var accounts;
var myWalletAddress;

function replaceData(newAddr, newABI) {
    fs.readFile("public/index.html", 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        var newData = data.replace(/const contractAddr = "0x[\dA-Za-z]+";/g, 'const contractAddr = "'+newAddr+'";');
        newData = newData.replace(/const ABI = \[.+\];/g, 'const ABI = '+JSON.stringify(newABI)+';');

        fs.writeFile("index_BACKUP.html", data, 'utf8', function (err) {
            if (err) return console.log(err);
        });
        fs.writeFile("public/index.html", newData, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    });
}

(async function () {
    accounts = await web3.eth.getAccounts();
    myWalletAddress = accounts[0];

    const myContract = new web3.eth.Contract(contracts.main.main.abi);
    console.log(myContract);

    web3.eth.personal.unlockAccount(myWalletAddress, "", 10).then(() => {
        myContract.deploy({
            data: contracts.main.main.evm.bytecode.object.toString()
        }).send({
            from: myWalletAddress,
            gas: 5000000
        }).then((deployment) => {
            mainContract = new web3.eth.Contract(contracts.main.main.abi, deployment.options.address);
            console.log(deployment.options.address);
            autoDeploy();
            replaceData(deployment.options.address, contracts.main.main.abi);
        }).catch((err) => {
            console.error("Initial setup: " + err);
        })
    })
})();

async function autoDeploy () {

    try {
        await fs.readdir("./build", (err, files) => {
            SOURCES.forEach(name => {
                if (name === "main")
                    return;

                let bc = contracts[name][name].evm.bytecode.object;
                let rawABI = JSON.stringify(contracts[name][name].abi);
                let ABI = contracts[name][name].abi;
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
                        console.error("DeployError: " + err);
                    })
                })
            });
        });
    } catch (err) {
        console.error(err);
    }
}
