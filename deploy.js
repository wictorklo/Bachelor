const fs = require("fs");
const Web3 = require("web3");
const web3 = new Web3("http://localhost:8545");
const bytecode = fs.readFileSync("./build/main_sol_Main.bin");
const abi = JSON.parse(fs.readFileSync("./build/main_sol_Main.abi"));

var mainContract;
web3.eth.getChainId().then((res) => console.log);
var accounts;
var myWalletAddress;

async function setupMain () {
    accounts = await web3.eth.getAccounts();
    myWalletAddress = accounts[0];

    const myContract = new web3.eth.Contract(abi);

    web3.eth.personal.unlockAccount(myWalletAddress, "", 10).then(() => {
        myContract.deploy({
            data: bytecode.toString()
        }).send({
            from: myWalletAddress,
            gas: 5000000
        }).then((deployment) => {
            mainContract = new web3.eth.Contract(abi, deployment.options.address);
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
            files.forEach(file => {
                let name = file.substr(0, file.lastIndexOf("."));
                if (name !== "main_sol_Main")
                    names.add(name);
            });
            names.forEach(name => {
                let bc = fs.readFileSync("./build/" + name + ".bin");
                let rawABI = fs.readFileSync("./build/" + name + ".abi", "utf8");
                console.log(rawABI);
                let ABI = JSON.parse(rawABI);
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
