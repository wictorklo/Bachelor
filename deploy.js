const fs = require("fs");
const Web3 = require("web3");
const web3 = new Web3("http://localhost:8545");
const bytecode = fs.readFileSync("./build/main_sol_Main.bin");
const abi = JSON.parse(fs.readFileSync("./build/main_sol_Main.abi"));


web3.eth.getChainId().then((res) => console.log);
(async function () {
    const ganacheAccounts = await web3.eth.getAccounts();

    const myWalletAddress = ganacheAccounts[1];

    const myContract = new web3.eth.Contract(abi);

    web3.eth.personal.unlockAccount(myWalletAddress, "", 10).then(() => {
        myContract.deploy({
            data: bytecode.toString()
        }).send({
            from: myWalletAddress,
            gas: 5000000
        }).then((deployment) => {
            console.log(deployment.options.address);
        }).catch((err) => {
            console.error(err);
        })
    })
})();