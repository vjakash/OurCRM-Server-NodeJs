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

// listcontacts route.
router.get('/', [authenticate, accessVerification("view")], async(req, res) => {
    let client = await mongodb.connect(dbURL).catch(err => { throw err });
    let db = client.db('crm');
    let contacts = await db.collection("contacts").find({}).toArray().catch(err => { throw err; });
    client.close();
    res.status(200).json({
        contacts
    });
});

module.exports = router;