const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require("path");
const myEmail = process.env.myEmail ;
const port = process.env.port;
const nodemailer = require("nodemailer"); 

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: myEmail,
        pass: process.env.password 
    }
});

function sendEmail(mailOptions) {
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}


app.use(cors());  
app.use(bodyParser.json());
connectDb().catch(err => console.log(err));

async function connectDb() {
    await mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.database, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    });
    console.log("db connected");
}


const signUpSchema = new mongoose.Schema({
    userName: String,
    userEmail: String,
    userNum: Number,
    userPassword: String
})
const userSignUpDetail = mongoose.model('userSignUpDetail', signUpSchema);


app.post('/setSignUpData', async (req, res) => {
    let emails = await userSignUpDetail.find({ userEmail: req.body.signUpEmail });
    if (req.body.signUpEmail != undefined && req.body.signUpName != undefined && req.body.signUpNumber != undefined && req.body.signUpPassword != undefined) {
        if (emails == "") {
            let data = new userSignUpDetail();
            data.userName = req.body.signUpName;
            data.userEmail = req.body.signUpEmail;
            data.userNum = req.body.signUpNumber;
            data.userPassword = req.body.signUpPassword;
            await data.save();
            let mailOptions = { 
                from: myEmail,
                to: req.body.signUpEmail,
                subject: 'Thanks for register on RWT Sign App',
                html: `
              <div style="height:100vh; width:100%; display:flex; justify-content:center;">
        <div style="max-width:800px;text-align: justify; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <h3>Hi,<span style="color:#088178">${req.body.signUpName}</span></h3>
            <p style="color:#414141;">
                Thanks for sing up to my RWT SignUp website! I am excited to have you here. I am a web developer if you want to make a website so you can contact me on <a
                href="mailto:rohitdogra0127@gmail.com">rohitdogra0127@gmail.com</a> and also you can check out my website <a href="https://rohitweb.tech" style="color:#088178 ; text-decoration: none;">RWT</a> and my ongoing ecommerce web project <a href="https://cara.rohitweb.tech" style="color:#088178 ; text-decoration: none;">Cara Ecommerce</a></p>
            <p style="color:#414141;">If you are having any issues while using my website, please do not hesitate to contact me on <a
                    href="mailto:rohitdogra0127@gmail.com">rohitdogra0127@gmail.com</a>.I am always at your service
                to help you with any questions or concerns you may have. I am committed to providing
                the best possible experience for my customers and will do my best to resolve any issues you may have.Thanks have a good day.</p>
            <h4>Regards from <a href="https://rohitweb.tech" style="color:#088178 ; text-decoration: none;">RWT.</a></h4>
        </div>
    </div>
              `
            };
            sendEmail(mailOptions);
            res.json("success");
        } else {
            res.json("Email Already Exist !! Please Login.")
        }
    } else {
        res.json("All Feilds are Required !!");
    }
})

app.post('/login', async (req, res) => {
    let doc = await userSignUpDetail.find({ userEmail: req.body.loginEmail });
    if (req.body.loginEmail != undefined && req.body.loginPassword != undefined) {
        if (doc != "") {
            if (req.body.loginPassword == doc[0].userPassword) {
                res.json({ message: "success", id: doc[0]._id });
            } else {
                res.json("Entered Password Is Incorrect!!")
            }
        } else {
            res.json("Email Not Exist !! Please Sign Up First.")
        }
    } else {
        res.json("All Feilds Are Required!!")
    }
})

app.post('/showUser', async (req, res) => {
    let doc = await userSignUpDetail.find({ _id: req.body.id });
    if (doc != '') {
        res.json(doc[0].userName);
    } else {
        res.json("");
    }
})

app.listen(port, () => {
    console.log(`Server is running on port : ${port}`);
})