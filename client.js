const net = require('net'),JsonSocket = require('json-socket');
const {spawnSync} = require('child_process');

var host = "tbappbamenda.com";


var serverConnection = new JsonSocket(net.connect(6969, host, function() {
	console.log(`Connected to online server`);

}));

serverConnection.on('message', function(data) {
	//console.log(data);
	data = JSON.parse(data);
	//console.log(data);
	//console.log(Object.keys(data).lenth);
	//console.log(data.constructor);
	console.info(`Received command for ${data.length} message(s)`);
	for(var i in data) {
		console.info("Processing an SMS message");
		//console.info(data[i]);
		var number = data[i].number;
		var group = data[i].service_provider.toUpperCase();
		var message = data[i].message + "\n\nPowered by Afkanerd OpenOs";
		var _class = "1";
		const system_command = spawnSync('afsms', [
			'--send',
			'--number',number,
			'--message',message,
			'--group',group,
			'--class',_class
		]);
		console.log("Terminal output\n" + system_command.output);
		console.log("Terminal return code: " + system_command.status);
	}
	//console.log(JSON.parse(data));
});

serverConnection.on('end', function() {
	console.log("Ending with server!");
	/*setTimeout(function() {
		console.log("Ended, and trying to reconnect to server!");
		serverConnection.end();
		serverConnection = new JsonSocket(net.connect(6969, host, function() {
			console.log(`Connected to online server`);

		}));
	}, 10000);*/

});


serverConnection.on('close', function() {
	console.log("Closing with server!");
	setTimeout(function() {
		console.log("Closed, and trying to reconnect to server!");
		serverConnection.end();
		serverConnection = new JsonSocket(net.connect(6969, host, function() {
			console.log(`Connected to online server`);

		}));
	}, 10000);

});


serverConnection.on('disconnect', function(){
	setTimeout(function() {
		console.log("Disconnected, and trying to reconnect to server!");
		serverConnection.end();
		serverConnection = new JsonSocket(net.connect(6969, host, function() {
			console.log(`Connected to online server`);

		}));
	}, 10000);

})

serverConnection.on('error', function(error) {
	setTimeout(function() {
		console.log("Error, disconnected and trying to reconnect to server!");
		serverConnection.end();
		serverConnection = new JsonSocket(net.connect(6969, host, function() {
			console.log(`Connected to online server`);

		}));
	}, 10000);

});

