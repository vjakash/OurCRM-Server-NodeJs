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

//node-mailer
const nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});
let mailOptions = {
    from: process.env.EMAIL,
    to: '',
    subject: 'Sending Email using Node.js',
    html: `<h1>Hi from node</h1><p> Messsage</p>`
};
//middleware imports
let authenticate = require('../../middlewares/authentication.js');
let accessVerification = require('../../middlewares/accessVerification.js');
let permission = require('../../middlewares/permission.js');

// updateusertype route.
router.put('/', [authenticate, permission(["admin", "manager"])], async(req, res) => {
    let { userId, userType } = req.body;
    if (userId === undefined || userType === undefined) {
        res.status(400).json({
            message: 'Required Fields missing'
        });
    } else {
        let client = await mongodb.connect(dbURL, { useUnifiedTopology: true }).catch(err => { throw err });
        let company = req.email.split("@");
        company = company[1].split(".")[0];
        let db = client.db(company);
        userId = new ObjectId(userId);
        let data = await db.collection('users').find({ '_id': userId }).toArray().catch(err => { throw err });
        console.log(data);
        let oldUserType = data.userType;
        await db.collection('users').updateOne({ '_id': userId }, { $set: { userType } }).catch(err => { throw err });
        // console.log(admins);
        mailOptions.to = data.email;
        mailOptions.subject = 'Lead status update';
        mailOptions.html = `<html><body><h1>Employee type changed</h1>
            <h3>Lead status updated from <b>${oldUserType}</b> to <b>${userType}</h3>`;
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Employee type chnage sent Email info ' + info.response);
            }
        });
        client.close();
        res.status(200).json({
            message: 'Lead Status updated'
        });
    }
});

module.exports = router;