"use strict";

/**
 * Module dependencies.
 */

var express = require("express");
var http = require("http");

//Make User History Model using mongodb
var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/chatDb";

var history;

MongoClient.connect(url, function(err, db) {
  useNewUrlParser: true;
  if (err) {
    console.log("Error Occured while connecting to the database server");
  } else {
    var dbase = db.db("chatDb");
    history = dbase.collection("Chat History");
    console.log("Connection Established With Chat History Db To Get History");
  }
});

var socket = require("./routes/socket.js");

var app = express();
var server = http.createServer(app);

/* Configuration */
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));
app.set("port", 3000);

if (process.env.NODE_ENV === "development") {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
}

//Get Room's Chat History
app.get("/chatHistory", function(req, res) {
  console.log("End point Called!!");
  history.findOne({ chatRoom: "1" }, function(err, result) {
    if (err) {
      console.log("Sorry some error occured");
    } else {
      var current_chat = [];

      if (result != null) {
        console.log(result.history);
        current_chat = result.history;
      }

      res.send({
        chat_history: current_chat
      });
    }
  });
});

/* Socket.io Communication */
var io = require("socket.io").listen(server);
io.sockets.on("connection", socket);

/* Start server */
server.listen(app.get("port"), function() {
  console.log(
    "Express server listening on port %d in %s mode",
    app.get("port"),
    app.get("env")
  );
});

module.exports = app;
