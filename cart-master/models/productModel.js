const mongoose = require("mongoose")


const ProductModel = mongoose.Schema({
    Image : Buffer,
    Name : String , 
    Price : Number , 
    Discount : {
        type : Number , 
        default : 0
    },
    BGcolor: String , 
    PanelColor : String ,
    TextColor : String
})


module.exports = mongoose.model("ProductDetails" , ProductModel  )


