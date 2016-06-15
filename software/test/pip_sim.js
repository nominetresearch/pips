/*
Pip sim is a simulated pip which will behave exactly like a real pip.  Press any key to activate it.
It takes a single argument which is its pip ID - this can be anything you like.
Run like this: node pip_sim.js Pip_1
 */

var mqtt = require('mqtt')
var args = process.argv;
var pipId = args[2];

var beep = require('beepbeep');

client = mqtt.createClient(1883, 'localhost');

var topic = 'activate_'+pipId.toString();
client.subscribe(topic);
console.log('subscribed to topic ' + topic);

client.on('message', function (topic, message) {

	console.log('recieved activation - ' + message);
	console.log('Beep!');
	beep();

	var intervalId = setInterval(function(){
		console.log('Beep!');
		beep();
	}, Number(message)*1000);

  	process.stdin.resume();
	process.stdin.setEncoding('utf8');

	process.stdin.once('data', function (text) {
		console.log('pip ' + pipId.toString() + ' acknowledgment sent')
		client.publish('acknowledge', 'acknowledge_'+pipId.toString());
		done();
	});

	function done() {
		clearInterval(intervalId);
	}

});





