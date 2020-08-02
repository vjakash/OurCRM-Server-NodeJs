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

// leadconfirmed route.
router.put('/', [authenticate, accessVerification("edit")], async(req, res) => {
    let { leadId, leadStatus, revenue } = req.body;
    if (leadId === undefined || leadStatus === undefined || revenue === undefined) {
        res.status(400).json({
            message: 'Required Fields missing'
        });
    } else {
        let client = await mongodb.connect(dbURL, { useUnifiedTopology: true }).catch(err => { throw err });
        let company = req.email.split("@");
        company = company[1].split(".")[0];
        let db = client.db(company);
        leadId = new ObjectId(leadId);
        let data = await db.collection('leads').find({ '_id': leadId }).toArray().catch(err => { throw err });
        await db.collection('leads').updateOne({ '_id': leadId }, { $set: { leadStatus, qoutedRevenue: revenue, orderConfirmed: false } }).catch(err => { throw err });
        // console.log(data);
        let ownerData = await db.collection('users').find({ email: data[0].owner }).toArray().catch(err => { throw err });
        // console.log(ownerData);
        let managers = await db.collection('users').find({ email: ownerData[0].manager }).toArray().catch(err => { throw err; });
        for (let i of managers) {
            mailOptions.to = i.email;
            mailOptions.subject = 'Lead confirmation initialized';
            mailOptions.html = `<html><body><h1>Lead confirmed</h1>
            <h3>Details of lead</h3>
            <h1>Revenue: $ ${revenue}</h1>
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
                    console.log('lead status sent to manager  Email info: ' + info.response);
                }
            });
        }
        mailOptions.to = data[0].email;
        mailOptions.subject = 'Order Confirmation';
        mailOptions.html = `<h1>Order Confirmation Mail</h1>
            <p>Thank you for choosing our service,please confirm your order</p>
            <h3>Terms & Conditions</h3>
            <ul>
                <li>jgchchytdyrdyrdy</li>
                <li>jgchchytdyrdyrdy</li>
                <li>jgchchytdyrdyrdy</li>
                <li>jgchchytdyrdyrdy</li>
                <li>jgchchytdyrdyrdy</li>
                <li>jgchchytdyrdyrdy</li>
                <li>jgchchytdyrdyrdy</li>
            </ul>
            <h1>Price: $ ${revenue}</h1>
            <a href="${process.env.urldev}/#/confirmorder/${company}/${data[0]['_id']}"><button>Click to confirm</button></a>
            `;
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('lead status sent to admin  Email info ' + info.response);
            }
        });

        client.close();
        res.status(200).json({
            message: 'Lead confirmed'
        });
    }
});

module.exports = router;