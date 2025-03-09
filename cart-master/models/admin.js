const mongoose = require("mongoose")


const adminModel = mongoose.Schema({
    fullName: {
        type: String,
        minLength : 3,
        trim : true,
    },
    email: String,
    password: String,
    Products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductDetails'
    }],
    Contact : Number,
    Picture : String,    

})


module.exports = mongoose.model("Admin" , adminModel  )

