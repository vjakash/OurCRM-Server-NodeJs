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

// updateleadstatus route.
router.put('/', [authenticate, accessVerification("update")], async(req, res) => {
    let { leadId, leadStatus } = req.body;
    if (leadId === undefined || leadStatus === undefined) {
        res.status(400).json({
            message: 'Required Fields missing'
        });
    } else {
        let client = await mongodb.connect(dbURL, { useUnifiedTopology: true }).catch(err => { throw err });
        let db = client.db('crm');
        leadId = new ObjectId(leadId);
        let data = await db.collection('leads').find({ '_id': leadId }).toArray().catch(err => { throw err });
        await db.collection('leads').updateOne({ '_id': leadId }, { $set: { leadStatus } }).catch(err => { throw err });
        console.log(data);
        let managers = await db.collection('users').find({ userType: "manager" }).toArray().catch(err => { throw err; });
        for (let i of managers) {
            mailOptions.to = i.email;
            mailOptions.subject = 'Lead status update';
            mailOptions.html = `<html><body><h1>Lead Status Updated</h1>
            <p>Lead status updated from <b>${data[0].leadStatus}</b> to <b>${leadStatus}</p>
            <h3>Details of lead</h3>
            <h5>Lead Owner Email: ${data[0].owner}</h5>
            <h5>Lead Owner Name: ${data[0].ownerName}</h5>
            <h5>First Name : ${data[0].firstName}</h5>
            <h5>Last Name : ${data[0].lastName}</h5>
            <h5>Email : ${data[0].email}</h5>
            <h5>Company : ${data[0].company}</h5>
            <h5>Title : ${data[0].title}</h5>
            <h5>Phone Number : ${data[0].phone}</h5>
            <h5>Lead Status : ${data[0].leadStatus}</h5>`;
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
            mailOptions.subject = 'Lead status update';
            mailOptions.html = `<html><body><h1>New Status updated</h1>
            <p>Lead status updated from <b>${data[0].leadStatus}</b> to <b>${leadStatus}</p>
            <h3>Details of lead</h3>
            <h5>Lead Owner Email: ${data[0].owner}</h5>
            <h5>Lead Owner Name: ${data[0].ownerName}</h5>
            <h5>First Name : ${data[0].firstName}</h5>
            <h5>Last Name : ${data[0].lastName}</h5>
            <h5>Email : ${data[0].email}</h5>
            <h5>Company : ${data[0].company}</h5>
            <h5>Title : ${data[0].title}</h5>
            <h5>Phone Number : ${data[0].phone}</h5>
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
            message: 'Lead Status updated'
        });
    }
});

module.exports = router;