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
    exports.history = history;
    console.log(
      "Connection Established With Chat History Db For Add Chat To DB"
    );
  }
});

// Keep track of which names are used so that there are no duplicates
var userNames = (function() {
  var names = {};

  var claim = function(name) {
    if (!name || names[name]) {
      return false;
    } else {
      names[name] = true;
      return true;
    }
  };

  // find the lowest unused "guest" name and claim it
  var getGuestName = function() {
    var name,
      nextUserId = 1;

    do {
      name = "Guest " + nextUserId;
      nextUserId += 1;
    } while (!claim(name));

    return name;
  };

  // serialize claimed names as an array
  var get = function() {
    var res = [];
    for (user in names) {
      res.push(user);
    }

    return res;
  };

  var free = function(name) {
    if (names[name]) {
      delete names[name];
    }
  };

  return {
    claim: claim,
    free: free,
    get: get,
    getGuestName: getGuestName
  };
})();

// export function for listening to the socket
module.exports = function(socket) {
  var name = userNames.getGuestName();

  // send the new user their name, list of users and the room history
  socket.emit("init", {
    name: name,
    users: userNames.get()
  });

  // notify other clients that a new user has joined

  socket.broadcast.emit("user:join", {
    name: name
  });

  socket.on("send:message", function(data) {
    //Find If Room Id Is Present
    history.findOne({ chatRoom: "1" }, function(err, result) {
      if (err) {
        console.log("Sorry some error occured");
      } else {
        var current_chat = [];

        if (result != null) {
          console.log(result.history);
          current_chat = result.history;
        } else {
          //If room id not present then create a new one
          console.log("No Room Found , therefore creating a new one");
          history.insertOne({ chatRoom: "1", history: [] }, function(
            err,
            result
          ) {
            if (err) {
              console.log("Error in creating chat room with id 1");
            } else {
              console.log("Successfully Created Chat Room With Id 1!!");
            }
          });
        }

        //Create history array
        current_chat.push({
          user: name,
          message: data.text
        });

        //Update Room History
        history.updateOne(
          { chatRoom: "1" },
          { $set: { history: current_chat } },
          function(err, result) {
            if (err) {
              console.log("Sorry Some error occured while updating");
            } else {
              console.log("Successfully Updated room history!!");
            }
          }
        );
      }
    });

    // broadcast a user's message to other users
    socket.broadcast.emit("send:message", {
      user: name,
      text: data.text
    });
  });

  // validate a user's name change, and broadcast it on success
  socket.on("change:name", function(data, fn) {
    if (userNames.claim(data.name)) {
      var oldName = name;
      userNames.free(oldName);

      name = data.name;

      socket.broadcast.emit("change:name", {
        oldName: oldName,
        newName: name
      });

      fn(true);
    } else {
      fn(false);
    }
  });

  // clean up when a user leaves, and broadcast it to other users
  socket.on("disconnect", function() {
    socket.broadcast.emit("user:left", {
      name: name
    });
    userNames.free(name);
  });
};
