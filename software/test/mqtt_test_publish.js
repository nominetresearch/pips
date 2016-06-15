/*
Connect to the MQTT broker and publish two messages to two topics
 */

var mqtt = require('mqtt')

client = mqtt.createClient(1883, 'localhost');

client.publish('activate', '3');
client.publish('message', 'THIS IS A TEST MESSAGE');

client.end();