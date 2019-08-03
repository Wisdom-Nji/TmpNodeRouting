const net = require('net'),JsonSocket = require('json-socket');
const {spawnSync} = require('child_process');

var host = "tbappbamenda.com";
var serverConnection = "";

//Take Terminal args here
var terminalArgs = process.argv;
//[0] = path to node, [1] = path to script, [2..] = other arguments

if(terminalArgs.length > 2) {
	console.log("Terminal Command passed!");
	for(var i = 2; i<terminalArgs.length;i++) {
		console.log(`${i}: ${terminalArgs[i]}`);
		var extensiveArgs = terminalArgs[i].split(':');

		if(extensiveArgs[0] == "--send_sms") {
			var testData = {
				number : "652156811",
				service_provider : "MTN",
				message : "Test New Client with NodeJs"
			}
			let logTestData = [];
			if(extensiveArgs.length > 1) { 
				console.log(`Sending ${extensiveArgs[1]} messages`);
				for(var j = 0; j<extensiveArgs[1];++j) 
					logTestData.push(testData);
			}
			else {
				console.log("Sending single sms...");
				logTestData.push(testData);
			}

			send_sms(logTestData);
		}
	}
	return;
}

function send_sms(data) {

	try {
		for(var i in data) {
			console.info("Processing an SMS message");
			console.info(data[i]);
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
			//console.log("Terminal output\n" + system_command.output);
			//console.log("Terminal return code: " + system_command.status);
		}
	}
	catch(error) {
		console.log("Some error occured, sending it back to server!");
		console.log(error);
		//serverConnection.sendMessage(error);
	}

}


function establishServerConnection() {
	serverConnection = new JsonSocket(net.connect(6969, host));

	//serverConnection.setKeepAlive(true, 2000);

	serverConnection.on('connect', function() {
		console.log("Connected to Afkanerd OpenOs | Main Server | Cloud Instance");
		serverConnection.sendMessage(JSON.stringify("I'm connected: Now send in those sms things"));
		serverConnection.setKeepAlive(true, 2000);
	})


	serverConnection.on('message', function(data) {
		//console.log(data);
		console.log(data);
		data = JSON.parse(data);
		//console.log(data);
		//console.log(Object.keys(data).lenth);
		//console.log(data.constructor);
		console.info(`Received command for ${data.length} message(s)`);
		//serverConnection.sendMessage(`Received command for ${data.length} message(s)`);
		serverConnection.sendMessage(JSON.stringify({
			type : "confirmation",
			messageId : data[data.length -1].messageId
		}));
		delete data[data.length -1];
		if(typeof data[data.length -1] != "undefined" && Object.keys(data[data.length -1]) == "messageId") {

			console.log(`Message ID: ${data[data.length -1].messageId}`);
			send_sms(data);
		}
	});

	serverConnection.on('end', function() {
		console.log("Ending with server!");

	});


	serverConnection.on('close', function() {
		console.log("Closing with server!");
		setTimeout(function() {
			establishServerConnection();
		}, 10000);

	});

	serverConnection.on('error', function(error) {
		console.log("Error, Going to reconnect if closed event is made");
		/*setTimeout(function() {
			console.log("Error, disconnected and trying to reconnect to server!");
			serverConnection.end();
			serverConnection = new JsonSocket(net.connect(6969, host, function() {
				console.log(`Connected to online server`);

			}));
		}, 10000);*/

	});

}

establishServerConnection();
