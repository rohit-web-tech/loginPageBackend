const express = require('express');
const app = express() ;
const cors = require('cors') ;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require("path");
const dotenv = require('dotenv');
dotenv.config({path:'config.env'});
const port = 80;

app.use(cors())
app.use(bodyParser.json())
connectDb().catch(err=>console.log(err)) ;

async function connectDb(){ 
    await mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.database, { 
        useUnifiedTopology: true,
        useNewUrlParser: true
    });
    console.log("db connected"); 
}


const signUpSchema = new mongoose.Schema({
    userName : String,
    userEmail : String ,
    userNum : Number ,
    userPassword : String
})
const userSignUpDetail = mongoose.model('userSignUpDetail',signUpSchema);


app.post('/setSignUpData',async(req,res)=>{
    let emails = await userSignUpDetail.find({userEmail:req.body.signUpEmail});
    if(req.body.signUpEmail != undefined && req.body.signUpName != undefined && req.body.signUpNumber !=undefined && req.body.signUpPassword !=undefined){
        if(emails == ""){
            let data = new userSignUpDetail() ;
            data.userName = req.body.signUpName ;
            data.userEmail = req.body.signUpEmail ;
            data.userNum = req.body.signUpNumber ;
            data.userPassword = req.body.signUpPassword ;
            await data.save();
            res.json("success");
        }else {
            res.json("Email Already Exist !! Please Login.")
        }
    }else{
        res.json("All Feilds are Required !!") ;
    }
})

app.post('/login', async(req,res)=>{
    let doc = await userSignUpDetail.find({userEmail:req.body.loginEmail}); 
    if(req.body.loginEmail != undefined && req.body.loginPassword !=undefined){
        if(doc != "" ){
            if(req.body.loginPassword==doc[0].userPassword){
                res.json({message : "success",id:doc[0]._id});
            }else{
                res.json("Entered Password Is Incorrect!!")
            }
        }else{
            res.json("Email Not Exist !! Please Sign Up First.")
        }
    }else{
        res.json("All Feilds Are Required!!")
    }
})

app.post('/showUser', async(req,res)=>{
    let doc = await userSignUpDetail.find({_id:req.body.id}); 
    if(doc!=''){
        res.json(doc[0].userName);
    }else{
        res.json("");
    }
})

app.get('/showUser', async(req,res)=>{
    let doc = await userSignUpDetail.find({}); 
        res.json(doc);
})

app.listen(port,()=>{
    console.log(`Server is running on port : ${port}`) ;
})