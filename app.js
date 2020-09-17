//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ =require("lodash");
mongoose.connect('mongodb+srv://admin-pranish:pran111@cluster0-dvza2.mongodb.net/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const itemschema={
name:String
};
const Item=mongoose.model("Item",itemschema);
const Item1=new Item({
name:"Welcome To your To-Do-List"
});
const Item2=new Item({
name:"Hit The + Button To Add New Item"
});
const Item3=new Item({
name:"<-- Hit This To Delete The Item"
});
const defaultitem=[Item1,Item2,Item3];

const listSchema={
  name:String,
  items:[itemschema]
}
const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {

Item.find({},function(err,foundItems){
  if (foundItems.length===0) {
    Item.insertMany(defaultitem,function(err){
      if (err) {
        console.log(err);
      } else {
        console.log("Sucessfull");
      }
      res.redirect("/")
    });
  }else(
    res.render("list", {listTitle: "Today", newListItems: foundItems})

  )

});

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listname =req.body.list;

  const item= new Item({
    name: itemName,
  });
  if (listname==="Today") {
    item.save();
    res.redirect("/")
  }
  else{
    List.findOne({name: listname},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listname);
    });

  }

});
app.get("/:listname",function(req,res){
  const listname= _.capitalize(req.params.listname);
  List.findOne({name:listname},function(err,foundList){
    if(!err){
      if(!foundList){
        const list= new List({
          name:listname,
          items:defaultitem
        });
        list.save();
        res.redirect("/"+listname);
      }
      else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  });

});
app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }


});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started on port 3000");
});
