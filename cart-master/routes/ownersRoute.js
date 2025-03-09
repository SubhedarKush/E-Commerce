const express = require("express");
const router = express.Router();

const ownerModel = require("../models/admin")

router.get("/", function(req, res) {
    res.send("hi its working");
});

if (process.env.NODE_ENV === "development") {
    router.post("/create", async function(req, res) {
        let owners = await ownerModel.find()
        if(owners.length > 0){
            return res.send("cannot create a owner")
        }
        else{
            let {fullName , email , password} = req.body
            let CreatedOwner = await ownerModel.create({
                fullName ,
                email ,
                password
            })
            res.send(CreatedOwner);
        }
    });
}








module.exports = router;

