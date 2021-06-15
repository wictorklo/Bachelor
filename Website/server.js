const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const Web3 = require("web3");
const mysql = require("mysql");

let web3 = new Web3('http://localhost:8545');
const contractAddr = "0x5F2F1f4B6427A5A3A3E59CDcee06bA9331C3b583";
const ABI = [{"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_ABI","type":"string"},{"internalType":"string","name":"_addr","type":"string"}],"name":"addContract","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x6c2bc72d"},{"inputs":[],"name":"getContracts","outputs":[{"components":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"ABI","type":"string"},{"internalType":"string","name":"addr","type":"string"}],"internalType":"struct main.Entry[]","name":"results","type":"tuple[]"}],"stateMutability":"view","type":"function","constant":true,"signature":"0xc3a2a93a"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"removeContract","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x7cca3b06"}];
const mainContract = new web3.eth.Contract(ABI, contractAddr);
let contracts = [];
const mainAccount = "0x8DB720Cf34b1b7c23E332c6F5B777b5a3Fe137d2";

web3.eth.personal.unlockAccount(mainAccount, "", 0);
mainContract.methods.getContracts().call().then((Result) => {
    contracts["Main"]= {name: "Main", ABI: ABI, address: contractAddr};
    Result.forEach(contract => {
        contracts[contract[0]] = {name: contract[0], ABI: JSON.parse(contract[1]), address: contract[2]};
    });
    web3.eth.personal.lockAccount(mainAccount)
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



function structVals (comps, prefix, params) {
    let inputs = [];
    comps.forEach( comp => {
        if ('components' in comp){
            inputs.push(structVals(comp.components, prefix+"_"+comp.name, params));
        } else {
            inputs.push(params[prefix+"_"+comp.name]);
        }
    } );
    return inputs;
}

async function callMethod(from, cname, method, params){
    let contract = contracts[cname];
    let abi = contract.ABI;
    let addr = contract.address;
    let contr = new web3.eth.Contract(abi, addr);
    let meth = abi.find(e => e.name === method);
    console.log(params);
    let args = structVals(meth.inputs, cname+"_"+method, params);
    console.log(args);
    if (meth.stateMutability === "view" || method.stateMutability === "pure"){
        let result = "";
        await contr.methods[method].apply(null, args).call().then( async (response) => {
            result = response;
        });
        return result;
    } else {
        let result = "";
        await contr.methods[method].apply(null, args).send({from: from}).then( (response) => {
            result = "Success!";
        });
        return result;
    }
}



app.post("/register", urlencodedParser, function (req, res) {
    res.write("success!");
    let hashed = "";
    bcrypt.genSalt(5, function(err, salt) {
        bcrypt.hash(req.body.password, salt, function(err, hash) {
            let query = "INSERT INTO accounts (email, pass, address) VALUES ('" + req.body.email + "', '" + hash + "', 0);";
            con.query(query, (err, result) => console.log(result + ", " + err));
            res.send();
        })
    });



});


app.post("/login", urlencodedParser, function (req, res) {
    let hashed = "";
    bcrypt.genSalt(5, function(err, salt) {
        bcrypt.hash(req.body.password, salt, function(err, hash) {
            hashed = hash;
        })
    });

    let query = "SELECT pass, id, address FROM accounts WHERE email = '" + req.body.email + "' LIMIT 1;";
    con.query(query, (err, result) => {
        if (result === undefined) {
            res.write("Invalid email or password");
            res.send();
            return;
        }
        let hashed = result[0].pass;
        bcrypt.compare(req.body.password, hashed).then( function(valid) {
            console.log(valid);
            req.session.uid = result[0].id;
            req.session.address = result[0].address;
            res.cookie("uid", result[0].id, {signed: true, secret: "super secret secret"});
            res.redirect("/");
            res.send();
        });
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
    let target = req.body.name.split("_");
    let params = {};
    if (req.body.data !== undefined)
        req.body.data.forEach(elem => params[elem.name] = elem.value);
    //if (req.session.uid !== undefined)
    web3.eth.personal.unlockAccount(req.session.address, "", 10).then(() => {
        console.log("Account unlocked:", req.session.address);
        callMethod(req.session.address, target[0], target[1], params).then((result) => {
            //console.log(result);
            res.render("renderOutput", {results: result, name: target[0]+"_"+target[1]+"_render"}, (err, html) => {if (err) {console.log(err);} res.send(html)});
            //res.send(result);
            //res.render("login", (err, html) => res.send(html));
        });
    });
});


app.get("/", (req, res) => {
    if (req.session.uid !== undefined) {
        console.log(req.session.uid, "has logged on");
        res.render("index", {userAddress: req.session.address, contracts: contracts}, (err, html) => {if (err) {console.log(err);} res.send(html)});
    } else {
        res.render("login", (err, html) => res.send(html));
    }
});

con.query("SELECT * FROM accounts;", (err, result) => {
    if (result === undefined) {
        console.log(err);
        console.log("Invalid email or password");
    } else {
        console.log(result);
    }
});


app.listen(8080);