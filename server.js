const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const Web3 = require("web3");
const mysql = require("mysql");

let web3 = new Web3('http://localhost:8545');
const contractAddr = "0x77CD8D53fcB26c1D9F69ed60E1b3cAf63D2F5199";
const ABI = [{"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_API","type":"string"},{"internalType":"string","name":"_addr","type":"string"}],"name":"addContract","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x6c2bc72d"},{"inputs":[],"name":"getContracts","outputs":[{"components":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"API","type":"string"},{"internalType":"string","name":"addr","type":"string"}],"internalType":"struct main.Entry[]","name":"results","type":"tuple[]"}],"stateMutability":"view","type":"function","constant":true,"signature":"0xc3a2a93a"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"removeContract","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x7cca3b06"}];
const mainContract = new web3.eth.Contract(ABI, contractAddr);
let contracts = [];

web3.eth.personal.unlockAccount("0x8DB720Cf34b1b7c23E332c6F5B777b5a3Fe137d2", "", 0);
mainContract.methods.getContracts().call().then((Result) => {
    contracts["Main"]= {name: "Main", ABI: ABI, address: contractAddr};
    Result.forEach(contract => {
        contracts[contract[0]] = {name: contract[0], ABI: JSON.parse(contract[1]), address: contract[2]};
    });
});
//TODO: Get contract permissions


var app = express();
var urlencodedParser = bodyParser.urlencoded({extended: true});
app.use(urlencodedParser);
app.use(express.static(__dirname + '/public'));
app.use(cookieParser("super secret secret"));
app.set('view engine', 'ejs');
app.set('views', './public');

app.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: "super secret secret"
}));

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "Bachelor"
});
con.connect();


function callMethod(cname, method, arguments){
    let contract = contracts[cname];
    let abi = contract.ABI;
    let addr = contract.address;
    let args = [];
    let contr = new web3.eth.Contract(abi, addr);
    let meth = abi.find(e => e.name === method);
    if (meth.inputs.find(e => 'components' in e)){
        args = structVals(meth.inputs, cname+"_"+method+"_");
        console.log(args);
    } else {
        meth.inputs.forEach(i => args.push(document.getElementById(method + "_" + i.name).value));
    }
    if (abi.find(e => e.name === method).stateMutability === "view"){
        contr.methods[method].apply(null, args).call().then(Result => {
            console.log("OUT_"+method+"_"+Result.name);
            console.log(Result);
            document.getElementById("OUT_"+method+"_"+cname).innerHTML = Result});
    } else {
        contr.methods[method].apply(null, args).send({from: callerAddr, gasPrice: 1});
    }
}




function getContracts(address){
    let contrs = [];
    contrs["test1"] = {name: "TestContract", ABI: [{name: "testMethod", type: "out"}, {name: "testMethod2", type: "out"}]};
    contrs["test2"] = {name: "TestContract2", ABI: [{name: "testMethod21", type: "out"}, {name: "testMethod22", type: "out"}]};
    return contrs;
}



app.post("/register", urlencodedParser, function (req, res) {
    res.write("success!");
    let query = "INSERT INTO accounts (email, pass, address) VALUES ('" + req.body.email + "', '" + req.body.password + "', 0);";
    con.query(query, (err, result) => console.log(result + ", " + err));
    res.send();


});


app.post("/login", urlencodedParser, function (req, res) {
    let query = "SELECT id, address FROM accounts WHERE email = '" + req.body.email + "' AND pass = '" + req.body.password + "' LIMIT 1;";
    con.query(query, (err, result) => {
        if (result === undefined) {
            res.write("Invalid email or password");
            res.send();
            return;
        }
        req.session.uid = result[0].id;
        req.session.address = result[0].address;
        res.cookie("uid", result[0].id, {signed: true, secret: "super secret secret"});
        res.redirect("/");
        res.send();
    });

});

app.get("/logout", (req, res) => {
    res.cookie("uid", {maxAge: 0});
    if (res.session !== undefined)
        res.session.destroy();
    res.redirect("/");
    res.send();
});

app.post("/callMethod", urlencodedParser, (req, res) => {
    console.log(req.body);
    let decoded = decodeURIComponent(req.body.data);
    console.log(decoded);
    res.send("Response!");
});

app.get("/", (req, res) => {
    if (true || req.session.uid !== undefined) {
        res.render("index", {userAddress: req.session.uid, contracts: contracts}, (err, html) => {if (err) {console.log(err);} res.send(html)});
    } else {
        res.render("login", (err, html) => res.send(html));
    }
});



app.listen(8080);