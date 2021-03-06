const net = require('net'),JsonSocket = require('json-socket');
const {spawnSync} = require('child_process');
const fs = require('fs');

var host = "tbappbamenda.com";
var serverConnection = "";

//Take Terminal args here
var terminalArgs = process.argv;
//[0] = path to node, [1] = path to script, [2..] = other arguments

let LOG_FILE = process.env.HOME + "/.afsms/sample_log_file.js";
let LOCK_FILE = process.env.HOME + "/.afsms/def.lock";
let master_buffer = [];

if(terminalArgs.length > 2) {
	console.log("Terminal Command passed!");
	for(var i = 2; i<terminalArgs.length;i++) {
		console.log(`${i}: ${terminalArgs[i]}`);
		var extensiveArgs = terminalArgs[i].split(':');

		if(extensiveArgs[0] == "--send_sms") {
			var testData = {
				number : "652156811",
				service_provider : "MTN",
				message : "NewDev1\n2019-08-14\n23634\nAUTOMATED AFKANERD USER\nFCs Test Region\, TSV1\nAFB\, TB LAMP - Negative\n1234\nXpert\, not done\n1234\n\nPlease call 670656041 if you have any questions/Svp appelez 670656041 si vous avez des questions\n\nPowered by Afkanerd OpenOs"
				//message : `${new Date().toDateString()} ${new Date().toTimeString()}`
			}
			let logTestData = [];
			if(extensiveArgs.length > 1) { 
				console.log(`Sending ${extensiveArgs[1]} messages`);
				if(master_buffer.length > 1) {
					for( i in master_buffer) writeToLog(master_buffer[i]);
					master_buffer = [];
				}
				for(var j = 0; j<extensiveArgs[1];++j) {
					if(fs.existsSync(LOCK_FILE)) {
						console.log("[MASTER BUFFER]");
						master_buffer.push(testData);
						continue;
					}
					else {
						let message = `${j} ${testData.message}`;
						let defTestMessage = testData.message;
						testData.message = message;
						writeToLog(testData);
						logTestData.push(testData);
						testData.message = defTestMessage;
					}
				}
			}
			else {
				console.log("Sending single sms...");
				logTestData.push(testData);
			}

			//send_sms(logTestData);
			//writeToLog(logTestData);
		}
	}
	return;
}

function send_sms(data) {

	try {
		for(var i in data) {
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
			console.log("Sent...");
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

function writeToLog(data) {
	return new Promise(resolve => {
		data["log_timestamp"] = new Date();
		let stream = fs.createWriteStream(LOG_FILE, {flags:'a'});
		stream.write(JSON.stringify(data));
		stream.end();
	});
}



function establishServerConnectionUpdate() {
	serverConnection = new JsonSocket(net.connect(9999, host));

	//serverConnection.setKeepAlive(true, 2000);

	serverConnection.on('connect', function() {
		console.log("[EVENT] : Connected to Afkanerd OpenOs | Update Server | Cloud Instance");
		serverConnection.sendMessage(JSON.stringify("I'm connected: Now send in those sms things"));
		serverConnection.setKeepAlive(true, 2000);
		console.log(`[ADDRESS] : ${serverConnection.remoteAddress}`);
	})
}


function establishServerConnection() {
	serverConnection = new JsonSocket(net.connect(6969, host));

	//serverConnection.setKeepAlive(true, 2000);

	serverConnection.on('connect', function() {
		console.log("[EVENT] : Connected to Afkanerd OpenOs | Main Server | Cloud Instance");
		serverConnection.sendMessage(JSON.stringify("I'm connected: Now send in those sms things"));
		serverConnection.setKeepAlive(true, 2000);
		console.log(`[ADDRESS] : ${serverConnection.remoteAddress}`);
	})


	serverConnection.on('message', function(data) {
		//console.log(data);
		data = JSON.parse(data);
		console.log(`[EVENT]: Message - ${data.length}`);
		serverConnection.sendMessage(JSON.stringify({
			type : "confirmation",
			messageId : data[data.length -1].messageId
		}));
		if(master_buffer.length > 1) {
			//TODO: create lock to stop program from reading file while write begins
			for(i in master_buffer) writeToLog( master_buffer[i] );
		}
		if(typeof data[data.length -1] != "undefined" && Object.keys(data[data.length -1]) == "messageId") {
			console.log(`Message ID: ${data[data.length -1].messageId}`);
			delete data[data.length -1];
			if(fs.existsSync( LOCK_FILE )) {
				for(i in data) master_buffer.push( data[i] );
				console.log("[SYSTEM]: SYSTEM LOCKED, PENDING ...");
			//	continue;
			}
			else {
				console.log("[SYSTEM]: NOT LOCKED!");
				for(i in data ) writeToLog(data[i]);
			}
		}
	});

	serverConnection.on('end', function() {
		console.log("[EVENT] : Ending with server!");

	});


	serverConnection.on('close', function() {
		console.log("[EVENT] : Closing with server!");
		setTimeout(function() {
			establishServerConnection();
		}, 10000);

	});

	serverConnection.on('error', function(error) {
		console.log("[EVENT] : Error, Going to reconnect if closed event is made");
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
//establishServerConnectionUpdate();
