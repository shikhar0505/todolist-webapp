// app.js
// load the things we need
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/modules/date.js");
const mongoose = require("mongoose");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// mongoose models
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});
const itemSchema = {
  name: String
};
const Item = mongoose.model("Item", itemSchema);

const listSchema = {
  name : String,
  items: [itemSchema]
};
const List = mongoose.model("List", listSchema);

// db handlers
function addTodoItem(listName, itemName) {
  const item = new Item ({
    name: itemName
  });

  List.findOne({name: listName}, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        // create a new list
        console.log("creating new list");
        const list = new List ({
          name: listName,
          items: [item]
        });
        list.save();
      } else {
        // add to an existing list
        console.log("adding to existing list");
        foundList.items.push(item);
        foundList.save();
      }
    }
  });
}

function deleteTodoItem(listName, itemName) {
  List.findOneAndUpdate({name: listName}, {$pull: {items: {name: itemName}}}, function(err, foundList) {

  });
}

// endpoints
app.get("/:listName", function(req, res) {
  List.findOne({name: req.params.listName}, function(err, foundList) {
    if (!err) {
      res.render("index", {
        newListItems: (!foundList ? [] : foundList.items),
        listTitle: req.params.listName
      });
    }
  });
});

app.post("/:listName", function(req, res){
  if (req.body.newItem !== "") {
    addTodoItem(req.params.listName, req.body.newItem);
  }
  res.redirect("/" + req.params.listName);
});

app.post("/:listName/delete", function(req, res) {
  deleteTodoItem(req.params.listName, req.body.checkbox);
  res.redirect("/" + req.params.listName);
});

app.listen(3000, function() {
  console.log("Server is running at port 3000");
});
