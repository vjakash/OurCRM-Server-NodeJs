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

// listlead route.
router.get('/', [authenticate, accessVerification("view")], async(req, res) => {
    let client = await mongodb.connect(dbURL, { useUnifiedTopology: true }).catch(err => { throw err });
    let company = req.email.split("@");
    company = company[1].split(".")[0];
    let db = client.db(company);
    let leads = await db.collection("leads").find().toArray().catch(err => { throw err; });
    client.close();
    res.status(200).json({
        leads
    });
});
router.get('/:id', [authenticate, accessVerification("view")], async(req, res) => {
    let leadId = req.params.id;
    // console.log(req.params);
    leadId = new ObjectId(leadId);
    let client = await mongodb.connect(dbURL, { useUnifiedTopology: true }).catch(err => { throw err });
    let company = req.email.split("@");
    company = company[1].split(".")[0];
    let db = client.db(company);
    let lead = await db.collection("leads").find({ "_id": leadId }).toArray().catch(err => { throw err; });
    client.close();
    res.status(200).json({
        lead
    });
});

module.exports = router;