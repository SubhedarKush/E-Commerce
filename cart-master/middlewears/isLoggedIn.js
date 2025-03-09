var jwt = require('jsonwebtoken');

const userModel = require("../models/userModel");

const isLoggedIn = async function(req,res,next){
    try{
        if (!req.cookies.token){
            return res.render("login",{ alertMessage : "you need to login first"})
    }
    else{
        let decoded = jwt.verify(req.cookies.token , "TOKEN_KEY" );

        let user = await userModel 
        .findOne({email : decoded.email})
        .select("-password")

        if(!user){
            return res.render("login" , {alertMessage : "user not found. Please log in again"})
        }

        req.user = user ;
        next();
    }
}
catch (error) {
    console.log(error)
    res.render("login" , {alertMessage : "Session expired. Please log in again"})
}

}

module.exports = isLoggedIn;
