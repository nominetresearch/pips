/*
Subscribe to a topic and print out messages that it receives
 */

var mqtt = require('mqtt')

client = mqtt.createClient(1883, 'localhost');

client.subscribe('acknowledge');

client.on('message', function (topic, message) {
    console.log(message);
});
