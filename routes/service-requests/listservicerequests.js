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

// listservicerequests route.
router.get('/', [authenticate, accessVerification("view")], async(req, res) => {
    let client = await mongodb.connect(dbURL, { useUnifiedTopology: true }).catch(err => { throw err });
    let company = req.email.split("@");
    company = company[1].split(".")[0];
    let db = client.db(company);
    let serviceRequests = await db.collection("service-requests").find().toArray().catch(err => { throw err; });
    client.close();
    res.status(200).json({
        serviceRequests
    });
});
router.get('/:id', [authenticate, accessVerification("view")], async(req, res) => {
    let serviceRequestsId = req.params.id;
    // console.log(req.params);
    serviceRequestsId = new ObjectId(serviceRequestsId);
    let client = await mongodb.connect(dbURL, { useUnifiedTopology: true }).catch(err => { throw err });
    let company = req.email.split("@");
    company = company[1].split(".")[0];
    let db = client.db(company);
    let serviceRequest = await db.collection("service-requests").find({ "_id": serviceRequestsId }).toArray().catch(err => { throw err; });
    client.close();
    res.status(200).json({
        serviceRequest
    });
});

module.exports = router;