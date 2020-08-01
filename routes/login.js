var express = require('express');
var router = express.Router();

//dotenv import
const dotenv = require('dotenv');
dotenv.config();

//mongodb imports
let mongodb = require('mongodb');
let MongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectID;
let dbURL = process.env.dbURL;

//bcrypt for hashing and comparing password
let bcrypt = require('bcrypt');

//jwt import
const jwt = require('jsonwebtoken');

// login route.
router.post("/", async(req, res) => {

    let { email, password } = req.body;
    if (email === undefined || password === undefined) {
        res.status(400).json({
            message: 'Fields missing'
        });
    } else {
        let client = await mongodb.connect(dbURL, { useUnifiedTopology: true }).catch(err => { throw err; });
        let company = email.split("@");
        company = company[1].split(".")[0];
        let db = client.db(company);
        let data = await db.collection('users').findOne({ email }).catch(err => { throw err; });
        if (data) {
            if (data.accountVerified) {
                bcrypt.compare(password, data.password, function(err, result) {
                    if (err) throw err;
                    if (result) {
                        // jwt.sign({ id: data["_id"], email: data["email"], userType: data["userType"], accessRights: data['accessRights'] }, 'qwertyuiopasdfghjkl', { expiresIn: '10h' }, function(err, token) {
                        jwt.sign({ id: data["_id"], email: data["email"], userType: data["userType"], accessRights: data['accessRights'] }, 'qwertyuiopasdfghjkl', function(err, token) {
                            if (err) throw err;
                            client.close();
                            console.log("login successfull")
                            res.status(200).json({
                                message: "login successfull",
                                token,
                                email,
                                userType: data["userType"],
                                isRootUser: data["isRootUser"],
                                company: data["company"]
                            })
                        });
                    } else {
                        client.close();
                        console.log("password incorrect");
                        res.status(401).json({
                            message: "password incorrect"
                        })
                    }
                })
            } else {
                console.log('verify your account to login');
                res.status(400).json({
                    message: 'verify your account to login'
                });
            }

        } else {
            client.close();
            console.log('user not found');
            res.status(400).json({
                message: 'User not found'
            })
        }
    }

});

module.exports = router;