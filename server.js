const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const Web3 = require("web3");

var app = express();
var urlencodedParser = bodyParser.urlencoded({extended: false});

app.use(express.static('public'));
let web3 = new Web3('http://localhost:8545');

const contractAddr = "0x6cf41854E40DD4ba01BF6522Fb179fD2f34D7f5e";
const ABI = [{"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_API","type":"string"},{"internalType":"string","name":"_addr","type":"string"}],"name":"addContract","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x6c2bc72d"},{"inputs":[],"name":"getContracts","outputs":[{"components":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"API","type":"string"},{"internalType":"string","name":"addr","type":"string"}],"internalType":"struct main.Entry[]","name":"results","type":"tuple[]"}],"stateMutability":"view","type":"function","constant":true,"signature":"0xc3a2a93a"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"removeContract","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x7cca3b06"}];
const mainContract = new web3.eth.Contract(ABI, contractAddr);

app.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
}));

app.post("/login", urlencodedParser, function (req, res) {
    req.session.addr = req.addr;

    mainContract.methods.getContracts().call().then((Result) => {
        res.json(Result);
        return res.send();
    });

});

app.listen(8080);