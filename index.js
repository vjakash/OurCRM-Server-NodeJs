let express = require('express');
let cors = require('cors');
let bcrypt = require('bcrypt');
let bodyParser = require('body-parser');

const dotenv = require('dotenv');
dotenv.config();

let mongodb = require('mongodb');
let MongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectID;
let dbURL = process.env.dbURL;


const jwt = require('jsonwebtoken');

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

//appinitialize
const app = express();
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening in port-${port}`)
});

//middleware
app.use(cors());
app.use(bodyParser.json());

//routes imports
let login = require('./routes/login.js');
let register = require('./routes/register.js');
let accountverification = require('./routes/accountverification.js');
let forgotpassword = require('./routes/forgotpassword.js');
let resetpassword = require('./routes/resetpassword.js');

let createlead = require('./routes/leads/createlead.js');
let updatelead = require('./routes/leads/updatelead.js');
let deletelead = require('./routes/leads/deletelead.js');
let listlead = require('./routes/leads/listlead.js');

let createcontact = require('./routes/contacts/createcontact.js');
let updatecontact = require('./routes/contacts/updatecontact.js');
let deletecontact = require('./routes/contacts/deletecontact.js');
let listcontacts = require('./routes/contacts/listcontacts.js');

//routes
app.use('/login', login);
app.use('/register', register);
app.use('/accountverification', accountverification);
app.use('/forgotpassword', forgotpassword);
app.use('/resetpassword', resetpassword);
//routes-leads
app.use('/createlead', createlead);
app.use('/updatelead', updatelead);
app.use('/deletelead', deletelead);
app.use('/listlead', listlead);
//routes-contacts
app.use('/createcontact', createcontact);
app.use('/updatecontact', updatecontact);
app.use('/deletecontact', deletecontact);
app.use('/listcontacts', listcontacts);