const express = require("express")
const cookieParser = require("cookie-parser")
const bcrypt = require("bcrypt")
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser')
const path = require('path');
const moment = require('moment');




const db = require("./config/mongooseConnect");
const adminModel = require("./models/admin") ;
const productModel = require("./models/productModel") ;
const userModel = require("./models/userModel"); 
const upload = require("./config/multer-config")

// middle wears
const isLoggedIn = require("./middlewears/isLoggedIn")


require('dotenv').config();


const ownersRoute = require("./routes/ownersRoute"); 
const usersRoute = require("./routes/usersRoute");
const productsRoute = require("./routes/usersRoute");

const { error } = require("console");

const app = express()

app.set("view engine" , "ejs")
app.use(express.urlencoded({extended: true}))
app.use(express.static("public"))
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())

const aboutContent_p1 = "Welcome to Cart, your one-stop destination for all your e-commerce needs. Founded by Amay Porwal, a passionate 2nd-year mechanical engineering student at MANIT Bhopal, Cart brings you a seamless online shopping experience."
const aboutContent_p2 = "Here, you can buy and sell products with ease. Our platform offers customizable options for sellers, allowing them to upload images in any format, edit layout colors, and change font styles. Sellers can also set product descriptions, prices, and create attractive discounts for customers. At Cart, we are dedicated to providing a user-friendly and versatile marketplace for both buyers and sellers."
const aboutContent_p3 = "Explore Cart today and discover the future of online shopping!";



app.get("/", function(req,res){
    res.render("login", {alertMessage : ""})
})

app.get("/about" , isLoggedIn , async function(req,res){
    res.render("about" , {p1 : aboutContent_p1 , p2 :aboutContent_p2 , p3 :aboutContent_p3})
})

app.get("/login", function(req,res){
    res.render("login" , {alertMessage : ""})
})

app.post("/login", async function(req,res){
    res.render("login" , {alertMessage : ""})
})

app.get("/register", function(req,res){
    res.render("register")
})


app.post("/register", async function(req,res){
    try {
        let {fullName , password , email , PhoneNumber} = req.body ; 
        let userfind = await userModel.findOne({email : email})

        if (!fullName || !password || !email || !PhoneNumber) {
            return res.status(400).redirect("/register");
        }

        else{
        
        if(userfind){
            res.status(401).redirect("/login")
        }

        else{
            bcrypt.genSalt(10 , function(err , salt){

                bcrypt.hash(password , salt , async function(err , hash){
    
                    if(err){
                        return res.status(500).send({ error: "Error hashing password" });                
                    }
    
                    else{
                        let user = await userModel.create({
                        fullName ,
                        password : hash,
                        email,
                        Contact : PhoneNumber
                    })
    
                    var token = jwt.sign({ email: user.email , userid : user._id }, "TOKEN_KEY");
                    res.cookie("token" , token);
                    res.redirect("/login") ;
                }                
                    })
    
                })
            }
        }}
        
    catch (error) {
            console.log(error)   
        }
})  





app.get("/homepage", isLoggedIn , async function(req,res){
    let products = await productModel.find();

    res.render("homepage" , {products})
    })

app.post("/homepage"  , async function(req,res){

    let {email , password} = req.body ;
    let user = await userModel.findOne({email : email});


    if(!user){
        res.render("login" , {alertMessage : "emaill not registered" } )

    }
    else{
        bcrypt.compare(password , user.password , function(err,result){
            if(result){
                var token = jwt.sign({ email: user.email , userid : user._id }, "TOKEN_KEY");
                res.cookie("token" , token);
                res.redirect("/homepage" )
            }
            else{

                res.render("login" , {alertMessage : "password is incorrect"} )

            }
        })
    }
})




app.get("/adminLogin" , isLoggedIn , async function(req,res){
    res.render("adminlogin"  , {alertMessage : ""})
})


app.post("/adminLogin" ,isLoggedIn , async function(req,res){

    try{
        let data = jwt.verify(req.cookies.token , "TOKEN_KEY" );


    let {email , password} = req.body;


    if(!email || !password){
        return res.render("adminlogin" , {alertMessage : "Fill all the details"})

    } 
    else{
        let user = await userModel.findOne({email : email})

        if(!user){
            return res.render("adminlogin" , {alertMessage : "you have to register yourself as a user first"})
        }
        else{   

            bcrypt.compare(password , user.password , async function(err,result){

                if(result){


                    let admin = await adminModel.findOne({email : email})

                if(admin){
                    var token = jwt.sign({ email: user.email , userid : user._id }, "TOKEN_KEY");
                    res.cookie("token" , token);
                    return     res.redirect("/admin")

                }
    
                else{
    
                    bcrypt.genSalt(10 , function(err , salt){
    
                        bcrypt.hash(password , salt , async function(err , hash){
            
                            if(err){
                                return res.status(500).send({ error: "Error hashing password" });                
                            }
            
                            else{let user = await adminModel.create({
                                password : hash,
                                email,
                            })
                            var token = jwt.sign({ email: user.email , userid : user._id }, "TOKEN_KEY");
                            res.cookie("token" , token);

                            res.redirect("/admin")
                        }                
                            })
            
                        })
    
                }
                }
                else{
                return res.render("adminlogin" , {alertMessage : "password is incorrect"})
            }   
            })     
        }
    }
}

catch{
    console.log(error)
}
})



app.get("/cart", isLoggedIn, async function(req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email }).populate('Cart');
        
        // Compute quantities
        let quantities = {};
        user.Quantity.forEach(id => {
            if (!quantities[id]) {
                quantities[id] = 1;
            } else {
                quantities[id]++;
            }
        });

        res.render("cart", { user, quantities });
    } catch (error) {
        console.log(error);
        res.redirect("/cart");
    }
});

app.get("/AddToCart/:productID" , isLoggedIn , async function(req,res){
    let user = await userModel.findOne({email : req.user.email}).populate("Quantity");
    user.Cart.push(req.params.productID);
    user.Quantity.push(req.params.productID);

    await user.save();
    res.redirect("/cart");
})



app.get("/PlaceOrder/:productID" , isLoggedIn , async function(req,res){
    let user = await userModel.findOne({email : req.user.email}).populate("Orders");
    let product = await productModel.findById( req.params.productID);
    let expectedArrivalDate = moment().add(4, 'days').format('MMMM Do YYYY');
    

    res.render("PlaceOrder" , {product , user , expectedArrivalDate } )
})

app.get("/PlaceOrder" , isLoggedIn , async function(req,res){
    let user = await userModel.findOne({email : req.user.email}).populate("Orders");
    let product = await productModel.find();
    let expectedArrivalDate = moment().add(4, 'days').format('MMMM Do YYYY');
    

    res.render("PlaceOrder" , {product , user , expectedArrivalDate } )
})


app.get("/CancelOrder/:ProductID" , isLoggedIn , async function(req,res){
    let user = await userModel.findOne({ email: req.user.email }).populate('Orders');
    let product = await productModel.findById(req.params.ProductID);



    user.Orders.pull(product._id);
    await user.save();

    res.redirect("/PlaceOrder");
})

app.post("/PlaceOrder/:productID" , isLoggedIn , async function(req,res){
    let user = await userModel.findOne({email : req.user.email}).populate("Orders");
    user.Orders.push(req.params.productID);
    await user.save();

    res.redirect("/PlaceOrder/" + req.params.productID  )
})



app.get("/addQuantity/:productID", isLoggedIn, async function(req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email }).populate('Quantity');
        let product = await productModel.findById(req.params.productID);


    if (user && product) {
        
        user.Quantity.push(product._id);
        await user.save();
    }

    res.redirect("/cart");
    } 
    catch (error) {
        console.log(error);
        res.redirect("/cart")
    }
    
});



app.get("/subQuantity/:productID", isLoggedIn, async function(req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email }).populate('Quantity');
        let product = await productModel.findById(req.params.productID);


    if (user && product) {
        
            let productIdStr = product._id.toString();
            
            let index = user.Quantity.findIndex(quantity => quantity._id.toString() === productIdStr);
            
            if (index !== -1) {
                user.Quantity.splice(index, 1);
                await user.save();
            }
    }

    res.redirect("/cart");
    } 
    catch (error) {
        console.log(error);
        res.redirect("/cart")
    }
    
});

app.get("/delete/:productID", isLoggedIn, async function(req, res) {

    try {
    let user = await userModel.findOne({ email: req.user.email }).populate('Quantity');
    let product = await productModel.findById(req.params.productID);



    user.Quantity.pull(product._id);
    await user.save();
    await userModel.updateOne({ _id: user._id },{ $pull: { Cart: req.params.productID }});

    res.redirect("/cart")

    } catch (error) {
        console.log(error);
        res.redirect("/cart")
    }
    
});




app.get("/VendItem" , isLoggedIn , async function(req,res){
    res.render("VendItem" )
})

app.post("/VendItem" , isLoggedIn , async function(req,res){
    res.redirect("/admin")
})


app.get("/discountedProducts" , isLoggedIn , async function(req,res){
    let products = await productModel.find();
    let productSorted = products.sort((a, b) => a.Discount - b.Discount)

    res.render("discountedProducts", { products : productSorted});
})



app.get("/NewCollection" , isLoggedIn , async function(req,res){
    let products = await productModel.find();

    res.render("NewCollection", { products});
})

app.get("/deleteAllProducts" , isLoggedIn , async function (req,res) {
    try{
    let admin = await adminModel.findOne({email : req.user.email});

    let length = admin.Products.length ;
    
    
    let product = await productModel.find();

    for (let i = 0; i < length; i++) {
        if(product._id !== admin.Products._id ){
            await productModel.deleteOne({_id: admin.Products._id});
            await product.save();
        }
        
    }
    await productModel.deleteMany({_id: admin.Products._id});
    admin.Products = [];
    await admin.save();

    res.redirect("/admin")}
    catch(error){
        console.log(error);
        res.redirect("/admin")
    }
})


app.get("/admin" ,isLoggedIn ,  async function(req,res){

    try {
        let admin = await adminModel.findOne({email : req.user.email}).populate("Products");

    res.render("admin", { products : admin.Products , admin })
    
    } catch (error) {
       console.log(error)
    }
    
    
})


app.post("/productCreated" , isLoggedIn ,  upload.single("Image") , async function(req,res){

    try {
        let {Name , Price ,Discount , BGcolor, PanelColor ,TextColor } =  req.body;
       let product = await productModel.create({
        Name ,
        Price ,
        Discount ,
        BGcolor, 
        PanelColor ,
        TextColor,
        Image: Buffer.from(req.file.buffer)
       })

       let admin = await adminModel.findOne({email : req.user.email})
       await admin.Products.push(product._id);
       await admin.save();
       
    res.redirect("/admin")
        
    } catch (error) {
        console.log(error)
    }
     
})




app.get("/AllItems" , isLoggedIn , async function(req,res){
    res.redirect("/admin" )
})



app.get("/profile" , isLoggedIn, upload.single("ProfileImage") , async function(req,res){
    let user = await userModel.findOne({email : req.user.email})
    let admin = await adminModel.findOne({email : req.user.email})

    const defaultImage = '/images/defaultuser.webp'; // Change this to your actual default image URL
    const profileImage = user.Picture ? `data:image/png;base64,${user.Picture.toString('base64')}` : defaultImage;


    res.render("profile" , ({user , admin , profileImage}) )
})

app.post("/profile" , isLoggedIn, upload.single("ProfileImage") , async function(req,res){
    let user = await userModel.findOne({email : req.user.email})
    await userModel.create({
        Picture : Buffer.from(req.file.buffer)
    })

    if (req.file) {
        user.Picture = Buffer.from(req.file.buffer);
        await user.save();
    }

    res.redirect("/profile" )
})

app.get("/logout" ,  async function(req,res){
    res.cookie("token" , "");
    res.render("login" ,{alertMessage : ""})
})


app.listen(3000 , function(req,res){
    console.log("server is running on local host 3000")
})




