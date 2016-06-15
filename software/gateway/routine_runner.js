var mqtt = require('mqtt');

var currentTimeout = null;

module.exports = function runRoutine(routineConfig, callback){

	var stepArray = routineConfig.steps;

	//Order the array of steps by priority
	stepArray.sort(function(a, b){return b.priority-a.priority});

	console.log('Starting routine ' + routineConfig.routine_id);

	var currentStep = 0;

	//Activate the first pip
	currentTimeout = runStep(stepArray[currentStep]);
	console.log('currentTimeout ' + currentTimeout);

	//Start listening to the acknowledge queue
	client = mqtt.createClient(1883, 'localhost');
	client.subscribe('acknowledge');

	//When an acknowledgement message is received...
	client.on('message', function (topic, message) {
		console.log('message: ' + message);

		//If there are steps left to run, run the next step

		if(currentStep < stepArray.length-1){

			clearTimeout(currentTimeout);

			currentStep++;
			setTimeout(function(){
				currentTimeout = runStep(stepArray[currentStep]);
			}, stepArray[currentStep].delay*1000);

		} else {
			//else close the client and finish
			clearTimeout(currentTimeout);
			client.end();
			console.log('Completed routine ' + routineConfig.routine_id);
			//Send a blank message to clear the screen
			postMessage('- clear screen -');
		}
	});

 	callback(null, true);
 }

function runStep(stepData){

//Step data looks like this:
// {
//     "step_id": 0,
//     "pip_id": 0,
//     "delay": 0,
//     "priority": 1000,
//     "beep_preset": 5,
//     "alert": {
//         "timeout": 90,
//         "mobile_number": "07839960888",
//         "message": "Alert! Time for tea!"
//     }
// }

	//Send call to the pip to activate
	activatePip(stepData.pip_id, stepData.beep_preset);

	//If there is a message assigned to the pip then display it
	if(stepData.hasOwnProperty('message')){
		messageContent = stepData.message;
		postMessage(messageContent);
	} 

	//If there is an alert and the timeout elapses then alert
	if(stepData.hasOwnProperty('alert')){

		alertConfig = stepData.alert;
		console.log('Setting alert for pip ' + stepData.pip_id + ' with timeout ' + alertConfig.timeout);
		var timerId = setTimeout(function(){alert(alertConfig.mobile_number, alertConfig.message)}, alertConfig.timeout*1000);

	} else {
		//By default we set a 60 second timeout
		var timerId = setTimeout(function(){console.log('Pip ' +stepData.pip_id+ ' response timed out!')}, 60000);
	}

	return timerId;

}


function activatePip(pipId, beep_interval){
	console.log('activating pip ' + pipId);
	activateClient = mqtt.createClient(1883, 'localhost');
	activateClient.publish('activate_'+pipId.toString(), beep_interval.toString());
	activateClient.end();
}

function postMessage(messageContent){
	messageClient = mqtt.createClient(1883, 'localhost');

	messageClient.publish('message', messageContent);
	messageClient.end();
}

function alert(mobileNumber, message){
	console.log('Alert Activated: ' + message);
}
