const net = require('net'),JsonSocket = require('json-socket');




var serverConnection = new JsonSocket(net.connect(6969, "127.0.0.1", function() {
	console.log(`Connected to online server`);

}));

serverConnection.on('message', function(data) {
	console.log(data);
	//console.log(JSON.parse(data));
});

serverConnection.on('end', function() {
	console.log("Ending with server!");
	setTimeout(function() {
		serverConnection.setTimeout(2000, function() {
			serverConnection.connect(6969, "127.0.0.1");
		});
	}, 5000);

});


serverConnection.on('close', function() {
	console.log("Closing with server!");
	setTimeout(function() {
		serverConnection.setTimeout(2000, function() {
			serverConnection.connect(6969, "127.0.0.1");
		});
	}, 5000);

});


serverConnection.on('disconnect', function(){
	console.log("Disconnected from server!!!!!");
})

serverConnection.on('error', function() {
	console.log("Error from my side!!!!");
	serverConnection.connect(6969, "127.0.0.1", function() {
		console.log("Reconnected! Let's keep it this way!");
	});
});

