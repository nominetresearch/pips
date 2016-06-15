# Installation Instructions #

## Installing node.js ##
------------------
Installing an ARM-version of Node:

    wget http://node-arm.herokuapp.com/node_latest_armhf.deb 
    sudo dpkg -i node_latest_armhf.deb

To make sure it ran correctly, run node -v. It should return the current version.

## Installing bluetooth support - required for the node.js noble package ## 
--------------------------------------------------------------------
     sudo apt-get install libusb-dev libdbus-1-dev libglib2.0-dev libudev-dev libical-dev libreadline-dev

Download and extract Bluez version 5.21

    sudo wget https://www.kernel.org/pub/linux/bluetooth/bluez-5.21.tar.xz
    sudo tar xvf bluez-5.21.tar

Go to the Bluez folder, configure and install (sudo make takes some time to process, have a cup of tea):

    cd bluez-5.21
    sudo ./configure -enable-library --disable-systemd
    sudo make
    sudo make install

Turn the RPi off, so you can plug the Bluetooth dongle, than turn it on again

    sudo shutdown -h now

You might have to power up the USB dongle:

    sudo hciconfig hci0 up

Then you can try LESCAN :

    sudo hcitool lescan

And suposing it worked properly you will be albe to connect with:

    sudo hcitool lecc BC:6A:29:AB:DE:2B
    sudo gatttool -b BC:6A:29:AB:DE:2B --interactive

    [   ][BC:6A:29:AB:DE:2B][LE]> connect
    [CON][BC:6A:29:AB:DE:2B][LE]>

Starting bluetooth at startup
   Create new file /etc/udev/rules.d/10-local.rules

Include:
    # Set bluetooth power up
    ACTION=="add", KERNEL=="hci0", RUN+="/usr/local/bin/hciconfig hci0 up"


## Installing Mosquitto ##
---------------------
    curl -O http://repo.mosquitto.org/debian/mosquitto-repo.gpg.key

    sudo apt-key add mosquitto-repo.gpg.key

    rm mosquitto-repo.gpg.key

    cd /etc/apt/sources.list.d/

    sudo curl -O http://repo.mosquitto.org/debian/mosquitto-repo.list

    sudo apt-get update

    sudo apt-get install mosquitto mosquitto-clients python-mosquitto

    sudo /etc/init.d/mosquitto stop

    sudo /etc/init.d/mosquitto start


## Installing pips-gateway package dependencies and running the service ##
--------------------------------------------------------------------
Form the pip-gateway type:

    npm install

To start the gateway type:

    npm start

To start the BLE proxy type:

    sudo node BLE_proxy.js

# Running the tests #

Most of the tests require the BLE proxy to be running.  Some require mosquitto.  

To start the BLE proxy type:

    sudo node BLE_proxy.js
    
To start mosquitto type:

    sudo /etc/init.d/mosquitto start

The test files are designed to make it easier to play with the gateway code without using physical devices.  They also provide a way to test your Pips devices.

## MQTT tests ##
-----------------------

There are three scripts to help you make sure that your MQTT broker is working properly: mqtt\_test.js, mqtt\_test\_publish.js, and mqtt\_test\_subscribe.js.

## Pip Sim ##
-----------------------

Pip sim is a simulated pip which will behave exactly like a real pip.  Use it to create a virtual pip in a terminal window which will subscribe to queues and publish messages just like a real Pip would.  You use the keyboard to act as the Pip's button.  Press any key to activate it.
It takes a single argument which is its Pip ID - this can be anything you like but you'll want to set up your other tests to expect this ID.
To start a simulated Pip with the pip ID "Pip\_1" type:

    node pip_sim.js Pip_1

## The BLE proxy test mode ##
-----------------------

There is a “debug” feature of the proxy which can be useful.  It lets you activate any Pip, bypassing the message protocol, with a keystroke.  It is handy for making sure that all the Pips are working.

As standard the keys a,b,c, and d will activate the four pips.  To activate one simply press the key while the terminal window that is running the proxy is active.

To change the sound that the Pip will play open the file BLE\_proxy.js and scroll to the very bottom.  There are a series of if statements relating to each letter to be pressed. At the end of each line you can change the value of “message” to be any number from 1 to 4.  For example:

    “message”:”4”

becomes:

    “message”:”1”

## Cycle mode ##
-----------------------

This mode cycles through all of the Pips, moving on to the next one as soon as the last is pressed.  This requires Mosquitto to be running.

To configure the sound that each Pip makes open the file pip\_test\_cycle.js and modify the values in the ‘pips’ variable as indicated by the comment in the file.  Change the IDs to be the IDs of the Pips you want to cycle through.  Of course, you can use a virtual Pip if you don't have any real ones to hand.  

For example:

    beep_preset:4

becomes:

    beep_preset:2

To run this mode type:

    sudo node pip_pong_runner.js

# Setting up and running routines #
-----------------------

Routine mode is the standard mode that the system is supposed to behave in.  Ideally this is how it should be left running when it’s not being played with.  Using the other modes when you’re expecting a routine to run will lead to confusing behaviours.

Routines are described using JSON.  Each routine consists of some information about the routine followed by the sequence of steps which are to be run.  Open pips\_routine.json to see the current routines.

The routine consists of the following values:

| Property           | Notes       |                                                    
| ------------------ |-------------|
| routine\_id        | This is a string id and needs to be unique to this routine |
| routine\_name      | Not used for anything yet|
| created\_at        | Not used for anything yet|
| updated\_at        | Not used for anything yet|
| activation\_hour   | The hour of the day to start the routine (24 hour clock)|
| activation\_minute | The minute of the above hour to start the routine (single digit minutes do not need a leading zero.  i.e. use "5" not "05")|
| repeat\_schedule   | The days of the week on which to run this routine, separated by commas.  Monday = 1, Tuesday = 2 etc.  For example: [1,2,4,5]|

There is then an arrary of steps:

| Property           | Notes       |                                                  
| ------------------ |-------------|
| step\_id           | A number - must be unique|
| pip\_id            | The ID of the pip that you want to activate|
| delay              | How long (in seconds) the pip should wait before starting once the step begins|
| priority           | Steps are executed in order of priority, highest first.|
| beep\_preset       | The sound preset that the pip should make.|
| message            | Messages are pushed to a specific queue called "message".  They are intended to provide a way of inspecting the routine in a human readable way.

You can add as many steps as you please and reuse pips in any order you choose.

Each step can also have an alert which will trigger if the step is not completed by a given time

| Property           | Notes       |  
| ------------------ |-------------|
| timeout            | The time in seconds after which this alert will be triggered|
| mobile number      | Not used for anything yet - one day it would be cool if a missed Pip triggered a text message
| message            | The message payload for the alert

To run the configured routines type:

    sudo node main.js
    
or:

    npm start