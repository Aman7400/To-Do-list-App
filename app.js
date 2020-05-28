//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-aman:whypassword123@cluster0-eqrye.mongodb.net/todolistdb",{useNewUrlParser:true,useUnifiedTopology: true});

const itemSchema = {
  name : String
};

const newListSchema = {
  name : String ,
  items : [itemSchema]
};

const List = mongoose.model("List",newListSchema);

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
  name : "Welcome to Your toDoList !!"
}
);
const item2 = new Item({
  name : "Press + to add new items."
});

const item3 = new Item({
  name : "<----Press this to delete item."
});

const defaultItems = [item1,item2,item3];






app.get("/", function(req, res) {
  Item.find({},function(err,result){
    if(result.length===0){

      Item.insertMany(defaultItems,function(err){
  if(err){
    console.log(err);
    
  }
  else
  {
    console.log("Successfully added items in Db.");
    
   }
   });
   res.redirect("/");

    }
    else{
      res.render("list", {listTitle: "Today", newListItems: result});
    }
 
   

  
});

 
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listname = req.body.list;

  const newItem = new Item({
    name : itemName
  });

  if(listname === "Today"){
    newItem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name :listname},function(err,foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/"+listname);
    });
  }

  
 
});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("Item deleted Succesfully");
        res.redirect("/");
        
      }
      
    });
  }
  else{
    List.findOneAndUpdate({name : listName},{$pull:{items :{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }


  
});

app.get("/:customListName",function(req,res){
  const newListName = _.capitalize(req.params.customListName);

  List.findOne({name:newListName},function(err,foundList){
    if(!err)
    {
      if(!foundList){
       //create list
       const list = new List({
        name : newListName,
        items : defaultItems
      });
       list.save();
       res.redirect("/" + newListName );
       
      
      }
      else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        
      }
    }
  });

  

  
});



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
