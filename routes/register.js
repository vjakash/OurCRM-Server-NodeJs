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

//middleware imports
let authenticate = require('../middlewares/authentication.js');
let permission = require('../middlewares/permission.js');

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

// register route.
router.post('/', async(req, res) => {
    let { email, firstName, lastName, password, userType, accessRights } = req.body;
    if (email === undefined || firstName === undefined || lastName === undefined || password === undefined || userType === undefined) {
        res.status(400).json({
            message: 'Fields missing'
        });
    } else {
        let client = await MongoClient.connect(dbURL, { useUnifiedTopology: true }).catch((err) => { throw err; });
        let company = email.split("@");
        company = company[1].split(".")[0];
        let db = client.db(company);
        let data = await db.collection('users').findOne({ email }).catch((err) => { throw err; });
        if (data) {
            res.status(400).json({
                message: 'Email already registered'
            });
        } else {
            let data = await db.collection('users').findOne({ company }).catch((err) => { throw err; });
            if (data) {
                res.status(400).json({
                    message: 'Company name already registered.....Please choose different name'
                });
            } else {
                let saltRounds = 10;
                let salt = await bcrypt.genSalt(saltRounds).catch((err) => { throw err; });
                let hash = await bcrypt.hash(password, salt).catch((err) => { throw err; });
                req.body.password = hash;
                req.body.accountVerified = false;
                req.body.isRootUser = true;
                req.body.dbName = email;
                await db.collection('users').insertOne(req.body).catch(err => { throw err; });
                let buf = await require('crypto').randomBytes(32);
                let token = buf.toString('hex');
                await db.collection('users').updateOne({ email }, { $set: { verificationToken: token } });
                client.close();
                mailOptions.to = email;
                mailOptions.subject = 'CRM-Account verification '
                mailOptions.html = `<html><body><h1>Account Verification Link</h1>
                                     <h3>Click the link below to verify the account</h3>
                                    <a href='${process.env.urldev}/#/verifyaccount/${token}/${req.body.email}'>${process.env.urldev}/#/verifyaccount/${token}/${req.body.email}</a><br>`;
                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        console.log(error);
                        res.status(500).json({
                            message: "An error occured,Please try again later"
                        })
                    } else {
                        console.log('Email sent: ' + info.response);
                        res.status(200).json({
                            message: `Registration Successfull,Verification mail sent to ${email}`,
                        })
                        client.close();
                    }
                });

            }
        }
    }
});
router.post('/adduser', [authenticate, permission(["admin", "manager"])], async(req, res) => {
    let { email, firstName, lastName, password, userType, accessRights } = req.body;
    console.log(req.body);
    if (email === undefined || firstName === undefined || lastName === undefined || userType === undefined) {
        res.status(400).json({
            message: 'Fields missing'
        });
    } else {
        let client = await MongoClient.connect(dbURL, { useUnifiedTopology: true }).catch((err) => { throw err; });
        let company = email.split("@");
        company = company[1].split(".")[0];
        req.body.company = company;
        let db = client.db(company);
        let data = await db.collection('users').findOne({ email }).catch((err) => { throw err; });
        if (data) {
            res.status(400).json({
                message: 'Email already registered'
            });
        } else {
            password = String(Math.random()).slice(2, 10);
            let saltRounds = 10;
            let salt = await bcrypt.genSalt(saltRounds).catch((err) => { throw err; });
            let hash = await bcrypt.hash(password, salt).catch((err) => { throw err; });
            req.body.password = hash;
            req.body.accountVerified = false;
            req.body.isRootUser = false;
            // req.body.dbName = company;
            req.body.totalRevenue = 0;
            req.body.revenues = [];
            await db.collection('users').insertOne(req.body).catch(err => { throw err; });
            let buf = await require('crypto').randomBytes(32);
            let token = buf.toString('hex');
            await db.collection('users').updateOne({ email }, { $set: { verificationToken: token } });
            client.close();
            mailOptions.to = email;
            mailOptions.subject = 'CRM-Account verification '
            mailOptions.html = `<html><body><h1>Account Verification Link</h1>
                                     <h3>Click the link below to verify the account</h3>
                                     <h1>Password: ${password}</h1>
                                    <a href='${process.env.urldev}/#/verifyaccount/${token}/${req.body.email}'>${process.env.urldev}/#/verifyaccount/${token}/${req.body.email}</a><br>`;
            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.log(error);
                    res.status(500).json({
                        message: "An error occured,Please try again later"
                    })
                } else {
                    console.log('Email sent: ' + info.response);
                    res.status(200).json({
                        message: `User Added,Verification mail sent to ${email}`,
                    })
                    client.close();
                }
            });
        }
    }
});
module.exports = router;