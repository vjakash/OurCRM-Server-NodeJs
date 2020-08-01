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

//middleware imports
let authenticate = require('../../middlewares/authentication.js');
let accessVerification = require('../../middlewares/accessVerification.js');

// getallusers route.
router.get('/', [authenticate, accessVerification("view")], async(req, res) => {
    let client = await mongodb.connect(dbURL, { useUnifiedTopology: true }).catch(err => { throw err });
    let company = req.email.split("@");
    company = company[1].split(".")[0];
    let db = client.db(company);
    let users = await db.collection("users").find({}, { projection: { password: 0, accountVerified: 0, verificationToken: 0, passwordResetToken: 0 } }).toArray().catch(err => { throw err; });
    client.close();
    res.status(200).json({
        users
    });
});
// getallusers/employees route.
router.get('/employees', [authenticate, accessVerification("view")], async(req, res) => {
    let client = await mongodb.connect(dbURL, { useUnifiedTopology: true }).catch(err => { throw err });
    let company = req.email.split("@");
    company = company[1].split(".")[0];
    let db = client.db(company);
    let users = await db.collection("users").find({ userType: "employee" }, { projection: { _id: 0, email: 1, firstName: 1, lastName: 1 } }).toArray().catch(err => { throw err; });
    client.close();
    res.status(200).json({
        users
    });
});
// getallusers/managers route.
router.get('/managers', [authenticate, accessVerification("view")], async(req, res) => {
    let client = await mongodb.connect(dbURL, { useUnifiedTopology: true }).catch(err => { throw err });
    let company = req.email.split("@");
    company = company[1].split(".")[0];
    let db = client.db(company);
    let managers = await db.collection("users").find({ userType: "manager" }, { projection: { _id: 0, email: 1, firstName: 1, lastName: 1 } }).toArray().catch(err => { throw err; });
    client.close();
    res.status(200).json({
        managers
    });
});

module.exports = router;