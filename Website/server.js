const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const Web3 = require("web3");
const mysql = require("mysql");

let textFormat = function(text) {
    text = text.replace(/(_)/g, (s) => " ");
    text = text.replace(/([a-z][A-Z])/g, (s) => s.charAt(0) + " " + s.charAt(1));
    text = text.trim();
    text = text.replace(/(\s[a-z])/g, (s) => " " + s.charAt(1).toUpperCase());
    return text.charAt(0).toUpperCase()+text.substring(1);
}

let web3 = new Web3('http://localhost:8545');
const contractAddr = "0x6912637d6d2615584b8C5fD50Ce40f9885077743";
const ABI = [{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"addr","type":"address"},{"indexed":false,"internalType":"bool","name":"success","type":"bool"}],"name":"ChangePermissions","type":"event","signature":"0x90d0dd1f71e3e0685bcf6dfe715debdc86f68dea2c066d066c5a81a1498af30e"},{"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_ABI","type":"string"},{"internalType":"address","name":"_addr","type":"address"}],"name":"addContract","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0xf7d8bfdc"},{"inputs":[],"name":"getContracts","outputs":[{"components":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"ABI","type":"string"},{"internalType":"address","name":"addr","type":"address"}],"internalType":"struct main.Entry[]","name":"results","type":"tuple[]"}],"stateMutability":"view","type":"function","constant":true,"signature":"0xc3a2a93a"},{"inputs":[],"name":"kill","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x41c0e1b5"},{"inputs":[{"internalType":"uint256","name":"pageNo","type":"uint256"}],"name":"removeContract","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x7cca3b06"},{"inputs":[{"internalType":"address","name":"addr","type":"address"}],"name":"setPM","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x46efe280"}];
const mainContract = new web3.eth.Contract(ABI, contractAddr);
let contracts;
const mainAccount = "0x8DB720Cf34b1b7c23E332c6F5B777b5a3Fe137d2";

function getContracts() {
    contracts = [];
    web3.eth.personal.unlockAccount(mainAccount, "", 0);
    mainContract.methods.getContracts().call({from: mainAccount}).then((Result) => {
        contracts["Main"] = {name: "Main", ABI: ABI, address: contractAddr};
        Result.forEach(contract => {
            contracts[contract[0]] = {name: contract[0], ABI: JSON.parse(contract[1]), address: contract[2]};
        });
        web3.eth.personal.lockAccount(mainAccount)
    });
}

async function getPermissions(address){
    let allowedCalls = [];
    let isAdmin = false;
    let perms;
    await callMethod(mainAccount, "PermissionManager", "getPermissions", {PermissionManager_getPermissions_addr: address}).then((result) => {
        if (result.some((perm) => {return perm === "Admin"})) {
            allowedCalls = contracts;
            isAdmin = true;
            return;
        }
        perms = result;
        let splitPerms = [];
        result.forEach((perm) => splitPerms.push(perm.split(".")));
        for (let contract of Object.entries(contracts)) {
            if (splitPerms.some((element) => element[0] === contract[0])) {
                allowedCalls[contract[0]] = {name: contract[0], ABI: []};
                allowedCalls[contract[0]].ABI = contract[1].ABI.filter((func) => {return splitPerms.some((element) => {return contract[0] === element[0] && func.name === element[1]})});
            }
        }
    });
    return {allowed: allowedCalls, admin: isAdmin};

}

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
    console.log(params);
    comps.forEach(comp => {
        if ('components' in comp) {
            inputs.push(structVals(comp.components, prefix + comp.name + "_", params));
        } else {
            console.log("Adding", prefix + comp.name, ":", params[prefix + comp.name]);
            inputs.push(params[prefix + comp.name]);
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
    console.log(cname, method);
    let args = structVals(meth.inputs, cname + "_" + method + "_", params);
    console.log(args);
    let result;
    if (meth.stateMutability === "view" || method.stateMutability === "pure") {
        await contr.methods[method].apply(null, args).call({from: from}).then(async (response) => {
            result = response;
        });
    } else {
        await contr.methods[method].apply(null, args).send({from: from}).then((response) => {
            result = "Success!";
        });
    }
    return result;
}

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

app.post("/register", urlencodedParser, function (req, res) {
    if (validateEmail(req.body.email) && req.session.admin === true) {
        bcrypt.genSalt(5, function(err, salt) {
            bcrypt.hash(req.body.password, salt, function(err, hash) {
                let query = "INSERT INTO accounts (email, password, address) VALUES ('" + req.body.email + "', '" + hash + "', 0);";
                con.query(query, (err, result) => console.log(result + ", " + err));
                res.send("Success");
            })
        });
    } else {
        res.write("Email is not valid");
        res.send();
    }


});


app.post("/login", urlencodedParser, function (req, res) {
    try {
        let query = "SELECT password, id, address FROM accounts WHERE email = '" + req.body.email + "' LIMIT 1;";
        con.query(query, (err, result) => {
            if (result.length === 0) {
                res.write("Invalid email or password");
                res.send();
                return;
            }
            let pass = result[0].password;
            bcrypt.compare(req.body.password, pass).then(function (valid) {
                if (valid) {
                    req.session.uid = result[0].id;
                    req.session.address = result[0].address;
                    res.cookie("uid", result[0].id, {signed: true, secret: "super secret secret"});
                    res.redirect("/");
                } else {
                    res.write("Invalid email or password");
                    res.send();
                }
            });
        });
    } catch (err) {
        res.redirect("/");
    }
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
    try {
        web3.eth.personal.unlockAccount(req.session.address, "", 10).then(() => {
            console.log("Account unlocked:", req.session.address);
            callMethod(req.session.address, target[0], target[1], params).then((result) => {
                res.render("renderOutput", {
                    results: result,
                    name: target[0] + "_" + target[1] + "_render",
                    format: textFormat
                }, (err, html) => {
                    if (err) {
                        console.log(err);
                    }
                    res.send(html)
                });
            }).catch((err) => {
                console.log(err);
                res.render("error", (error, html) => res.send(html))
            });
        });
    } catch (err) {
        res.send("You need to log on");
    }
});


app.get("/", async (req, res) => {
    if (req.session.uid !== undefined) {
        console.log(req.session.uid, "has logged on");
        let conts = await getPermissions(req.session.address);
        req.session.admin = conts.admin;
        res.render("index", {userAddress: req.session.address, contracts: conts.allowed, format: textFormat, admin: req.session.admin}, (err, html) => {
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

getContracts();

console.log("Server started");
app.listen(8080);