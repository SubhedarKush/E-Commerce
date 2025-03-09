const mongoose = require("mongoose")


const UserModel = mongoose.Schema({
    fullName: {
        type: String,
        minLength : 3,
        trim : true,
    },
    email: String,
    password: String,
    Cart:[{
        type : mongoose.Schema.Types.ObjectId,
        ref : "ProductDetails",
    }],
    Orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductDetails",
        default: []
    }],
    
    Quantity : [{
        type : mongoose.Schema.Types.ObjectId,
        default : 1,
        ref : "ProductDetails"
        
    }],
    Contact : Number,
    Picture : Buffer

})


module.exports = mongoose.model("UserDetails" , UserModel  )

