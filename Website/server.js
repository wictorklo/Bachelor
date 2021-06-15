const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const Web3 = require("web3");
const mysql = require("mysql");

let web3 = new Web3('http://localhost:8545');
const contractAddr = "0x6cf41854E40DD4ba01BF6522Fb179fD2f34D7f5e";
const ABI = [{"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_ABI","type":"string"},{"internalType":"string","name":"_addr","type":"string"}],"name":"addContract","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x6c2bc72d"},{"inputs":[{"internalType":"address","name":"addr","type":"address"}],"name":"getAdmin","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function","constant":true,"signature":"0x64efb22b"},{"inputs":[],"name":"getContracts","outputs":[{"components":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"ABI","type":"string"},{"internalType":"string","name":"addr","type":"string"}],"internalType":"struct main.Entry[]","name":"results","type":"tuple[]"}],"stateMutability":"view","type":"function","constant":true,"signature":"0xc3a2a93a"},{"inputs":[],"name":"kill","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x41c0e1b5"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"removeContract","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x7cca3b06"},{"inputs":[{"internalType":"address","name":"addr","type":"address"}],"name":"setPM","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x46efe280"}];
const mainContract = new web3.eth.Contract(ABI, contractAddr);
let contracts = [];
const mainAccount = "0x8DB720Cf34b1b7c23E332c6F5B777b5a3Fe137d2";

web3.eth.personal.unlockAccount(mainAccount, "", 0);
mainContract.methods.getContracts().call({from: mainAccount}).then((Result) => {
    contracts["Main"] = {name: "Main", ABI: ABI, address: contractAddr};
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

function structVals(comps, prefix, params) {
    let inputs = [];
    comps.forEach(comp => {
        if ('components' in comp) {
            inputs.push(structVals(comp.components, prefix + "_" + comp.name, params));
        } else {
            inputs.push(params[prefix + "_" + comp.name]);
        }
    });
    return inputs;
}

async function callMethod(from, cname, method, params) {
    let contract = contracts[cname];
    let abi = contract.ABI;
    let addr = contract.address;
    let contr = new web3.eth.Contract(abi, addr);
    let meth = abi.find(e => e.name === method);
    let args = structVals(meth.inputs, cname + "_" + method, params);
    if (meth.stateMutability === "view" || method.stateMutability === "pure") {
        let result;
        await contr.methods[method].apply(null, args).call({from: from}).then(async (response) => {
            result = response;
        });
        return result;
    } else {
        let result;
        await contr.methods[method].apply(null, args).send({from: from}).then((response) => {
            result = "Success!";
        });
        return result;
    }
}

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

async function getValidContracts(address) {
    let result;
    let abi = contracts["PermissionManager"].ABI;
    let addr = contracts["PermissionManager"].address;
    let contr = new web3.eth.Contract(abi, addr);

    await contr.methods["getPermissions"](address).call({from: mainAccount}).then((response) => {
        result = response;
    });
    console.log(result);
    return result;
}

app.post("/register", urlencodedParser, function (req, res) {
    if (validateEmail(req.body.email)) {
        let query = "INSERT INTO accounts (email, pass, address) VALUES ('" + req.body.email + "', '" + req.body.password + "', 0);";
        con.query(query, (err, result) => console.log(result + ", " + err));
        res.write("success!");
        res.send();
    } else {
        res.write("Email is not valid");
        res.send();
    }


});


app.post("/login", urlencodedParser, function (req, res) {
    let query = "SELECT id, address FROM accounts WHERE email = '" + req.body.email + "' AND password = '" + req.body.password + "' LIMIT 1;";
    console.log("Querying...");
    con.query(query, (err, result) => {
        if (result === undefined) {
            res.write("Invalid email or password");
            res.send();
            return;
        }
        console.log("Query complete");
        req.session.uid = result[0].id;
        req.session.address = result[0].address;
        res.cookie("uid", result[0].id, {signed: true, secret: "super secret secret"}).send();
        res.redirect("/");
    });

});

app.get("/logout", (req, res) => {
    res.clearCookie("uid");
    if (req.session !== undefined) {
        req.session.destroy();
    }
    console.log(res.session);
    res.redirect("/");
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
            res.render("renderOutput", {
                results: result,
                name: target[0] + "_" + target[1] + "_render"
            }, (err, html) => {
                if (err) {
                    console.log(err);
                }
                res.send(html)
            });
            //res.send(result);
            //res.render("login", (err, html) => res.send(html));
        });
    });
});


app.get("/", (req, res) => {
    if (req.session.uid !== undefined) {
        console.log(req.session.uid);
        console.log(req.session.uid, "has logged on");
        //getValidContracts(req.session.address);
        res.render("index", {userAddress: req.session.address, contracts: contracts}, (err, html) => {
            console.log("html generated");
            if (err) {
                console.log(err);
            }
            res.send(html)
        });
    } else {
        res.render("login", (err, html) => res.send(html));
    }
});

app.listen(8080);