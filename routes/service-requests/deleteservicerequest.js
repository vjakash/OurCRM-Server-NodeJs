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

// deleteservicerequest route.
router.delete('/:id', [authenticate, accessVerification("delete")], async(req, res) => {
    let serviceRequestsId = req.params.id;
    if (serviceRequestsId === undefined) {
        res.status(400).json({
            message: 'Required Fields missing'
        });
    } else {
        let client = await mongodb.connect(dbURL).catch(err => { throw err });
        let company = req.email.split("@");
        company = company[1].split(".")[0];
        let db = client.db(company);
        serviceRequestsId = new ObjectId(serviceRequestsId);
        delete req.body.serviceRequestsId;
        await db.collection('service-requests').deleteOne({ "_id": serviceRequestsId }).catch(err => { throw err });
        client.close();
        res.status(200).json({
            message: 'Service Request deleted'
        });
    }
});

module.exports = router;