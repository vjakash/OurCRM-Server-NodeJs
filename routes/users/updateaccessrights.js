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

// updateaccessrights route.
router.put('/', [authenticate, accessVerification("edit")], async(req, res) => {
    let { userId } = req.body;
    if (userId === undefined) {
        res.status(400).json({
            message: 'Required Fields missing'
        });
    } else {
        let client = await mongodb.connect(dbURL, { useUnifiedTopology: true }).catch(err => { throw err });
        let company = req.email.split("@");
        company = company[1].split(".")[0];
        let db = client.db(company);
        userId = new ObjectId(userId);
        delete req.body.userId;
        await db.collection('users').updateOne({ "_id": userId }, { $set: req.body }).catch(err => { throw err });
        client.close();
        res.status(200).json({
            message: 'Access Righs updated'
        });
    }
});

module.exports = router;