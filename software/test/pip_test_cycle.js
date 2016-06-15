/*
The pip test cycle will iterate through the pips configured in the "pips" variable below.

Modify this line to configure the sounds the various Pips devices make.  Change the numerical value of each beep_preset
to the preset sound you would like.  If the number does not exist the default (1) is used.

*/
var mqtt = require('mqtt');

var pips = [{id:'e942423226034616891a9eb67144a671',beep_preset:1},{id:'69606114583845a29af6088a3a61f0c1',beep_preset:2}
    ,{id:'4713ad25849446089201394b7bb8a623',beep_preset:4}];

var currentPip = 0;

console.log('Starting routine pip pong');

//Activate the first pip
activatePip(pips[currentPip].id, pips[currentPip].beep_preset);
console.log('activated first Pip');

//Start listening to the acknowledge queue
client = mqtt.createClient(1883, 'localhost');
client.subscribe('acknowledge');

client.on('message', function (topic, message) {
	console.log('message: ' + message);

    if (currentPip >= pips.length-1){
        currentPip = 0;
    } else {
        currentPip++;
    }

    activatePip(pips[currentPip].id, pips[currentPip].beep_preset);

});

function activatePip(pipId, beep_preset){
	console.log('activating pip ' + pipId);
	activateClient = mqtt.createClient(1883, 'localhost');
	//The name of the topic corresponds to the UUID of the device
	activateClient.publish('activate_'+pipId.toString(), beep_preset.toString());
	activateClient.end();
}
