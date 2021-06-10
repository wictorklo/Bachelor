const fs = require("fs");
const solc = require("solc");
const path = require("path");
const Web3 = require("web3");
const web3 = new Web3("http://localhost:8545");
const bytecode = fs.readFileSync("./build/main_sol_Main.bin");
const abi = JSON.parse(fs.readFileSync("./build/main_sol_Main.abi"));

const SOURCES = ["main", "adder", "tlb"];



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
}

(async function () {
    accounts = await web3.eth.getAccounts();
    myWalletAddress = accounts[0];
    web3.eth.getBalance(myWalletAddress).then((res) => console.log(res));

    const myContract = new web3.eth.Contract(contracts.main.main.abi);

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
    console.log("Main done. Deploying contracts...")
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
                        gas: 50000000
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
        console.error("Deploy contract error (" + name + ") :" + err);
    }
}


tlb, [{
    "inputs": [{
        "components": [{
            "components": [{
                "internalType": "uint256",
                "name": "ACType",
                "type": "uint256"
            }, {"internalType": "uint256", "name": "ACNo", "type": "uint256"}],
            "internalType": "struct tlb.Aircraft",
            "name": "aircraft",
            "type": "tuple"
        }, {"internalType": "uint256", "name": "flightNo", "type": "uint256"}, {
            "internalType": "string",
            "name": "flightFrom",
            "type": "string"
        }, {"internalType": "string", "name": "flightTo", "type": "string"}, {
            "components": [{
                "internalType": "uint256",
                "name": "day",
                "type": "uint256"
            }, {"internalType": "uint256", "name": "month", "type": "uint256"}, {
                "internalType": "uint256",
                "name": "year",
                "type": "uint256"
            }], "internalType": "struct tlb.Date", "name": "reportDate", "type": "tuple"
        }, {
            "components": [{
                "internalType": "uint256",
                "name": "engineNo",
                "type": "uint256"
            }, {"internalType": "uint256", "name": "addedQts", "type": "uint256"}, {
                "internalType": "string",
                "name": "finalQts",
                "type": "string"
            }], "internalType": "struct tlb.EngineOil", "name": "engineOil", "type": "tuple"
        }, {
            "components": [{
                "internalType": "uint256",
                "name": "addedOil",
                "type": "uint256"
            }, {"internalType": "string", "name": "finalOil", "type": "string"}, {
                "internalType": "uint256",
                "name": "hour",
                "type": "uint256"
            }, {"internalType": "uint256", "name": "cycles", "type": "uint256"}],
            "internalType": "struct tlb.APU",
            "name": "apu",
            "type": "tuple"
        }, {
            "components": [{"internalType": "uint256", "name": "Sys1BL", "type": "uint256"}, {
                "internalType": "uint256",
                "name": "Sys2GC",
                "type": "uint256"
            }, {"internalType": "uint256", "name": "Sys3YR", "type": "uint256"}, {
                "internalType": "uint256",
                "name": "Sys4",
                "type": "uint256"
            }], "internalType": "struct tlb.HydFluid", "name": "hydFluid", "type": "tuple"
        }, {
            "components": [{"internalType": "string", "name": "reports", "type": "string"}, {
                "internalType": "uint256",
                "name": "reportIdNo",
                "type": "uint256"
            }], "internalType": "struct tlb.Report", "name": "report", "type": "tuple"
        }], "internalType": "struct tlb.AllReportData", "name": "_allReportData", "type": "tuple"
    }], "name": "addTLB", "outputs": [], "stateMutability": "nonpayable", "type": "function"
}, {
    "inputs": [], "name": "getSignedData", "outputs": [{
        "components": [{
            "components": [{
                "components": [{
                    "internalType": "uint256",
                    "name": "ACType",
                    "type": "uint256"
                }, {"internalType": "uint256", "name": "ACNo", "type": "uint256"}],
                "internalType": "struct tlb.Aircraft",
                "name": "aircraft",
                "type": "tuple"
            }, {"internalType": "uint256", "name": "flightNo", "type": "uint256"}, {
                "internalType": "string",
                "name": "flightFrom",
                "type": "string"
            }, {
                "internalType": "string",
                "name": "flightTo",
                "type": "string"
            }, {
                "components": [{
                    "internalType": "uint256",
                    "name": "day",
                    "type": "uint256"
                }, {"internalType": "uint256", "name": "month", "type": "uint256"}, {
                    "internalType": "uint256",
                    "name": "year",
                    "type": "uint256"
                }], "internalType": "struct tlb.Date", "name": "reportDate", "type": "tuple"
            }, {
                "components": [{
                    "internalType": "uint256",
                    "name": "engineNo",
                    "type": "uint256"
                }, {"internalType": "uint256", "name": "addedQts", "type": "uint256"}, {
                    "internalType": "string",
                    "name": "finalQts",
                    "type": "string"
                }], "internalType": "struct tlb.EngineOil", "name": "engineOil", "type": "tuple"
            }, {
                "components": [{
                    "internalType": "uint256",
                    "name": "addedOil",
                    "type": "uint256"
                }, {"internalType": "string", "name": "finalOil", "type": "string"}, {
                    "internalType": "uint256",
                    "name": "hour",
                    "type": "uint256"
                }, {"internalType": "uint256", "name": "cycles", "type": "uint256"}],
                "internalType": "struct tlb.APU",
                "name": "apu",
                "type": "tuple"
            }, {
                "components": [{
                    "internalType": "uint256",
                    "name": "Sys1BL",
                    "type": "uint256"
                }, {"internalType": "uint256", "name": "Sys2GC", "type": "uint256"}, {
                    "internalType": "uint256",
                    "name": "Sys3YR",
                    "type": "uint256"
                }, {"internalType": "uint256", "name": "Sys4", "type": "uint256"}],
                "internalType": "struct tlb.HydFluid",
                "name": "hydFluid",
                "type": "tuple"
            }, {
                "components": [{
                    "internalType": "string",
                    "name": "reports",
                    "type": "string"
                }, {"internalType": "uint256", "name": "reportIdNo", "type": "uint256"}],
                "internalType": "struct tlb.Report",
                "name": "report",
                "type": "tuple"
            }], "internalType": "struct tlb.AllReportData", "name": "allReportData", "type": "tuple"
        }, {
            "components": [{
                "components": [{
                    "internalType": "uint256",
                    "name": "day",
                    "type": "uint256"
                }, {"internalType": "uint256", "name": "month", "type": "uint256"}, {
                    "internalType": "uint256",
                    "name": "year",
                    "type": "uint256"
                }], "internalType": "struct tlb.Date", "name": "actionDate", "type": "tuple"
            }, {
                "components": [{
                    "internalType": "string",
                    "name": "actions",
                    "type": "string"
                }, {"internalType": "uint256", "name": "actionIdNo", "type": "uint256"}],
                "internalType": "struct tlb.Action",
                "name": "action",
                "type": "tuple"
            }, {
                "components": [{"internalType": "bool", "name": "Cdccl", "type": "bool"}, {
                    "internalType": "bool",
                    "name": "FcsRepair",
                    "type": "bool"
                }, {"internalType": "bool", "name": "Rii", "type": "bool"}, {
                    "internalType": "enum tlb.MelCat",
                    "name": "MelCats",
                    "type": "uint8"
                }, {"internalType": "bool", "name": "M", "type": "bool"}, {
                    "internalType": "bool",
                    "name": "O",
                    "type": "bool"
                }, {"internalType": "bool", "name": "notifyDispatch", "type": "bool"}, {
                    "internalType": "uint256",
                    "name": "licenseNo",
                    "type": "uint256"
                }, {
                    "components": [{
                        "internalType": "uint256",
                        "name": "day",
                        "type": "uint256"
                    }, {"internalType": "uint256", "name": "month", "type": "uint256"}, {
                        "internalType": "uint256",
                        "name": "year",
                        "type": "uint256"
                    }], "internalType": "struct tlb.Date", "name": "actionDate", "type": "tuple"
                }], "internalType": "struct tlb.Status", "name": "status", "type": "tuple"
            }, {
                "components": [{
                    "internalType": "uint256",
                    "name": "item",
                    "type": "uint256"
                }, {"internalType": "string", "name": "nomenclature", "type": "string"}, {
                    "internalType": "uint256",
                    "name": "posistion",
                    "type": "uint256"
                }, {
                    "components": [{
                        "internalType": "uint256",
                        "name": "partOff",
                        "type": "uint256"
                    }, {"internalType": "uint256", "name": "partOn", "type": "uint256"}],
                    "internalType": "struct tlb.PartNo",
                    "name": "partNo",
                    "type": "tuple"
                }, {
                    "components": [{
                        "internalType": "uint256",
                        "name": "serialOff",
                        "type": "uint256"
                    }, {"internalType": "uint256", "name": "serialOn", "type": "uint256"}],
                    "internalType": "struct tlb.SerialNo",
                    "name": "serialNo",
                    "type": "tuple"
                }], "internalType": "struct tlb.Parts", "name": "parts", "type": "tuple"
            }, {
                "internalType": "enum tlb.Category",
                "name": "category",
                "type": "uint8"
            }, {
                "components": [{
                    "internalType": "uint256",
                    "name": "day",
                    "type": "uint256"
                }, {"internalType": "uint256", "name": "month", "type": "uint256"}, {
                    "internalType": "uint256",
                    "name": "year",
                    "type": "uint256"
                }], "internalType": "struct tlb.Date", "name": "expiredDate", "type": "tuple"
            }, {
                "internalType": "bool",
                "name": "etopsFlight",
                "type": "bool"
            }, {
                "components": [{
                    "internalType": "uint256",
                    "name": "hour",
                    "type": "uint256"
                }, {"internalType": "uint256", "name": "minute", "type": "uint256"}],
                "internalType": "struct tlb.FlightTime",
                "name": "flightTime",
                "type": "tuple"
            }, {"internalType": "string", "name": "maintCheck", "type": "string"}, {
                "internalType": "uint256",
                "name": "licenceNo",
                "type": "uint256"
            }, {"internalType": "uint256", "name": "station", "type": "uint256"}, {
                "internalType": "bool",
                "name": "CaaCertification",
                "type": "bool"
            }], "internalType": "struct tlb.AllActionData", "name": "allActionData", "type": "tuple"
        }, {
            "internalType": "address",
            "name": "employeeReportSignature",
            "type": "address"
        }, {
            "internalType": "address",
            "name": "employeeActionSignature",
            "type": "address"
        }, {"internalType": "address", "name": "managerSignature", "type": "address"}],
        "internalType": "struct tlb.TLB[]",
        "name": "",
        "type": "tuple[]"
    }], "stateMutability": "view", "type": "function"
}, {
    "inputs": [], "name": "getTLB", "outputs": [{
        "components": [{
            "components": [{
                "components": [{
                    "internalType": "uint256",
                    "name": "ACType",
                    "type": "uint256"
                }, {"internalType": "uint256", "name": "ACNo", "type": "uint256"}],
                "internalType": "struct tlb.Aircraft",
                "name": "aircraft",
                "type": "tuple"
            }, {"internalType": "uint256", "name": "flightNo", "type": "uint256"}, {
                "internalType": "string",
                "name": "flightFrom",
                "type": "string"
            }, {
                "internalType": "string",
                "name": "flightTo",
                "type": "string"
            }, {
                "components": [{
                    "internalType": "uint256",
                    "name": "day",
                    "type": "uint256"
                }, {"internalType": "uint256", "name": "month", "type": "uint256"}, {
                    "internalType": "uint256",
                    "name": "year",
                    "type": "uint256"
                }], "internalType": "struct tlb.Date", "name": "reportDate", "type": "tuple"
            }, {
                "components": [{
                    "internalType": "uint256",
                    "name": "engineNo",
                    "type": "uint256"
                }, {"internalType": "uint256", "name": "addedQts", "type": "uint256"}, {
                    "internalType": "string",
                    "name": "finalQts",
                    "type": "string"
                }], "internalType": "struct tlb.EngineOil", "name": "engineOil", "type": "tuple"
            }, {
                "components": [{
                    "internalType": "uint256",
                    "name": "addedOil",
                    "type": "uint256"
                }, {"internalType": "string", "name": "finalOil", "type": "string"}, {
                    "internalType": "uint256",
                    "name": "hour",
                    "type": "uint256"
                }, {"internalType": "uint256", "name": "cycles", "type": "uint256"}],
                "internalType": "struct tlb.APU",
                "name": "apu",
                "type": "tuple"
            }, {
                "components": [{
                    "internalType": "uint256",
                    "name": "Sys1BL",
                    "type": "uint256"
                }, {"internalType": "uint256", "name": "Sys2GC", "type": "uint256"}, {
                    "internalType": "uint256",
                    "name": "Sys3YR",
                    "type": "uint256"
                }, {"internalType": "uint256", "name": "Sys4", "type": "uint256"}],
                "internalType": "struct tlb.HydFluid",
                "name": "hydFluid",
                "type": "tuple"
            }, {
                "components": [{
                    "internalType": "string",
                    "name": "reports",
                    "type": "string"
                }, {"internalType": "uint256", "name": "reportIdNo", "type": "uint256"}],
                "internalType": "struct tlb.Report",
                "name": "report",
                "type": "tuple"
            }], "internalType": "struct tlb.AllReportData", "name": "allReportData", "type": "tuple"
        }, {
            "components": [{
                "components": [{
                    "internalType": "uint256",
                    "name": "day",
                    "type": "uint256"
                }, {"internalType": "uint256", "name": "month", "type": "uint256"}, {
                    "internalType": "uint256",
                    "name": "year",
                    "type": "uint256"
                }], "internalType": "struct tlb.Date", "name": "actionDate", "type": "tuple"
            }, {
                "components": [{
                    "internalType": "string",
                    "name": "actions",
                    "type": "string"
                }, {"internalType": "uint256", "name": "actionIdNo", "type": "uint256"}],
                "internalType": "struct tlb.Action",
                "name": "action",
                "type": "tuple"
            }, {
                "components": [{"internalType": "bool", "name": "Cdccl", "type": "bool"}, {
                    "internalType": "bool",
                    "name": "FcsRepair",
                    "type": "bool"
                }, {"internalType": "bool", "name": "Rii", "type": "bool"}, {
                    "internalType": "enum tlb.MelCat",
                    "name": "MelCats",
                    "type": "uint8"
                }, {"internalType": "bool", "name": "M", "type": "bool"}, {
                    "internalType": "bool",
                    "name": "O",
                    "type": "bool"
                }, {"internalType": "bool", "name": "notifyDispatch", "type": "bool"}, {
                    "internalType": "uint256",
                    "name": "licenseNo",
                    "type": "uint256"
                }, {
                    "components": [{
                        "internalType": "uint256",
                        "name": "day",
                        "type": "uint256"
                    }, {"internalType": "uint256", "name": "month", "type": "uint256"}, {
                        "internalType": "uint256",
                        "name": "year",
                        "type": "uint256"
                    }], "internalType": "struct tlb.Date", "name": "actionDate", "type": "tuple"
                }], "internalType": "struct tlb.Status", "name": "status", "type": "tuple"
            }, {
                "components": [{
                    "internalType": "uint256",
                    "name": "item",
                    "type": "uint256"
                }, {"internalType": "string", "name": "nomenclature", "type": "string"}, {
                    "internalType": "uint256",
                    "name": "posistion",
                    "type": "uint256"
                }, {
                    "components": [{
                        "internalType": "uint256",
                        "name": "partOff",
                        "type": "uint256"
                    }, {"internalType": "uint256", "name": "partOn", "type": "uint256"}],
                    "internalType": "struct tlb.PartNo",
                    "name": "partNo",
                    "type": "tuple"
                }, {
                    "components": [{
                        "internalType": "uint256",
                        "name": "serialOff",
                        "type": "uint256"
                    }, {"internalType": "uint256", "name": "serialOn", "type": "uint256"}],
                    "internalType": "struct tlb.SerialNo",
                    "name": "serialNo",
                    "type": "tuple"
                }], "internalType": "struct tlb.Parts", "name": "parts", "type": "tuple"
            }, {
                "internalType": "enum tlb.Category",
                "name": "category",
                "type": "uint8"
            }, {
                "components": [{
                    "internalType": "uint256",
                    "name": "day",
                    "type": "uint256"
                }, {"internalType": "uint256", "name": "month", "type": "uint256"}, {
                    "internalType": "uint256",
                    "name": "year",
                    "type": "uint256"
                }], "internalType": "struct tlb.Date", "name": "expiredDate", "type": "tuple"
            }, {
                "internalType": "bool",
                "name": "etopsFlight",
                "type": "bool"
            }, {
                "components": [{
                    "internalType": "uint256",
                    "name": "hour",
                    "type": "uint256"
                }, {"internalType": "uint256", "name": "minute", "type": "uint256"}],
                "internalType": "struct tlb.FlightTime",
                "name": "flightTime",
                "type": "tuple"
            }, {"internalType": "string", "name": "maintCheck", "type": "string"}, {
                "internalType": "uint256",
                "name": "licenceNo",
                "type": "uint256"
            }, {"internalType": "uint256", "name": "station", "type": "uint256"}, {
                "internalType": "bool",
                "name": "CaaCertification",
                "type": "bool"
            }], "internalType": "struct tlb.AllActionData", "name": "allActionData", "type": "tuple"
        }, {
            "internalType": "address",
            "name": "employeeReportSignature",
            "type": "address"
        }, {
            "internalType": "address",
            "name": "employeeActionSignature",
            "type": "address"
        }, {"internalType": "address", "name": "managerSignature", "type": "address"}],
        "internalType": "struct tlb.TLB[]",
        "name": "",
        "type": "tuple[]"
    }], "stateMutability": "view", "type": "function"
}, {
    "inputs": [], "name": "getUnsignedData", "outputs": [{
        "components": [{
            "components": [{
                "components": [{
                    "internalType": "uint256",
                    "name": "ACType",
                    "type": "uint256"
                }, {"internalType": "uint256", "name": "ACNo", "type": "uint256"}],
                "internalType": "struct tlb.Aircraft",
                "name": "aircraft",
                "type": "tuple"
            }, {"internalType": "uint256", "name": "flightNo", "type": "uint256"}, {
                "internalType": "string",
                "name": "flightFrom",
                "type": "string"
            }, {
                "internalType": "string",
                "name": "flightTo",
                "type": "string"
            }, {
                "components": [{
                    "internalType": "uint256",
                    "name": "day",
                    "type": "uint256"
                }, {"internalType": "uint256", "name": "month", "type": "uint256"}, {
                    "internalType": "uint256",
                    "name": "year",
                    "type": "uint256"
                }], "internalType": "struct tlb.Date", "name": "reportDate", "type": "tuple"
            }, {
                "components": [{
                    "internalType": "uint256",
                    "name": "engineNo",
                    "type": "uint256"
                }, {"internalType": "uint256", "name": "addedQts", "type": "uint256"}, {
                    "internalType": "string",
                    "name": "finalQts",
                    "type": "string"
                }], "internalType": "struct tlb.EngineOil", "name": "engineOil", "type": "tuple"
            }, {
                "components": [{
                    "internalType": "uint256",
                    "name": "addedOil",
                    "type": "uint256"
                }, {"internalType": "string", "name": "finalOil", "type": "string"}, {
                    "internalType": "uint256",
                    "name": "hour",
                    "type": "uint256"
                }, {"internalType": "uint256", "name": "cycles", "type": "uint256"}],
                "internalType": "struct tlb.APU",
                "name": "apu",
                "type": "tuple"
            }, {
                "components": [{
                    "internalType": "uint256",
                    "name": "Sys1BL",
                    "type": "uint256"
                }, {"internalType": "uint256", "name": "Sys2GC", "type": "uint256"}, {
                    "internalType": "uint256",
                    "name": "Sys3YR",
                    "type": "uint256"
                }, {"internalType": "uint256", "name": "Sys4", "type": "uint256"}],
                "internalType": "struct tlb.HydFluid",
                "name": "hydFluid",
                "type": "tuple"
            }, {
                "components": [{
                    "internalType": "string",
                    "name": "reports",
                    "type": "string"
                }, {"internalType": "uint256", "name": "reportIdNo", "type": "uint256"}],
                "internalType": "struct tlb.Report",
                "name": "report",
                "type": "tuple"
            }], "internalType": "struct tlb.AllReportData", "name": "allReportData", "type": "tuple"
        }, {
            "components": [{
                "components": [{
                    "internalType": "uint256",
                    "name": "day",
                    "type": "uint256"
                }, {"internalType": "uint256", "name": "month", "type": "uint256"}, {
                    "internalType": "uint256",
                    "name": "year",
                    "type": "uint256"
                }], "internalType": "struct tlb.Date", "name": "actionDate", "type": "tuple"
            }, {
                "components": [{
                    "internalType": "string",
                    "name": "actions",
                    "type": "string"
                }, {"internalType": "uint256", "name": "actionIdNo", "type": "uint256"}],
                "internalType": "struct tlb.Action",
                "name": "action",
                "type": "tuple"
            }, {
                "components": [{"internalType": "bool", "name": "Cdccl", "type": "bool"}, {
                    "internalType": "bool",
                    "name": "FcsRepair",
                    "type": "bool"
                }, {"internalType": "bool", "name": "Rii", "type": "bool"}, {
                    "internalType": "enum tlb.MelCat",
                    "name": "MelCats",
                    "type": "uint8"
                }, {"internalType": "bool", "name": "M", "type": "bool"}, {
                    "internalType": "bool",
                    "name": "O",
                    "type": "bool"
                }, {"internalType": "bool", "name": "notifyDispatch", "type": "bool"}, {
                    "internalType": "uint256",
                    "name": "licenseNo",
                    "type": "uint256"
                }, {
                    "components": [{
                        "internalType": "uint256",
                        "name": "day",
                        "type": "uint256"
                    }, {"internalType": "uint256", "name": "month", "type": "uint256"}, {
                        "internalType": "uint256",
                        "name": "year",
                        "type": "uint256"
                    }], "internalType": "struct tlb.Date", "name": "actionDate", "type": "tuple"
                }], "internalType": "struct tlb.Status", "name": "status", "type": "tuple"
            }, {
                "components": [{
                    "internalType": "uint256",
                    "name": "item",
                    "type": "uint256"
                }, {"internalType": "string", "name": "nomenclature", "type": "string"}, {
                    "internalType": "uint256",
                    "name": "posistion",
                    "type": "uint256"
                }, {
                    "components": [{
                        "internalType": "uint256",
                        "name": "partOff",
                        "type": "uint256"
                    }, {"internalType": "uint256", "name": "partOn", "type": "uint256"}],
                    "internalType": "struct tlb.PartNo",
                    "name": "partNo",
                    "type": "tuple"
                }, {
                    "components": [{
                        "internalType": "uint256",
                        "name": "serialOff",
                        "type": "uint256"
                    }, {"internalType": "uint256", "name": "serialOn", "type": "uint256"}],
                    "internalType": "struct tlb.SerialNo",
                    "name": "serialNo",
                    "type": "tuple"
                }], "internalType": "struct tlb.Parts", "name": "parts", "type": "tuple"
            }, {
                "internalType": "enum tlb.Category",
                "name": "category",
                "type": "uint8"
            }, {
                "components": [{
                    "internalType": "uint256",
                    "name": "day",
                    "type": "uint256"
                }, {"internalType": "uint256", "name": "month", "type": "uint256"}, {
                    "internalType": "uint256",
                    "name": "year",
                    "type": "uint256"
                }], "internalType": "struct tlb.Date", "name": "expiredDate", "type": "tuple"
            }, {
                "internalType": "bool",
                "name": "etopsFlight",
                "type": "bool"
            }, {
                "components": [{
                    "internalType": "uint256",
                    "name": "hour",
                    "type": "uint256"
                }, {"internalType": "uint256", "name": "minute", "type": "uint256"}],
                "internalType": "struct tlb.FlightTime",
                "name": "flightTime",
                "type": "tuple"
            }, {"internalType": "string", "name": "maintCheck", "type": "string"}, {
                "internalType": "uint256",
                "name": "licenceNo",
                "type": "uint256"
            }, {"internalType": "uint256", "name": "station", "type": "uint256"}, {
                "internalType": "bool",
                "name": "CaaCertification",
                "type": "bool"
            }], "internalType": "struct tlb.AllActionData", "name": "allActionData", "type": "tuple"
        }, {
            "internalType": "address",
            "name": "employeeReportSignature",
            "type": "address"
        }, {
            "internalType": "address",
            "name": "employeeActionSignature",
            "type": "address"
        }, {"internalType": "address", "name": "managerSignature", "type": "address"}],
        "internalType": "struct tlb.TLB[]",
        "name": "",
        "type": "tuple[]"
    }], "stateMutability": "view", "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "_pageNo", "type": "uint256"}, {
        "components": [{
            "components": [{
                "internalType": "uint256",
                "name": "day",
                "type": "uint256"
            }, {"internalType": "uint256", "name": "month", "type": "uint256"}, {
                "internalType": "uint256",
                "name": "year",
                "type": "uint256"
            }], "internalType": "struct tlb.Date", "name": "actionDate", "type": "tuple"
        }, {
            "components": [{"internalType": "string", "name": "actions", "type": "string"}, {
                "internalType": "uint256",
                "name": "actionIdNo",
                "type": "uint256"
            }], "internalType": "struct tlb.Action", "name": "action", "type": "tuple"
        }, {
            "components": [{"internalType": "bool", "name": "Cdccl", "type": "bool"}, {
                "internalType": "bool",
                "name": "FcsRepair",
                "type": "bool"
            }, {"internalType": "bool", "name": "Rii", "type": "bool"}, {
                "internalType": "enum tlb.MelCat",
                "name": "MelCats",
                "type": "uint8"
            }, {"internalType": "bool", "name": "M", "type": "bool"}, {
                "internalType": "bool",
                "name": "O",
                "type": "bool"
            }, {"internalType": "bool", "name": "notifyDispatch", "type": "bool"}, {
                "internalType": "uint256",
                "name": "licenseNo",
                "type": "uint256"
            }, {
                "components": [{
                    "internalType": "uint256",
                    "name": "day",
                    "type": "uint256"
                }, {"internalType": "uint256", "name": "month", "type": "uint256"}, {
                    "internalType": "uint256",
                    "name": "year",
                    "type": "uint256"
                }], "internalType": "struct tlb.Date", "name": "actionDate", "type": "tuple"
            }], "internalType": "struct tlb.Status", "name": "status", "type": "tuple"
        }, {
            "components": [{"internalType": "uint256", "name": "item", "type": "uint256"}, {
                "internalType": "string",
                "name": "nomenclature",
                "type": "string"
            }, {
                "internalType": "uint256",
                "name": "posistion",
                "type": "uint256"
            }, {
                "components": [{
                    "internalType": "uint256",
                    "name": "partOff",
                    "type": "uint256"
                }, {"internalType": "uint256", "name": "partOn", "type": "uint256"}],
                "internalType": "struct tlb.PartNo",
                "name": "partNo",
                "type": "tuple"
            }, {
                "components": [{
                    "internalType": "uint256",
                    "name": "serialOff",
                    "type": "uint256"
                }, {"internalType": "uint256", "name": "serialOn", "type": "uint256"}],
                "internalType": "struct tlb.SerialNo",
                "name": "serialNo",
                "type": "tuple"
            }], "internalType": "struct tlb.Parts", "name": "parts", "type": "tuple"
        }, {
            "internalType": "enum tlb.Category",
            "name": "category",
            "type": "uint8"
        }, {
            "components": [{"internalType": "uint256", "name": "day", "type": "uint256"}, {
                "internalType": "uint256",
                "name": "month",
                "type": "uint256"
            }, {"internalType": "uint256", "name": "year", "type": "uint256"}],
            "internalType": "struct tlb.Date",
            "name": "expiredDate",
            "type": "tuple"
        }, {"internalType": "bool", "name": "etopsFlight", "type": "bool"}, {
            "components": [{
                "internalType": "uint256",
                "name": "hour",
                "type": "uint256"
            }, {"internalType": "uint256", "name": "minute", "type": "uint256"}],
            "internalType": "struct tlb.FlightTime",
            "name": "flightTime",
            "type": "tuple"
        }, {"internalType": "string", "name": "maintCheck", "type": "string"}, {
            "internalType": "uint256",
            "name": "licenceNo",
            "type": "uint256"
        }, {"internalType": "uint256", "name": "station", "type": "uint256"}, {
            "internalType": "bool",
            "name": "CaaCertification",
            "type": "bool"
        }], "internalType": "struct tlb.AllActionData", "name": "_allActionData", "type": "tuple"
    }], "name": "updateTLB", "outputs": [], "stateMutability": "nonpayable", "type": "function"
}], 0xdaa0CcF8E608541573Be254Db6c069bbeC9469E5
