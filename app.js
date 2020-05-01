// app.js
// load the things we need
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/modules/date.js");
const mongoose = require("mongoose");
const _ = require('lodash');

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// mongoose db connection
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});
mongoose.set('useFindAndModify', false);

// mongoose models
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
        const list = new List ({
          name: listName,
          items: [item]
        });
        list.save();
      } else {
        // add to an existing list
        foundList.items.push(item);
        foundList.save();
      }
    }
  });
}

function deleteTodoItem(listName, itemName) {
  List.findOneAndUpdate({name: listName}, {$pull: {items: {name: itemName}}}, function(err, foundList) {
    console.log(foundList);
  });
}

// endpoints
app.get("/:listName", function(req, res) {
  List.findOne({name: _.capitalize(req.params.listName)}, function(err, foundList) {
    if (!err) {
      res.render("index", {
        newListItems: (!foundList ? [] : foundList.items),
        listTitle: _.capitalize(req.params.listName)
      });
    }
  });
});

app.post("/:listName", function(req, res){
  if (req.body.newItem !== "") {
    addTodoItem(_.capitalize(req.params.listName), req.body.newItem);
  }
  res.redirect("/" + _.capitalize(req.params.listName));
});

app.post("/:listName/delete", function(req, res) {
  deleteTodoItem(_.capitalize(req.params.listName), req.body.checkbox);
  res.redirect("/" + _.capitalize(req.params.listName));
});

app.listen(3000, function() {
  console.log("Server is running at port 3000");
});
