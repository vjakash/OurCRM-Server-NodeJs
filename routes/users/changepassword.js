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

//bcrypt for hashing and comparing password
let bcrypt = require('bcrypt');


// changepassword route.
router.post('/', async(req, res) => {
    let { email, password } = req.body;
    // console.log('from resetpassword', email, passwordResetToken)
    let client = await mongodb.connect(dbURL, { useUnifiedTopology: true }).catch(err => { throw err });
    let company = email.split("@");
    company = company[1].split(".")[0];
    let db = client.db(company);
    let data = await db.collection('users').findOne({ email }).catch(err => { throw err });
    if (data) {
        let saltRounds = 10;
        let salt = await bcrypt.genSalt(saltRounds).catch((err) => { throw err; });
        let hash = await bcrypt.hash(password, salt).catch((err) => { throw err; });
        password = hash;
        await db.collection('users').updateOne({ email }, { $set: { password } }).catch(err => { throw err });
        res.status(200).json({
            message: 'Password changed successfully'
        });
    } else {
        res.status(400).json({
            message: 'Password changing failed, Try again'
        });
    }
    client.close();
});

module.exports = router;