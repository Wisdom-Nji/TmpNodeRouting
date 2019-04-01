const net = require('net'),JsonSocket = require('json-socket');
const express = require('express');
var bodyParser = require('body-parser'); 

const app = express();
var collection_of_clients = {};
var messageQueing = {};
app.use(bodyParser.json());

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    res.setHeader('Content-Type', 'application/json');

    // Pass to next layer of middleware
    next();
});


var socketConnection = new net.Server;

socketConnection.on('connection', function(client) {
	client.setKeepAlive(true, 20000);
	client = new JsonSocket(client);
	client.id = Math.floor(Math.random() * 1000);

	collection_of_clients[client.id] = client;
	console.log(`New client with ID| ${client.id}`);
	console.log(`Number of collected clients| ${Object.keys(collection_of_clients).length}`);

	client.on('close', function() {
		console.log(`Deleting client| ${client.id}`);
		delete collection_of_clients[client.id];
		//client.destroy();
	});

	client.on('message', function(data) {
		console.log(`Client(${client.id}) message| ${data}`);
		//data = JSON.parse(data);
		data = JSON.parse(data);
		if(typeof data != "undefined" && typeof data.type != "undefined" && data.type == "confirmation") {
			console.log(`Deleting ${data.messageId}`);
			delete messageQueing[data.messageId];
		}
	});
	/*
	client.on('disconnect', function() {
		console.log(`Disconnecting client| ${client.id}`);
		delete collection_of_clients[client.id];
		client.destroy();
	}); */

	client.on('end', function() {
		console.log(`Client ended| ${client.id}`);
		delete collection_of_clients[client.id];
	});

	/*

	client.on('error', function() {
		console.log(`Error from client| ${client.id}`);
		delete collection_of_clients[client.id];
	});*/

});

socketConnection.on('end', function(){
	console.log("ended");
});

socketConnection.on('disconnect', function() {
	console.log("Disconnected");
});

socketConnection.on('error', function() {
	console.log("Error");
});


app.post('/sms/', function(req, res) {
	//var information = decodeURIComponent(req.body.information);
	var information = req.body;
	console.log(information);
	//information = JSON.parse(information);
	if(typeof information != "undefined" && information != null) {	
		var id = Math.floor(Math.random() * 10000).toString();
		information.push({messageId: id} )
		information = JSON.stringify(information);
		messageQueing[id] = information;

		//console.log(information.data);a=
		console.log(information.constructor);
		for(var i in collection_of_clients) {
			var client = collection_of_clients[i];

			console.log(`Sending to client with id| ${client.id}`);
			console.log(`Queued ${Object.keys(messageQueing).length} Message(s)`);
			//client.sendMessage(information);
			for(var j in messageQueing) {
				client.sendMessage(messageQueing[j]);
			}
		//	client.pipe(client);
		}
	}
	res.end();
});


socketConnection.listen(6969, function() {
	console.log(`Started SMS Gateway on port 6969`);
});

app.listen(7455, function() {
	console.log(`Started URL Router on port 7455`);
});


