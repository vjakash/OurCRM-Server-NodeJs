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
let permission = require('../../middlewares/permission.js');

// managerconfirmed route.
router.post('/', [authenticate, permission(["admin", "manager"])], async(req, res) => {
    let { leadId, company } = req.body;
    if (leadId === undefined) {
        res.status(400).json({
            message: 'Required Fields missing'
        });
    } else {
        let client = await mongodb.connect(dbURL, { useUnifiedTopology: true }).catch(err => { throw err });
        let db = client.db(company);
        leadId = new ObjectId(leadId);
        let data = await db.collection('leads').find({ '_id': leadId }).toArray().catch(err => { throw err });
        await db.collection('users').updateOne({ email: data[0].owner }, [{ $set: { totalRevenue: { $sum: ["$totalRevenue", data[0].qoutedRevenue] } } }]).catch(err => { throw err });
        await db.collection('leads').updateOne({ '_id': leadId }, { $set: { orderConfirmed: true, leadStatus: 'Completed' } }).catch(err => { throw err });
        // console.log(data);
        let ownerData = await db.collection('users').find({ email: data[0].owner }).toArray().catch(err => { throw err });
        mailOptions.to = data[0].email;
        mailOptions.subject = 'Order Confirmed';
        mailOptions.html = `<html><body><h1>Order confirmed </h1>
            <p>We are happy to inform you that your order is confirmed</p>
            <h6>Thank you..continue using our service</h6>`;
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('lead status sent to manager  Email info: ' + info.response);
            }
        });

        mailOptions.to = data[0].owner;
        mailOptions.subject = 'Order Completed';
        mailOptions.html = `<h1>Order Confirmed by ${ownerData[0].managerName}(Manager)</h1>
            <p>Please follow up with your manager</p>
            <br><br>
            <h3>Details of lead</h3>
            <h5>Lead Owner Email: ${data[0].owner}</h5>
            <h5>Lead Owner Name: ${data[0].ownerName}</h5>
            <h5>First Name : ${data[0].firstName}</h5>
            <h5>Last Name : ${data[0].lastName}</h5>
            <h5>Email : ${data[0].email}</h5>
            <h5>Company : ${data[0].company}</h5>
            <h5>Title : ${data[0].title}</h5>
            <h5>Phone Number : ${data[0].phone}</h5> `;
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('lead status sent to admin  Email info ' + info.response);
            }
        });

        client.close();
        res.status(200).json({
            message: 'Order confirmed'
        });
    }
});

module.exports = router;