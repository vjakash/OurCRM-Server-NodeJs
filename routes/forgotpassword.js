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

//jwt import
const jwt = require('jsonwebtoken');

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

// forgotpassword route.
router.post('/', async(req, res) => {
    let { email } = req.body;
    console.log(email);
    let client = await mongodb.connect(dbURL, { useUnifiedTopology: true }).catch(err => { throw err; });
    let company = email.split("@");
    company = company[1].split(".")[0];
    let db = client.db(company);
    let data = await db.collection('users').findOne({ email }).catch(err => { throw err });
    // console.log(data);
    if (data) {
        let buf = await require('crypto').randomBytes(32);
        let token = buf.toString('hex');
        await db.collection('users').updateOne({ email }, { $set: { passwordResetToken: token } });
        client.close();
        mailOptions.to = email;
        mailOptions.subject = 'CRM-Password reset';
        mailOptions.html = `<html><body><h1>Password reset Link</h1>
        <h3>Click the link below to reset password</h3>
       <a href='${process.env.urldev}/#/resetpassword/${token}/${req.body.email}'>${process.env.urldev}/#/resetpassword/${token}/${req.body.email}</a><br>`;
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
                res.status(500).json({
                    message: "An error occured,Please try again later"
                })
            } else {
                console.log('Email sent: ' + info.response);
                res.status(200).json({
                    message: `Verification mail sent to ${req.body.email}`,
                })
                client.close();
            }
        });

    } else {
        res.status(400).json({
            message: 'Email does not exist'
        });
    }
});

module.exports = router;