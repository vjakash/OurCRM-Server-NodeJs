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

// deletelead route.
router.delete('/:id', [authenticate, accessVerification("delete")], async(req, res) => {
    let leadId = req.params.id;
    if (leadId === undefined) {
        res.status(400).json({
            message: 'Required Fields missing'
        });
    } else {
        let client = await mongodb.connect(dbURL).catch(err => { throw err });
        let db = client.db('crm');
        leadId = new ObjectId(leadId);
        delete req.body.leadId;
        await db.collection('leads').deleteOne({ "_id": leadId }).catch(err => { throw err });
        client.close();
        res.status(200).json({
            message: 'Lead deleted'
        });
    }
});

module.exports = router;