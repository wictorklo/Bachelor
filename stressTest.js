//const performance = require('perf_hooks');
const Web3 = require("web3");
const web3 = new Web3("http://localhost:8545");

let i = 0;


//var t0 = performance.now();

module.exports = {
    stresstest: async function (abi, addr) {
        let accounts = await web3.eth.getAccounts();
        let myWalletAddress = accounts[0];
        web3.eth.personal.unlockAccount(myWalletAddress, "", 0).then(() => {
            console.time('stresstest')
            let contract = new web3.eth.Contract(abi, addr);
            while (i < 500) {
                contract.methods.increment(1).send({
                    from: myWalletAddress,
                    gasPrice: 1
                });
                i++;
            }
            console.timeEnd('stresstest')
        });
    }
}

//var t1 = performance.now();
//console.log("Call to stresstest() took " + (t1 - t0) + " milliseconds.");
