# Pips - Guiding people through their daily routines #
----------------------

We want to help people with cognitive or sensory impairment who have difficulty organising their daily routines.  We want to offer them greater independence, make their lives more manageable, and ease the burden on care providers.

You can read more about the project in [this blog post](http://www.nominet.uk/researchblog/how-to-build-your-own-smart-iot-buttons/).

----------------------

A Pip is a round button the size of jam jar lid that lights up and beeps.  They are placed around the home in order to guide users through the sequence of tasks that make up their daily routine.  A typical routine might be: Wake up, take a shower, get dressed, feed the cat, have a cup of tea.  Each step would have an accompanying Pip placed nearby.

The Pips system is designed to be simple, flexible, unobtrusive, and connected.

*Simple* - Each Pip corresponds to a single task.  A Pip lights up and beeps to show that a task needs to be done.  Once the Pip is pressed it turns off and the next Pip in the routine is activated.

*Flexible* - Pips are customisable.  A variety of colours should be available along with relevant icons or text as a reminder of the task.  For example a Pip in the bathroom can be blue with a toothbrush icon.  Their type of beeping can also be configured.  Pips can be combined to suit the user's existing daily routine and the system can be extended and adapted as the user’s condition changes.  Routines are set up in a simple JSON file.

*Unobtrusive* - Pips can be considered to be little light-up alarm clocks that reset daily. They provide guidance but allow for plenty of flexibility in a routine.

*Connected* -  The Pips system can be extended to alert care providers via email or text message if any part of the routine isn't completed.  For example, if the cat hasn’t been fed the system can send a text message to a neighbour asking to drop in and help.

# The Pips Prototype #
----------------------

This prototype is built around the Light Blue Bean microcontroller. The Light Blue Bean is a Bluetooth low energy enabled prototyping board.  It waits in a low powered idle mode until a message is received.  Upon receiving a message it will wake up and activate the buzzer and LED according to the message payload.  When the switch is pressed it will send a message to say that event has occurred before returning to idle mode.

Additionally the system requires a ‘gateway’ which runs the software to coordinate Pip behaviour. This can be a laptop or a Raspberry Pi.

Software:

+ The Light Blue Bean code is written in C and runs an arduino sketch
+ The hub code is written in node.js and runs routines which can be configured in JSON
+ Message handling between the hub and pips is done through MQTT. Mosquito runs on the hub device to act as an MQTT broker.
+ A proxy (written in node.js) handles communication between the queues and the Pips via bluetooth.

# Contents of this repository #
-----------------------

## Software ##

All of the software required to make this system work.

### pip ###
The software that runs on the Pip device.

### gateway ###
The software which runs on a raspberry pi to coordinate the behaviour of Pips via bluetooth.

### test ###
Several scripts that will make it easier to test your gateway setup and your Pips devices.

## Hardware ##

This folder contains instructions and resources for building Pips.

### casing ###
The design for the casing which can be 3D printed.

### wiring diagram ###
An image and fritzing file that describes the circuit diagram for a Pip.

### Pips Construction Manual ###
A guide with plenty of pictures describing how to assemble a Pip.