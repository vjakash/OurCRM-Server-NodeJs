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

// createservicerequest route.
router.post('/', [authenticate, accessVerification("create")], async(req, res) => {
    let { contact, description, requestTitle, requestStatus } = req.body;
    if (contact === undefined || description === undefined || requestTitle === undefined || requestStatus === undefined) {
        res.status(400).json({
            message: 'Required Fields missing'
        });
    } else {
        let client = await mongodb.connect(dbURL, { useUnifiedTopology: true }).catch(err => { throw err });
        let company = req.email.split("@");
        company = company[1].split(".")[0];
        let db = client.db(company);
        req.body.createdOn = new Date();
        await db.collection('service-requests').insertOne(req.body).catch(err => { throw err });
        let data = await db.collection('users').find({ email: contact.owner }).toArray().catch(err => { throw err; });
        let managers = await db.collection('users').find({ email: data[0].manager }).toArray().catch(err => { throw err; });
        for (let i of managers) {
            mailOptions.to = i.email;
            mailOptions.subject = 'New Service Request ';
            mailOptions.html = `<html><body><h1>New service request added added</h1>
            <h3>Details of contact</h3>
            <h5> Owner Email: ${contact.owner}</h5>
            <h5>Owner Name: ${contact.ownerName}</h5>
            <h5>Contact First Name : ${contact.firstName}</h5>
            <h5>Last Name : ${contact.lastName}</h5>
            <h5>Email : ${contact.email}</h5>
            <h5>Company : ${contact.company}</h5>
            <h5>Title : ${contact.title}</h5>
            <h5>Phone Number : ${contact.phone}</h5>
            <h3>Request Description :${description}</h3>`;
            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        }
        mailOptions.to = data[0].email;
        mailOptions.subject = 'New Service Request ';
        mailOptions.html = `<html><body><h1>New service request added added</h1>
            <h3>Details of service</h3>
            <h5> Owner Email: ${contact.owner}</h5>
            <h5>Owner Name: ${contact.ownerName}</h5>
            <h5>Contact First Name : ${contact.firstName}</h5>
            <h5>Contact Last Name : ${contact.lastName}</h5>
            <h5>Contact Email : ${contact.email}</h5>
            <h5>Contact Company : ${contact.company}</h5>
            <h5>Contact Title : ${contact.title}</h5>
            <h5>Contact Phone Number : ${contact.phone}</h5>
            <h3>Request Description :${description}</h3>`;
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
        client.close();
        res.status(200).json({
            message: 'Service Request created'
        });
    }
});

module.exports = router;