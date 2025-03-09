const mongoose = require("mongoose")
const config = require("config")

mongoose
.connect(`${config.get("MONGODB_URL")}/e-commerce-web`)
.then(function(){
    console.log("connected to server")
})
.catch(function(error){
    console.log(error)
})

module.exports = mongoose.connection ; 
