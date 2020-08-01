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
    let company = req.email.split("@");
    company = company[1].split(".")[0];
    let db = client.db(company);
    let contacts = await db.collection("contacts").find({}).toArray().catch(err => { throw err; });
    client.close();
    res.status(200).json({
        contacts
    });
});
router.get('/:id', [authenticate, accessVerification("view")], async(req, res) => {
    let contactId = req.params.id;
    contactId = new ObjectId(contactId);
    let client = await mongodb.connect(dbURL, { useUnifiedTopology: true }).catch(err => { throw err });
    let company = req.email.split("@");
    company = company[1].split(".")[0];
    let db = client.db(company);
    let contact = await db.collection("contacts").find({ "_id": contactId }).toArray().catch(err => { throw err; });
    client.close();
    res.status(200).json({
        contact
    });
});

module.exports = router;