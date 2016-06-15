/*
A little bit of code to test that your MQTT broker is working
 */

var mqtt = require('mqtt')

client = mqtt.createClient(1883, 'localhost');

client.subscribe('activate');
client.publish('activate', 'Hello mqtt');

client.on('message', function (topic, message) {
  console.log(message);
});

client.end();