// jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const mongoose = require("mongoose");
var mongo = require('mongodb');

const About = "E-commerce websites have revolutionized the way consumers and businesses interact, providing a dynamic and convenient platform for online shopping and services. These digital marketplaces offer a vast array of products, ranging from electronics and clothing to groceries and digital content, all accessible from the comfort of one's home. Through innovative features such as personalized recommendations, user reviews, secure payment gateways, and efficient delivery systems, e-commerce sites enhance the shopping experience, making it more personalized and efficient. For businesses, these platforms provide valuable data insights and expanded market reach, enabling growth and customer engagement on a global scale. As technology continues to advance, e-commerce websites are evolving, integrating augmented reality, AI-driven customer service, and seamless omnichannel experiences, further transforming the retail landscape.";
const Services = "We are dedicated to providing a seamless and enjoyable online shopping experience. Our platform offers a diverse selection of high-quality products ranging from the latest fashion trends to cutting-edge electronics and home essentials. With a user-friendly interface, secure payment options, and fast shipping, we ensure that your shopping journey is smooth and hassle-free. Our customer support team is available 24/7 to assist you with any inquiries or concerns, making your satisfaction our top priority. Shop with confidence at [Your E-Commerce Website Name], where convenience meets excellence.";
const Contact = "We value your feedback and are here to assist you with any questions or concerns. Whether you need help with your order, have a question about our products, or want to share your shopping experience, our customer support team is ready to help. You can reach us via email at support@example.com or call our toll-free number at 1-800-123-4567. For quick assistance, visit our Help Center or use our live chat feature available on our website. Your satisfaction is our top priority, and we look forward to hearing from you!";

const app = express();

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/ecommerceorders");
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connected to the database.");
});

const OrderSchema = new mongoose.Schema({
  Name: String,
  description: String,
  Price: Number
});

const OrderPlacedSchema = new mongoose.Schema({
  Name: [String],
  description: [String],
  Price: [Number]
});

const Orders = mongoose.model("Order", OrderSchema);
const Placed = mongoose.model("placed", OrderPlacedSchema, "order-placed");

const buyarray = [];

app.get("/", function(req, res) {
  res.render("login");
});

app.get("/home", function(req, res) {
  res.render("home");
});

app.get("/shoe", function(req, res) {
  res.render("shoe");
});

app.get("/tshirt", function(req, res) {
  res.render("tshirt");
});

app.get("/appliance", function(req, res) {
  res.render("appliance");
});

app.get("/watch", function(req, res) {
  res.render("watch");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.get("/yourOrder", async function(req, res) {
  console.log(buyarray);
  const Place = await Placed.find({});
  res.render("yourOrder", {
    buyOrder: Place,
    buyarray
  });
});

app.post("/search", async function(req, res) {
  const search = req.body.searchBar;

  if (search === "shoe" || search === "appliances" || search === "watch" || search === "tshirt") {
    res.redirect("/" + search);
  } else {
    res.render("notfound");
  }
});

app.get("/cart", async function(req, res) {
  const order = await Orders.find({});
  res.render("cart", {
    orderPlaced: order
  });
});

app.post("/tshirt", function(req, res) {
  res.render("tshirt");
});

app.post("/appliance", function(req, res) {
  res.render("appliance");
});

app.get("/watch", function(req, res) {
  res.render("watch");
});

app.post("/watch", function(req, res) {
  res.render("watch");
});

app.post("/shoe", function(req, res) {
  res.render("shoe");
});

app.post("/delete", async function(req, res) {
  const deleteitem = req.body.removebutton;
  await Orders.findByIdAndDelete(deleteitem);
  res.redirect("/cart");
});

app.post("/yourOrder", async function(req, res) {
  const place = new Placed({
    Name: req.body.ShoeName,
    description: req.body.ShoeDescription,
    Price: req.body.ShoePrice
  });

  try {
    const deleteitem = req.body.addbutton;
    await Orders.findByIdAndDelete(deleteitem);
    await db.collection('order-placed').deleteMany({});
    
    buyarray.push(place);
    await place.save();
    res.redirect("/yourOrder");
  } catch (err) {
    console.error("Error:", err);
    res.redirect("/yourOrder");
  }
});

app.post("/cart", async function(req, res) {
  const order = new Orders({
    Name: req.body.ShoeName,
    description: req.body.ShoeDescription,
    Price: req.body.Shoeprice
  });

  try {
    await order.save();
    res.redirect("/cart");
  } catch (err) {
    console.error("Error:", err);
    res.redirect("/cart");
  }
});

app.post("/info", function(req, res) {
  var name = req.body.Name;
  if (name === "Home") {
    res.render("home");
  } else {
    let content;
    if (name === "About") {
      content = About;
    } else if (name === "Services") {
      content = Services;
    } else if (name === "Contact") {
      content = Contact;
    }
    res.render("info", {
      NameSend: name,
      NameContent: content
    });
  }
});

app.listen(4000, function() {
  console.log("Server is running on local server 4000");
});
