# MongoDB setup

## Installation

See The Installation Steps : https://docs.mongodb.com/manual/tutorial/getting-started/

## Setup

Create a **data\db** folder in the path where your mongoDb is stored:
	
	mkdir data\db


Start mongo server on localhost port:- 27017 (default):
    
    mongod


Connect to the server using node script and make your collection:
	
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


# ReactJS Socket.io Chat Application

See This Blog Post : [ReactJS and Socket.IO Chat Application](http://danialk.github.io/blog/2013/06/16/reactjs-and-socket-dot-io-chat-application/)

## Running it

First, grab the dependencies:

    npm install

Build the applicaiton
	
	npm run build

Then run the app like so:

    npm start

And navigate to `localhost:3000` and chat !
