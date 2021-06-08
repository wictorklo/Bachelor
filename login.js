import * as connection from "express";

const express = require("express");
const mysql = require("mysql");
const dotenv = require("dotenv");
const path = require("path");
const {bcrypt} = require("@ethersproject/hash/lib.esm/typed-data");

dotenv.config({path: "./.env"});

const app = express();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

/*const publicDirectory = path.join(__dirname, "./public");
app.use(express.static(publicDirectory));

//app.set("view engine", "hbs");

db.connect( (error) => {
    if(error) {
        console.log(error)
    } else {
        console.log("MySQL connected")
    }
})

app.get("/", (req, res) => {
   res.render("/login")
});*/

exports.register = async function(req,res){
    const password = req.body.password;
    const encryptedPassword = await bcrypt.hash(password, saltRounds)
    var users={
        "email":req.body.email,
        "password":encryptedPassword
    }

    connection.query('INSERT INTO users SET ?',users, function (error, results, fields) {
        if (error) {
            res.send({
                "code":400,
                "failed":"error ocurred"
            })
        } else {
            res.send({
                "code":200,
                "success":"user registered sucessfully"
            });
        }
    });
}

exports.login = async function(req,res){
    var email= req.body.email;
    var password = req.body.password;
    connection.query('SELECT * FROM users WHERE email = ?',[email], async function (error, results, fields) {
        if (error) {
            res.send({
                "code":400,
                "failed":"error ocurred"
            })
        }else{
            if(results.length >0){
                const comparision = await bcrypt.compare(password, results[0].password)
                if(comparision){
                    res.send({
                        "code":200,
                        "success":"login sucessfull"
                    })
                }
                else{
                    res.send({
                        "code":204,
                        "success":"Email and password does not match"
                    })
                }
            }
            else{
                res.send({
                    "code":206,
                    "success":"Email does not exits"
                });
            }
        }
    });
}
