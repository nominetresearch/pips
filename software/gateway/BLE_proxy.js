/*jslint node: true */
"use strict";
var mqtt = require('mqtt')
var util = require('util');

var stdin = process.stdin;
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');

var noble = require('noble');
var exitHandlerBound = false;
var maxPeripherals = 4;
var pips = [];

function PipDevice(dev, cli) {
    this.device = dev;
    this.client = cli;
    this.topic = '';
}

var StatusCode = {
    ON: 1,
    OFF: 0,
    UNKNOWN: 3
};

var connect = function (err) {
    if (err) throw err;
    console.log("Connection to " + this.peripheral.uuid);
    peripherals[peripherals.length] = this.peripheral;

    if (peripherals.length >= maxPeripherals) {
        console.log("Stopping BLE scan. Reached " + maxPeripherals + " peripherals");
        noble.stopScanning();
    }

    if (!exitHandlerBound) {
        exitHandlerBound = true;
        process.on('SIGINT', exitHandler);
    }

    this.peripheral.discoverServices([], setupService);
};

//Activation Message
var sendActivationMessage = function (err) {
    if (err) throw err;

    console.log("Connection to " + this.peripheral.uuid + " with message " + this.message);
    if (!exitHandlerBound) {
        exitHandlerBound = true;
        process.on('SIGINT', exitHandler);
    }

    this.peripheral.discoverServices([], setupServiceActivationMessage.bind({'message': this.message}));
};

var setupServiceActivationMessage = function (err, services) {
    console.log("this = " + Object.keys(this).toString());
    var message = this.message;
    if (err) throw err;
    services.forEach(function (service) {
        if (service.uuid === 'a495ff20c5b14b44b5121370f02d74de') {
            console.log("found scratch UUID");
            var characteristicUUIDs = ["a495ff21c5b14b44b5121370f02d74de", "a495ff22c5b14b44b5121370f02d74de"];
            service.discoverCharacteristics(characteristicUUIDs, function (error, characteristics) {
                console.log("got characteristics" + characteristics);
                requestNotify(characteristics[0]); //this is the first scratch characteristic.

                var msg = new Buffer(3);
                msg.writeUInt8(StatusCode.ON, 0);
                msg.writeUInt8(parseInt(message, 10), 1);
                msg.writeUInt8(5, 2);
                characteristics[1].write(msg, false, function (err) {
                    if (err) {
                        console.log("error sending message to pip");
                    }
                });
            });
        }
    });
};

var requestNotify = function (characteristic) {
    characteristic.on('read', function (data, isNotification) {

        pips[this._peripheralId].pipKnownStatus = data[0];

        if (data[0] == 1) {
            //pips[this._peripheralUuid].client.publish('acknowledge', 'active_'+this._peripheralUuid);
        }

        if (data[0] == 0) {
            pips[this._peripheralId].client.publish('acknowledge', 'acknowledge_' + this._peripheralId);
            pips[this._peripheralId].device.disconnect(function () {
                console.log('Disconnected');
            });
        }
    });

    characteristic.notify(true, function (error) {
        console.log('turned on notifications ' + (error ? ' with error' : 'without error'));
    });
}

var discover = function (peripheral) {
    if (peripheral.advertisement.localName && peripheral.advertisement.localName.indexOf('PIP') > -1) {
        console.log("(scan)found:" + peripheral.advertisement.localName + " - UUID: " + peripheral.uuid);

        var topic = 'activate_' + peripheral.uuid;
        var client = mqtt.connect('localhost:1183');

        client.subscribe(topic);

        pips[peripheral.uuid] = new PipDevice(peripheral, client);
        pips[peripheral.uuid].topic = topic;

        console.log('MQTT client for pip: ' + peripheral.uuid + ' subscribed to topic ' + pips[peripheral.uuid].topic);

        pips[peripheral.uuid].client.on('message', function (topic, message) {

            console.log('MQTT Client connecting to PIP with uuid = ' + topic + ' and message = ' + message);
            var uuid = topic.replace('activate_', '');
            var device = pips[uuid].device;

            pips[uuid].device.connect(sendActivationMessage.bind({peripheral: device, 'message': message}));
        });
    }
};

noble.on('discover', discover);

//Limit to devices having the service UUID below - which all Beans have
noble.on('stateChange', function (state) {
    console.log('STATE: ' + state);
    if (state === 'poweredOn') {

        noble.startScanning(['a495ff10c5b14b44b5121370f02d74de'], false);
    }
});

stdin.on('keypress', function (chunk, key) {
    process.stdout.write('Get Chunk: ' + chunk + '\n');
    if (key && key.ctrl && key.name == 'c') process.exit();
});


var exitHandler = function exitHandler() {
    peripherals.forEach(function (peripheral) {
        console.log('Disconnecting from ' + peripheral.uuid + '...');
        peripheral.disconnect(function () {
            console.log('disconnected');
        });
    });

    //end process after 2 more seconds
    setTimeout(function () {
        process.exit();
    }, 2000);
}

// Start any pip directly from the keyboard.  Modify the UUIDs here to bind key presses to devices. (Useful for testing)
stdin.on('data', function (key) {
    // ctrl-c ( end of text )
    if (key === '\u0003') {
        process.exit();
    }

    var keyBindings = {
        'a': 'e942423226034616891a9eb67144a671',
        'b': '9b70a72b457745fbab3c14c64066e260',
        'c': '69606114583845a29af6088a3a61f0c1',
        'd': '4713ad25849446089201394b7bb8a623'
    };

    var keys = Object.keys(keyBindings);

    if (keys.indexOf(key) != -1) {
        console.log('connecting to PIP with uuid = ' + keyBindings[key]);
        pips[keyBindings[key]].device.connect(sendActivationMessage.bind({
            peripheral: pips[keyBindings[key]].device,
            "message": "4"
        }));
    }

});

//so the program will not close instantly
process.stdin.resume();
