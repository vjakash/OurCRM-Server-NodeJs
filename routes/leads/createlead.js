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

// createlead route.
router.post('/', [authenticate, accessVerification("create")], async(req, res) => {
    let { owner, firstName, phone, lastName, company, email, leadStatus } = req.body;
    if (owner === undefined || company === undefined || firstName === undefined || phone === undefined || email === undefined || leadStatus === undefined) {
        res.status(400).json({
            message: 'Required Fields missing'
        });
    } else {
        let client = await mongodb.connect(dbURL, { useUnifiedTopology: true }).catch(err => { throw err });
        let db = client.db('crm');
        await db.collection('leads').insertOne(req.body).catch(err => { throw err });
        let managers = await db.collection('users').find({ userType: "manager" }).toArray().catch(err => { throw err; });
        for (let i of managers) {
            mailOptions.to = i.email;
            mailOptions.subject = 'Lead added';
            mailOptions.html = `<html><body><h1>New lead added</h1>
            <h3>Details of new lead</h3>
            <h5>Lead Owner : ${owner}</h5>
            <h5>First Name : ${firstName}</h5>
            <h5>Email : ${email}</h5>
            <h5>Phone Number : ${phone}</h5>
            <h5>Lead Status : ${leadStatus}</h5>`;
            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        }
        let admins = await db.collection('users').find({ userType: "admin" }).toArray().catch(err => { throw err; });
        // console.log(admins);
        for (let i of admins) {
            mailOptions.to = i.email;
            mailOptions.subject = 'Lead added';
            mailOptions.html = `<html><body><h1>New lead added</h1>
            <h3>Details of new lead</h3>
            <h5>Lead Owner : ${owner}</h5>
            <h5>First Name : ${firstName}</h5>
            <h5>Email : ${email}</h5>
            <h5>Phone Number : ${phone}</h5>
            <h5>Lead Status : ${leadStatus}</h5>`;
            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        }
        client.close();
        res.status(200).json({
            message: 'Lead created'
        });
    }
});

module.exports = router;