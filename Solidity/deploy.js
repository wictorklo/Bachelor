const fs = require("fs");
const solc = require("solc");
const path = require("path");
const Web3 = require("web3");
const web3 = new Web3("http://localhost:8545");
const bytecode = fs.readFileSync("./build/main_sol_Main.bin");
const abi = JSON.parse(fs.readFileSync("./build/main_sol_Main.abi"));

const SOURCES = ["main", "PermissionManager", "adder", "clb"];



//const src = fs.readFileSync(mainPath, "UTF-8");

let input = {
    language: "Solidity",
    sources: {
    },
    settings: {
        optimizer: {
            enabled: true,
            runs: 200
        },
        outputSelection: {
            "*": {
                "*": ["*"],
            },
        },
    },
};

SOURCES.forEach(src =>
    input.sources[src] = {content: fs.readFileSync("./Solidity/"+src+".sol", "UTF-8")}
    );

function findImports(path) {
    return {
        contents: fs.readFileSync(path, "UTF-8")
    }
}


const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

const contracts = output.contracts;



let mainContract;
let accounts;
let myWalletAddress;
let PMAddress;

function replaceData(newAddr, newABI) {
    fs.readFile("../Website/server.js", 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        var newData = data.replace(/const contractAddr = "0x[\dA-Za-z]+";/g, 'const contractAddr = "'+newAddr+'";');
        newData = newData.replace(/const ABI = \[.+\];/g, 'const ABI = '+JSON.stringify(newABI)+';');

        /*fs.writeFile("index_BACKUP.html", data, 'utf8', function (err) {
            if (err) return console.log(err);
        });*/
        fs.writeFile("../Website/server.js", newData, 'utf8', function (err) {
            if (err) return console.log("ReplaceData error: " + err);
        });
    });
    fs.readFile("testData.js", 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        var newData = data.replace(/const contractAddr = "0x[\dA-Za-z]+";/g, 'const contractAddr = "'+newAddr+'";');
        newData = newData.replace(/const ABI = \[.+\];/g, 'const ABI = '+JSON.stringify(newABI)+';');

        /*fs.writeFile("index_BACKUP.html", data, 'utf8', function (err) {
            if (err) return console.log(err);
        });*/
        fs.writeFile("testData.js", newData, 'utf8', function (err) {
            if (err) return console.log("ReplaceData error: " + err);
        });
    });
}

(async function () {
    accounts = await web3.eth.getAccounts();
    myWalletAddress = accounts[0];
    web3.eth.getBalance(myWalletAddress).then((res) => console.log(res));

    const myContract = new web3.eth.Contract(contracts.main.main.abi);
    const PMContract = new web3.eth.Contract(contracts.PermissionManager.PermissionManager.abi);

    web3.eth.personal.unlockAccount(myWalletAddress, "", 10).then(() => {
        myContract.deploy({
            data: contracts.main.main.evm.bytecode.object.toString()
        }).send({
            from: myWalletAddress,
            gasPrice: 0
        }).then((mainDeployment) => {
            PMContract.deploy({
                data: contracts.PermissionManager.PermissionManager.evm.bytecode.object.toString()
            }).send({
                from: myWalletAddress,
                gasPrice: 0
            }).then((PMDeployment) => {
                PMAddress = PMDeployment.options.address;
                mainContract = new web3.eth.Contract(contracts.main.main.abi, mainDeployment.options.address);
                mainContract.methods.setPM(PMAddress).send({
                    from: myWalletAddress,
                    gasPrice: 0
                });
                mainContract.methods.addContract("PermissionManager", JSON.stringify(contracts.PermissionManager.PermissionManager.abi), PMDeployment.options.address).send({
                    from: myWalletAddress,
                    gasPrice: 0
                });
                console.log(mainDeployment.options.address);
                autoDeploy();
                replaceData(mainDeployment.options.address, contracts.main.main.abi);
            }).then(() => {
                let contr = new web3.eth.Contract(contracts.PermissionManager.PermissionManager.abi, PMAddress);
                let ADMINS = ["0x91dDFdB4BD66427eCDB4025f987E0FC682A487EB"];
                let ADMINPERMS = ["adder.increment"];
                let CERTS = [];
                let CERTPERMS = [];
                let WORKER = [];
                ADMINS.forEach((addr) => {
                    ADMINPERMS.forEach((perm) => {
                        contr.methods.addAccountCert(addr, perm).send({from: myWalletAddress});
                    })
                })
            })
        }).catch((err) => {
            console.error("Initial setup: " + err);
        })
    })
})();

async function autoDeploy () {
    console.log("Main and PM done. Deploying contracts...");
    try {
        await fs.readdir("./build", (err, files) => {
            SOURCES.forEach(name => {
                if (name === "main" || name === "PermissionManager")
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
                        gasPrice: 0
                    }).then((deployment) => {
                        mainContract.methods.addContract(name, rawABI, deployment.options.address).send({
                            from: myWalletAddress,
                            gasPrice: 0
                        });
                        let newContract = new web3.eth.Contract(ABI, deployment.options.address);
                        newContract.methods.setPM(PMAddress).send({
                            from: myWalletAddress,
                            gasPrice: 0
                        });
                    }).catch((err) => {
                        console.error("DeployError: " + err);
                    })
                })
            });
        });
    } catch (err) {
        console.error("Deploy contract error (" + name + ") :" + err);
    }
}

