const OrderPlacedSchema = new mongoose.Schema({
    Name: [String],
    Desciption: [String],
    Price : [Number]
  });

  const Placed = mongoose.model("placed", OrderPlacedSchema , "oreder-placed");

  app.get("/yourOrder", async function(req,res){
    const Place = await Placed.find({});
    res.render("yourOrder", {
      buyOrder: Place,
    });
  })

  app.post("/yourOrder", async function(req,res){
    const place = new Placed({
        Name: req.body.ShoeName,
        Desciption: req.body.ShoeDescription,
        Price : req.body.Shoeprice
      });
    
      try {
        await place.save();
        res.redirect("/yourOrder");
      } catch (err) {
        console.error("Error:", err);
        res.redirect("/YourOrder");
      }
  })