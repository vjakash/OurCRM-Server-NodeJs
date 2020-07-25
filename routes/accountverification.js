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

// accountverification route.
router.post('/', async(req, res) => {
    let { verificationToken, email } = req.body;
    let client = await mongodb.connect(dbURL, { useUnifiedTopology: true }).catch(err => { throw err });
    let db = client.db('crm');
    let data = await db.collection('users').findOne({ email, verificationToken }).catch(err => { throw err });
    if (data) {
        await db.collection('users').updateOne({ email }, { $set: { verificationToken: '', accountVerified: true } });
        client.close();
        res.status(200).json({
            message: 'Account verification succesfull'
        });
    } else {
        res.status(400).json({
            message: 'Account Verification failed, retry again'
        });
    }
});

module.exports = router;