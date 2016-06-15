/*
Routines are set up to run at a given time but they can also be run by sending the routine ID to the 'run_routine' topic
 */

var args = process.argv;
var user_id = args[2];
var mqtt = require('mqtt');

var schedule = require('node-schedule');
var rl = require('./routine_loader');
var rr = require('./routine_runner');

rl(user_id, function(err, data){

	if(err){
		console.log('Oh pants - it has all gone wrong! ' + err.toString());
	}

	var routineConfig = JSON.parse(data);
	var routines = routineConfig.routines;

	//Set up all of the automatic routines
	for (var index = 0; index<routines.length; index++){
		(function(i){
			var rule = new schedule.RecurrenceRule();
			var routine = routines[i];

			rule.dayOfWeek = routine.repeat_schedule;
			rule.hour = routine.activation_hour;
			rule.minute = routine.activation_minute;

			console.log('Setting up routine ' + routines[i].routine_id + ' with start time ' + routine.activation_hour + ':' + routine.activation_minute);

			schedule.scheduleJob(rule, function(){

				rr(routines[i], function(error, success){
					if(err){ console.log('Oh pants - it has all gone wrong! ' + err.toString());}
				});
			});
		})(index)
	}

	//Listen for messages and activate the relevant routine
	client = mqtt.createClient(1883, 'localhost');
	client.subscribe('run_routine');
	
	client.on('message', function (topic, message) {
		console.log('message: ' + message);

		for (var index = 0; index<routines.length; index++){

			var routine = routines[index];
			var routineId = routine.routine_id;
			if(routineId == message){
				rr(routine, function(error, success){
					if(err){ console.log('Oh pants - it has all gone wrong! ' + err.toString());}
				});
				break;
			}
		}
	});
});