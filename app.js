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

// connect/create to db + read todo list
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});
const todoItemsSchema = {
  name: String
};
const TodoItem = mongoose.model("TodoItem", todoItemsSchema);

// db handlers
function addTodoItem(newItem) {
  const item = new TodoItem ({
    name: newItem
  });
  item.save();
}

function deleteTodoItem(itemName) {
  TodoItem.findOneAndDelete({ name: itemName }, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Successfully deleted " + itemName);
    }
  });
}

// endpoints
app.get("/", function(req, res){
  TodoItem.find({}, function(err, foundItems) {
    res.render("index", {
      newListItems: foundItems,
      listTitle: date.getDate()
    });
  });
});

app.post("/", function(req, res){
  if (req.body.newItem !== "") {
    addTodoItem(req.body.newItem);
  }
  res.redirect("/");
});

app.post("/delete", function(req, res) {
  deleteTodoItem(req.body.checkbox);
  res.redirect("/");
});

app.listen(3000, function() {
  console.log("Server is running at port 3000");
});
