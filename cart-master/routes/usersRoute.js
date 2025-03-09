const express = require("express")
const app = express.Router();
const cookieParser = require("cookie-parser")
const bcrypt = require("bcrypt")
var jwt = require('jsonwebtoken');

const userModel = require("../models/userModel")

app.get("/" , function(req,res){
    res.render("login");
})

app.get("/register" , function(req,res){
    res.render("register")
})

app.post("/register",async function(req,res){
    try {
        let {fullName , password , email} = req.body ; 
        let userfind = await userModel.findOne({email : email})

        if(userfind){
            res.status(401).render("login")
        }

        else{
            bcrypt.genSalt(10 , function(err , salt){

                bcrypt.hash(password , salt , async function(err , hash){
    
                    if(err){
                        return res.status(500).send({ error: "Error hashing password" });                
                    }
    
                    else{let user = await userModel.create({
                        fullName ,
                        password : hash,
                        email,
                    })
    
                    var token = jwt.sign({ email: user.email , userid : user._id }, "TOKEN_KEY");
                    res.cookie("token" , token);
                    res.render("login") ;
                }                
                    })
    
                })
            }
        }
        
    catch (error) {
            console.log(error)   
        }
})  

app.post("/login", async function(req,res){
    let {email , password} = req.body ;

    let user = await userModel.findOne({email : email});

    if(!user){
        alert("user or password is incorrect")
    }
    else{
        bcrypt.compare(password , user.password , function(err,result){
            if(result){
                var token = jwt.sign({ email: user.email , userid : user._id }, "TOKEN_KEY");
                res.cookie("token" , token);
                res.render("homepage")
            }
            else{
                alert("email or password is incorrect")
            }
        })
    }
})


module.exports = app;