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

// createcontact route.
router.post('/', [authenticate, accessVerification("create")], async(req, res) => {
    let { owner, firstName, phone, lastName, company, email, dob } = req.body;
    if (owner === undefined || firstName === undefined || phone === undefined || email === undefined) {
        res.status(400).json({
            message: 'Required Fields missing'
        });
    } else {
        let client = await mongodb.connect(dbURL).catch(err => { throw err });
        let company = req.email.split("@");
        company = company[1].split(".")[0];
        let db = client.db(company);
        req.body.createdOn = new Date();
        await db.collection('contacts').insertOne(req.body).catch(err => { throw err });
        client.close();
        res.status(200).json({
            message: 'contact created'
        });
    }
});

module.exports = router;